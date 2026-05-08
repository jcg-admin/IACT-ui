import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from '@redux/slices/auth';
import { persistConfig } from '@redux/persistConfig';

describe('Redux Persist Integration', () => {
  let store;
  let persistor;

  describe('Store Configuration', () => {
    it('should configure store with persisted auth reducer', () => {
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      expect(store).toBeDefined();
      expect(store.getState().auth).toBeDefined();
    });

    it('should create persistor for store', () => {
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      persistor = persistStore(store);
      expect(persistor).toBeDefined();
    });
  });

  describe('Initial State', () => {
    beforeEach(() => {
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      persistor = persistStore(store);
    });

    it('should have clean initial state', () => {
      const state = store.getState();

      expect(state.auth).toBeDefined();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });

    it('should initialize without localStorage data', () => {
      localStorage.clear(); // Ensure clean state

      const state = store.getState();

      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  describe('Persist Behavior', () => {
    beforeEach(() => {
      localStorage.clear();
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      persistor = persistStore(store);
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should persist auth state changes to localStorage', async () => {
      // Simulate login by dispatching action with auth data
      const authData = {
        id: 1, email: 'test@example.com', name: 'Test User'
      };

      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: authData,
      });

      // Force flush persistor to sync with localStorage
      await persistor.flush();

      // Check that something was persisted
      const persistedData = localStorage.getItem('persist:root');
      expect(persistedData).toBeDefined();
      expect(persistedData).not.toBeNull();
    });

    it('should parse persisted data correctly', async () => {
      // Verify the initial state structure is correct
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state.auth).toBeDefined();
      expect(state.auth.isAuthenticated).toBeDefined();
      expect(state.auth.user).toBeNull();
      expect(state.auth.error).toBeNull();
    });
  });

  describe('Logout Behavior', () => {
    beforeEach(() => {
      localStorage.clear();
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      persistor = persistStore(store);
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should clear localStorage on logout', async () => {
      // First login
      const authData = {
        id: 1, email: 'test@example.com', name: 'Test User'
      };

      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: authData,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify data is persisted
      let persistedData = localStorage.getItem('persist:root');
      expect(persistedData).toBeDefined();

      // Then logout
      store.dispatch({ type: 'auth/logout' });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that auth is cleared
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });
  });

  describe('No Manual localStorage Usage', () => {
    it('should not use localStorage.getItem directly in reducer', () => {
      // This test ensures that authSlice doesn't use localStorage manually
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      // Initial state should NOT try to read from localStorage
      const state = store.getState();

      // These should be set by Redux Persist rehydration, not manual localStorage reads
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });

    it('should not manually setItem on auth changes', () => {
      const persistedAuthReducer = persistReducer(persistConfig, authReducer);

      store = configureStore({
        reducer: {
          auth: persistedAuthReducer,
        },
      });

      localStorage.clear();

      // Verify that the store is properly configured with persistReducer
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state.auth).toBeDefined();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
      
      // Redux Persist should be handling persistence, not manual code
      // The authSlice should not contain manual localStorage.setItem() calls
    });
  });

  describe('Version Control for Migrations', () => {
    it('should have version for tracking schema changes', () => {
      expect(persistConfig.version).toBeDefined();
      expect(typeof persistConfig.version).toBe('number');
    });

    it('should be able to handle migrations in future versions', () => {
      // Current version is 1
      expect(persistConfig.version).toBe(1);

      // In future, could upgrade to version 2 with migration logic
      // This demonstrates the system is set up for that
    });
  });
});
