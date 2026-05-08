import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import authService from '@services/authService';
import { clearSession } from './sessionSlice';

/**
 * Auth Slice - SECURITY HARDENED
 * 
 * IMPORTANTE:
 * - NO guardar tokens en Redux
 * - NO guardar tokens en localStorage
 * - Tokens guardados en httpOnly cookies por backend
 * - Solo guardar user data sin información sensible
 */

// Async thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Llamar a backend que configura httpOnly cookies
      const response = await apiService.post('/api/token/', {
        username: credentials.username,
        password: credentials.password,
      });

      // Backend NO retorna tokens en response (están en httpOnly cookies)
      // Solo retornar datos de usuario
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
    }
  }
);

// Async thunk para logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Notificar al backend que usuario se desloguea
      await apiService.post('/api/logout/', {});
      // Limpiar sesión también
      dispatch(clearSession());
      return null;
    } catch (error) {
      // Proceder con logout local incluso si backend falla
      dispatch(clearSession());
      return null;
    }
  }
);

// Async thunk para obtener usuario actual
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/api/user/');
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
    }
  }
);

export const recoverPassword = createAsyncThunk(
  'auth/recoverPassword',
  async (username, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/auth/recover-password/', { username })
      return res
    } catch (err) {
      return rejectWithValue({ message: err.message || 'Error al recuperar contraseña', statusCode: null })
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await apiService.post('/api/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      return res
    } catch (err) {
      return rejectWithValue({ message: err.message || 'Error al cambiar contraseña', statusCode: null })
    }
  }
)

export const fetchActiveSessions = createAsyncThunk(
  'auth/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getActiveSessions()
    } catch (err) {
      return rejectWithValue({ message: err.message, statusCode: err.response?.status ?? null })
    }
  }
)

export const revokeSession = createAsyncThunk(
  'auth/revokeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await authService.revokeSession(sessionId)
      return sessionId
    } catch (err) {
      return rejectWithValue({ message: err.message, statusCode: err.response?.status ?? null })
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessions: [],
    sessionsLoading: false,
    sessionsError: null,
  },
  reducers: {
    // Logout local (llamar también logoutUser)
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    
    // Limpiar error
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
        // SECURITY: NO guardar tokens aqui
        // Backend configura httpOnly cookies
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        // SECURITY: Cookies borradas por backend
      })
      .addCase(logoutUser.rejected, (state) => {
        // Logout local incluso si falla backend
        state.user = null;
        state.isAuthenticated = false;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })

      // Recover password
      .addCase(recoverPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recoverPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(recoverPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch active sessions
      .addCase(fetchActiveSessions.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.sessionsLoading = false;
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload?.message ?? 'Error al cargar sesiones';
      })

      // Revoke session
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload);
      })
      .addCase(revokeSession.rejected, (state, action) => {
        state.sessionsError = action.payload?.message ?? 'Error al revocar sesión';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const selectActiveSessions = (state) => state.auth.sessions;
export const selectSessionsLoading = (state) => state.auth.sessionsLoading;
export const selectSessionsError = (state) => state.auth.sessionsError;
export default authSlice.reducer;
