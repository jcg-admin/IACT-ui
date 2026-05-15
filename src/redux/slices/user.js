/**
 * user.slice — IACT v2
 * Sincronizado con userGateway v2 (T2.2 + T3.4).
 *
 * CORREGIDOS:
 *   createUser   → userService.createUser() → POST /api/users/create/ (no /api/users/)
 *   deactivateUser → userService.deactivateUser() → POST /api/users/{id}/deactivate/
 *
 * AÑADIDOS (7):
 *   fetchUserDetail, patchUser, activateUser,
 *   deleteUser, resetPassword, blockUser, unblockUser
 */
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import userService from '../../services/userGateway'

const rw = (fn) => async (arg, { rejectWithValue }) => {
  try { return await fn(arg) }
  catch (e) { return rejectWithValue({ message: e.message, statusCode: e.response?.status ?? null }) }
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk('users/fetchUsers',
  rw((filters = {}) => userService.getUsers(filters)))

export const fetchUserDetail = createAsyncThunk('users/fetchUserDetail',
  rw((id) => userService.getUserDetail(id)))

/** POST /api/users/create/ — UC_USR_01 */
export const createUser = createAsyncThunk('users/createUser',
  rw((data) => userService.createUser(data)))

/** PUT /api/users/{id}/ — reemplazo completo */
export const updateUser = createAsyncThunk('users/updateUser',
  rw(({ id, data }) => userService.updateUser(id, data)))

/** PATCH /api/users/{id}/ — actualización parcial (UC_USR_03) */
export const patchUser = createAsyncThunk('users/patchUser',
  rw(({ id, data }) => userService.patchUser(id, data)))

/** POST /api/users/{id}/activate/ */
export const activateUser = createAsyncThunk('users/activateUser',
  rw((id) => userService.activateUser(id)))

/**
 * POST /api/users/{id}/deactivate/ — baja lógica UC_USR_04.
 * Corregido: era DELETE /api/users/{id}/ en v4.0
 */
export const deactivateUser = createAsyncThunk('users/deactivateUser',
  rw((id) => userService.deactivateUser(id)))

/** DELETE /api/users/{id}/ — baja lógica BR-009 explícita */
export const deleteUser = createAsyncThunk('users/deleteUser',
  rw((id) => userService.deleteUser(id)))

/** POST /api/users/{id}/reset-password/ — UC_AUTH_03 */
export const resetPassword = createAsyncThunk('users/resetPassword',
  rw((id) => userService.resetUserPassword(id)))

/** POST /api/users/{id}/block/ — UC_USR_05 */
export const blockUser = createAsyncThunk('users/blockUser',
  rw((id) => userService.blockUser(id)))

/** POST /api/users/{id}/unblock/ — UC_USR_06 */
export const unblockUser = createAsyncThunk('users/unblockUser',
  rw((id) => userService.unblockUser(id)))

// ── Slice ────────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'user',
  initialState: {
    users:       [],
    userDetail:  null,
    loading:     false,
    actionLoading: false,
    error:       null,
    total:       0,
    isAuthenticated: false,
    user:        null,
  },
  reducers: {
    setUser:    (s,a) => { s.isAuthenticated = true; s.user = a.payload },
    logout:     (s)   => { s.isAuthenticated = false; s.user = null; s.users = []; s.total = 0 },
    setLoading: (s,a) => { s.loading = a.payload },
    setError:   (s,a) => { s.error = a.payload },
    clearError: (s)   => { s.error = null },
  },
  extraReducers: (builder) => {
    const lp = (s) => { s.loading = true;  s.error = null }
    const lf = (s) => { s.loading = false }
    const lr = (s,a) => { s.loading = false; s.error = a.payload }
    const ap = (s) => { s.actionLoading = true;  s.error = null }
    const af = (s) => { s.actionLoading = false }
    const ar = (s,a) => { s.actionLoading = false; s.error = a.payload }

    builder
      .addCase(fetchUsers.pending,   lp)
      .addCase(fetchUsers.fulfilled, (s,a) => { lf(s); const p = a.payload; s.users = p?.results ?? p ?? []; s.total = p?.count ?? s.users.length })
      .addCase(fetchUsers.rejected,  lr)

      .addCase(fetchUserDetail.pending,   lp)
      .addCase(fetchUserDetail.fulfilled, (s,a) => { lf(s); s.userDetail = a.payload })
      .addCase(fetchUserDetail.rejected,  lr)

      .addCase(createUser.pending,   lp)
      .addCase(createUser.fulfilled, (s,a) => { lf(s); s.users.push(a.payload); s.total += 1 })
      .addCase(createUser.rejected,  lr)

      .addCase(updateUser.fulfilled, (s,a) => {
        const idx = s.users.findIndex(u => u.id === a.payload?.id)
        if (idx >= 0) s.users[idx] = a.payload
        if (s.userDetail?.id === a.payload?.id) s.userDetail = a.payload
      })

      .addCase(patchUser.fulfilled, (s,a) => {
        const idx = s.users.findIndex(u => u.id === a.payload?.id)
        if (idx >= 0) s.users[idx] = { ...s.users[idx], ...a.payload }
        if (s.userDetail?.id === a.payload?.id) s.userDetail = { ...s.userDetail, ...a.payload }
      })

      .addCase(activateUser.pending,   ap)
      .addCase(activateUser.fulfilled, (s,a) => { af(s); const idx = s.users.findIndex(u => u.id === a.payload?.id); if (idx >= 0) s.users[idx] = { ...s.users[idx], ...a.payload } })
      .addCase(activateUser.rejected,  ar)

      .addCase(deactivateUser.pending,   ap)
      .addCase(deactivateUser.fulfilled, (s,a) => { af(s); const id = a.payload?.target_user_id ?? a.payload?.id; const idx = s.users.findIndex(u => u.id === id); if (idx >= 0) s.users[idx] = { ...s.users[idx], ...a.payload } })
      .addCase(deactivateUser.rejected,  ar)

      .addCase(deleteUser.pending,   ap)
      .addCase(deleteUser.fulfilled, (s,a) => { af(s); const id = a.payload?.id ?? a.meta?.arg; s.users = s.users.filter(u => u.id !== id) })
      .addCase(deleteUser.rejected,  ar)

      .addCase(resetPassword.pending,   ap)
      .addCase(resetPassword.fulfilled, af)
      .addCase(resetPassword.rejected,  ar)

      .addCase(blockUser.pending,   ap)
      .addCase(blockUser.fulfilled, (s,a) => { af(s); const idx = s.users.findIndex(u => u.id === a.payload?.id); if (idx >= 0) s.users[idx] = { ...s.users[idx], ...a.payload } })
      .addCase(blockUser.rejected,  ar)

      .addCase(unblockUser.pending,   ap)
      .addCase(unblockUser.fulfilled, (s,a) => { af(s); const idx = s.users.findIndex(u => u.id === a.payload?.id); if (idx >= 0) s.users[idx] = { ...s.users[idx], ...a.payload } })
      .addCase(unblockUser.rejected,  ar)
  },
})

export const { setUser, logout, setLoading, setError, clearError } = usersSlice.actions

const sel = (s) => s.user
export const selectUsers         = createSelector(sel, (s) => s.users)
export const selectUserDetail    = createSelector(sel, (s) => s.userDetail)
export const selectUsersLoading  = createSelector(sel, (s) => s.loading)
export const selectActionLoading = createSelector(sel, (s) => s.actionLoading)
export const selectUsersError    = createSelector(sel, (s) => s.error)
export const selectUsersTotal    = createSelector(sel, (s) => s.total)

export default usersSlice.reducer
