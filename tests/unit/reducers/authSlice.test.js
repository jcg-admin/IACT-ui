import authReducer, { logout, clearError, loginUser } from '@store/slices/auth';

describe('authSlice', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    ownSessions: [],
    myMenu: [],
    sessions: [],
    sessionsLoading: false,
    sessionsError: null,
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('logout should clear auth state', () => {
      const previousState = {
        isAuthenticated: true,
        user: { id: 1, email: 'test@test.com' },
        isLoading: false,
        error: null,
      };

      const result = authReducer(previousState, logout());

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBeNull();
    });

    it('clearError should clear error message', () => {
      const previousState = {
        ...initialState,
        error: 'Invalid credentials',
      };

      const result = authReducer(previousState, clearError());

      expect(result.error).toBeNull();
    });
  });

  describe('extraReducers (async thunks)', () => {
    it('loginUser.pending should set loading true', () => {
      const result = authReducer(initialState, loginUser.pending());

      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('loginUser.fulfilled should set authenticated and user', () => {
      const payload = { id: 1, email: 'admin@iact.com', role: 'admin' };

      const result = authReducer(initialState, loginUser.fulfilled(payload));

      expect(result.isLoading).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(payload);
      expect(result.error).toBeNull();
    });

    it('loginUser.rejected should set error', () => {
      const error = 'Invalid credentials';
      const result = authReducer(initialState, loginUser.rejected(null, '', {}, error));

      expect(result.isLoading).toBe(false);
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe(error);
    });
  });
});
