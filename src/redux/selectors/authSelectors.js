import { createSelector } from 'reselect';

// Base selector
const selectAuthState = (state) => state.auth;

// Memoized selectors
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.isAuthenticated
);

export const selectUser = createSelector(
  selectAuthState,
  (auth) => auth.user
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (auth) => auth.error
);

// Derived selector
export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email || null
);

// Derived selector
export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role || null
);

// Composite selector
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectAuthLoading, selectAuthError],
  (isAuthenticated, loading, error) => ({
    isAuthenticated,
    loading,
    error,
  })
);
