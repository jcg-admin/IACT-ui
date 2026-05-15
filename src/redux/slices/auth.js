/**
 * auth.js slice — IACT v2
 *
 * Todos los thunks delegan al authGateway — ningún thunk llama apiService directamente.
 *
 * SECURITY:
 *   - Los tokens NO se guardan en Redux ni en localStorage.
 *   - El backend configura httpOnly cookies en el login.
 *   - Solo se guarda datos de usuario (sin información sensible).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authGateway from '@api/authGateway'
import { clearSession } from './session'

// ── Thunks ───────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      return await authGateway.login(username, password)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await authGateway.logout()
      dispatch(clearSession())
      return null
    } catch (error) {
      // Logout local aunque falle el backend
      dispatch(clearSession())
      return null
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authGateway.getCurrentUser()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const recoverPassword = createAsyncThunk(
  'auth/recoverPassword',
  async (username, { rejectWithValue }) => {
    try {
      return await authGateway.resetPassword(username)
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Error al recuperar contraseña', statusCode: null })
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      return await authGateway.changePassword(currentPassword, newPassword)
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Error al cambiar contraseña', statusCode: null })
    }
  }
)

export const fetchActiveSessions = createAsyncThunk(
  'auth/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      return await authGateway.getActiveSessions()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const revokeSession = createAsyncThunk(
  'auth/revokeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await authGateway.revokeSession(sessionId)
      return sessionId
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)


export const fetchOwnSessions = createAsyncThunk(
  'auth/fetchOwnSessions',
  async (_, { rejectWithValue }) => {
    try { return await authGateway.getOwnSessions() }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const closeSessionAction = createAsyncThunk(
  'auth/closeSession',
  async (sessionId, { rejectWithValue }) => {
    try { await authGateway.closeSession(sessionId); return sessionId }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const closeAllSessionsAction = createAsyncThunk(
  'auth/closeAllSessions',
  async (_, { rejectWithValue }) => {
    try { return await authGateway.closeAllSessions() }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchMyMenu = createAsyncThunk(
  'auth/fetchMyMenu',
  async (_, { rejectWithValue }) => {
    try { return await authGateway.getMyMenu() }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessions: [],
    ownSessions: [],
    myMenu: [],
    sessionsLoading: false,
    sessionsError: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending,    (state) => { state.isLoading = true; state.error = null })
      .addCase(loginUser.fulfilled,  (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(loginUser.rejected,   (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected,  (state) => {
        state.user = null
        state.isAuthenticated = false
      })

      // GetCurrentUser
      .addCase(getCurrentUser.pending,   (state) => { state.isLoading = true })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
      })
      .addCase(getCurrentUser.rejected,  (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
      })

      // RecoverPassword
      .addCase(recoverPassword.pending,   (state) => { state.isLoading = true; state.error = null })
      .addCase(recoverPassword.fulfilled, (state) => { state.isLoading = false })
      .addCase(recoverPassword.rejected,  (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ChangePassword
      .addCase(changePassword.pending,   (state) => { state.isLoading = true; state.error = null })
      .addCase(changePassword.fulfilled, (state) => { state.isLoading = false })
      .addCase(changePassword.rejected,  (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Sessions
      .addCase(fetchActiveSessions.pending,    (state) => { state.sessionsLoading = true; state.sessionsError = null })
      .addCase(fetchActiveSessions.fulfilled,  (state, action) => {
        state.sessions = action.payload
        state.sessionsLoading = false
      })
      .addCase(fetchActiveSessions.rejected,   (state, action) => {
        state.sessionsLoading = false
        state.sessionsError = action.payload?.message ?? 'Error al cargar sesiones'
      })
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload)
      })
      .addCase(revokeSession.rejected,  (state, action) => {
        state.sessionsError = action.payload?.message ?? 'Error al revocar sesión'
      })

      .addCase(fetchOwnSessions.pending,    (state) => { state.sessionsLoading = true })
      .addCase(fetchOwnSessions.fulfilled,  (state, action) => { state.sessionsLoading = false; state.ownSessions = action.payload ?? [] })
      .addCase(fetchOwnSessions.rejected,   (state, action) => { state.sessionsLoading = false; state.sessionsError = action.payload?.message })
      .addCase(closeSessionAction.fulfilled, (state, action) => { state.ownSessions = state.ownSessions.filter(s => s.id !== action.payload); state.sessions = state.sessions.filter(s => s.id !== action.payload) })
      .addCase(closeSessionAction.rejected,  (state, action) => { state.sessionsError = action.payload?.message })
      .addCase(closeAllSessionsAction.fulfilled, (state) => { state.ownSessions = []; state.sessions = [] })
      .addCase(closeAllSessionsAction.rejected,  (state, action) => { state.sessionsError = action.payload?.message })
      .addCase(fetchMyMenu.fulfilled, (state, action) => { state.myMenu = action.payload?.menu ?? action.payload ?? [] })
  },
})

export const { logout, clearError } = authSlice.actions
export const selectActiveSessions   = (state) => state.auth.sessions
export const selectOwnSessions      = (state) => state.auth.ownSessions
export const selectMyMenu           = (state) => state.auth.myMenu
export const selectSessionsLoading  = (state) => state.auth.sessionsLoading
export const selectSessionsError    = (state) => state.auth.sessionsError
export default authSlice.reducer
