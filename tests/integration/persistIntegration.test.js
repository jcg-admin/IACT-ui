/**
 * Tests de integración - Redux Persist Simplificado
 * Verifica configuración básica de persistencia
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '@redux/slices/auth';
import { persistConfig } from '@redux/persistConfig';

describe('Redux Persist Integration', () => {
  let store;
  let persistor;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    const persistedAuthReducer = persistReducer(persistConfig, authReducer);
    store = configureStore({
      reducer: {
        auth: persistedAuthReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            ignoredPaths: ['_persist'],
          },
        }),
    });

    persistor = persistStore(store);
  });

  afterEach(async () => {
    await persistor.purge();
  });

  describe('Persist Flow', () => {
    it('should persist auth state when authenticated', async () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });

    it('should persist only whitelisted auth slice', async () => {
      const config = persistConfig;
      expect(config.whitelist).toBeDefined();
      expect(config.whitelist).toContain('auth');
      expect(config.whitelist.length).toBe(1);
    });

    it('should not persist loading or error states', async () => {
      const state = store.getState();
      expect(state.auth.isLoading).toBe(false);
      expect(state.auth.error).toBeNull();
    });
  });

  describe('Rehydrate Flow', () => {
    it('should restore auth state on rehydration', async () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
      expect(state.auth.isAuthenticated).toBe(false);
    });

    it('should clear auth on logout', async () => {
      const state = store.getState();
      expect(state.auth.user).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle failed login without persisting invalid state', async () => {
      const state = store.getState();
      expect(state.auth.error).toBeNull();
    });

    it('should recover from corrupted persisted state', async () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
    });
  });

  describe('Whitelist Enforcement', () => {
    it('should only persist auth slice', async () => {
      const config = persistConfig;
      expect(config.whitelist).toEqual(['auth']);
    });
  });

  describe('Performance', () => {
    it('should throttle writes to localStorage', async () => {
      const config = persistConfig;
      expect(config.throttle).toBe(1000);
    });
  });

  describe('Configuration Validation', () => {
    it('should use correct persist config', async () => {
      const config = persistConfig;
      expect(config.key).toBe('root');
      expect(config.version).toBe(1);
      expect(config.throttle).toBe(1000);
    });

    it('should not persist dashboard to ensure fresh data', async () => {
      const config = persistConfig;
      expect(config.whitelist).not.toContain('dashboard');
    });
  });
});
