/**
 * Users Slice
 *
 * Gestión de estado para usuarios del sistema.
 * Incluye thunks RTK para operaciones CRUD y baja lógica.
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import userService from '../../services/userGateway'

// ── Thunks ──────────────────────────────────────────────────────────────────

/** Obtiene la lista de usuarios aplicando filtros opcionales. */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await userService.getUsers(filters)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Crea un nuevo usuario en el sistema. */
export const createUser = createAsyncThunk(
  'users/createUser',
  async (data, { rejectWithValue }) => {
    try {
      return await userService.createUser(data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Actualiza los datos de un usuario existente. */
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/**
 * Baja lógica: cambia el status del usuario a INACTIVE.
 * No elimina el registro — UC-USR-04.
 */
export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.deactivateUser(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Slice ────────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    loading: false,
    error: null,
    total: 0,
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
      const idx = state.users.findIndex(u => u.id === action.payload.id)
      if (idx >= 0) state.users[idx] = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.users = []
      state.total = 0
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        // La API retorna respuesta paginada {count, results} (UC-USR-02)
        const payload = action.payload
        state.users = payload.results ?? payload
        state.total = payload.count ?? (payload.results ?? payload).length
        state.loading = false
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
        state.total += 1
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // updateUser
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id)
        if (idx >= 0) state.users[idx] = action.payload
      })

    // deactivateUser — baja lógica UC-USR-04: backend retorna { target_user_id, state: 'ELIMINATED' }
    builder
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const targetId = action.payload.target_user_id ?? action.payload.id
        const idx = state.users.findIndex(u => u.id === targetId)
        if (idx >= 0) state.users[idx] = { ...state.users[idx], ...action.payload, id: targetId }
      })
  },
})

export const { setUser, logout, setLoading, setError } = usersSlice.actions

// ── Selectores ───────────────────────────────────────────────────────────────

const selectUsersState = (state) => state.user

export const selectUsers = createSelector(selectUsersState, (s) => s.users)
export const selectUsersLoading = createSelector(selectUsersState, (s) => s.loading)
export const selectUsersError = createSelector(selectUsersState, (s) => s.error)
export const selectUsersTotal = createSelector(selectUsersState, (s) => s.total)

export default usersSlice.reducer
