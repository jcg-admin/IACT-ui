import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectUserEmail,
  selectUserRole,
  selectAuthStatus,
} from '@store/selectors/authSelectors';

describe('authSelectors', () => {
  const mockState = {
    auth: {
      isAuthenticated: true,
      user: { id: 1, email: 'admin@iact.com', role: 'admin' },
      token: 'abc123',
      loading: false,
      error: null,
    },
  };

  it('selectIsAuthenticated should return authentication status', () => {
    expect(selectIsAuthenticated(mockState)).toBe(true);
  });

  it('selectUser should return user object', () => {
    expect(selectUser(mockState)).toEqual(mockState.auth.user);
  });

  it('selectAuthLoading should return loading state', () => {
    expect(selectAuthLoading(mockState)).toBe(false);
  });

  it('selectAuthError should return error message', () => {
    expect(selectAuthError(mockState)).toBeNull();
  });

  it('selectUserEmail should return user email', () => {
    expect(selectUserEmail(mockState)).toBe('admin@iact.com');
  });

  it('selectUserEmail should return null when user is null', () => {
    const stateWithoutUser = {
      auth: { ...mockState.auth, user: null },
    };
    expect(selectUserEmail(stateWithoutUser)).toBeNull();
  });

  it('selectUserRole should return user role', () => {
    expect(selectUserRole(mockState)).toBe('admin');
  });

  it('selectAuthStatus should return composite status', () => {
    const status = selectAuthStatus(mockState);
    expect(status).toEqual({
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  });

  it('selectors should use memoization', () => {
    const result1 = selectIsAuthenticated(mockState);
    const result2 = selectIsAuthenticated(mockState);
    expect(result1).toBe(result2); // Same object reference due to memoization
  });
});
