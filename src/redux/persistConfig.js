import storage from 'redux-persist/lib/storage';

/**
 * Redux Persist Configuration
 * 
 * This config specifies which Redux slices should be persisted to localStorage.
 * 
 * Only the 'auth' slice is persisted because:
 * - Auth state (token, user info) should persist across page reloads
 * - Dashboard state is temporary and re-fetches on each session
 * 
 * For versioning and migrations in the future, use the 'version' field.
 */

export const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],  // Only persist auth slice
  version: 1,           // For future migrations
  throttle: 1000,       // Throttle writes to localStorage to 1 second
};
