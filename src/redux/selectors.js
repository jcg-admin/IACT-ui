import { createSelector } from '@reduxjs/toolkit';

// Auth selectors
export const selectAuthState = (state) => state.auth;

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
