import { persistConfig } from '@redux/persistConfig';
import storage from 'redux-persist/lib/storage';

describe('persistConfig', () => {
  describe('Configuration', () => {
    it('should have correct key', () => {
      expect(persistConfig.key).toBe('root');
    });

    it('should use localStorage as storage engine', () => {
      expect(persistConfig.storage).toBe(storage);
    });

    it('should have version 1', () => {
      expect(persistConfig.version).toBe(1);
    });

    it('should have throttle set to 1000ms', () => {
      expect(persistConfig.throttle).toBe(1000);
    });
  });

  describe('Whitelist', () => {
    it('should persist only auth slice', () => {
      expect(persistConfig.whitelist).toBeDefined();
      expect(Array.isArray(persistConfig.whitelist)).toBe(true);
    });

    it('should include auth in whitelist', () => {
      expect(persistConfig.whitelist).toContain('auth');
    });

    it('should only have auth slice in whitelist', () => {
      expect(persistConfig.whitelist.length).toBe(1);
    });

    it('should not include dashboard in whitelist', () => {
      expect(persistConfig.whitelist).not.toContain('dashboard');
    });

    it('should not include error slice in whitelist', () => {
      expect(persistConfig.whitelist).not.toContain('error');
    });
  });

  describe('Purpose', () => {
    it('should persist auth state for session retention', () => {
      // Auth slice should persist so user stays logged in after reload
      expect(persistConfig.whitelist).toContain('auth');
    });

    it('should NOT persist dashboard state for fresh data on each load', () => {
      // Dashboard should NOT persist so metrics are always fresh
      expect(persistConfig.whitelist).not.toContain('dashboard');
    });

    it('should NOT persist errors to keep app clean on reload', () => {
      // Errors should NOT persist
      expect(persistConfig.whitelist).not.toContain('error');
    });
  });

  describe('Versionability', () => {
    it('should support versioning for future migrations', () => {
      expect(persistConfig.version).toBeDefined();
      expect(typeof persistConfig.version).toBe('number');
    });

    it('should start at version 1 for baseline', () => {
      expect(persistConfig.version).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should throttle writes for performance', () => {
      expect(persistConfig.throttle).toBeDefined();
      expect(persistConfig.throttle).toBeGreaterThan(0);
    });

    it('should throttle at reasonable interval (1 second)', () => {
      expect(persistConfig.throttle).toBeLessThanOrEqual(1000);
    });
  });
});
