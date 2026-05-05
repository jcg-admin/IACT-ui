/**
 * Tests unitarios para custom hooks
 * Ubicación: tests/unit/hooks/
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import useAuth from '../../../src/hooks/useAuth';
import useDashboard from '../../../src/hooks/useDashboard';
import useMetrics from '../../../src/hooks/useMetrics';

const mockStore = configureStore([]);

// ============================================================================
// tests/unit/hooks/useAuth.test.js
// ============================================================================

describe('useAuth Hook', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { id: '1', name: 'John Doe', email: 'john@example.com' },
        token: 'mock-token',
        isAuthenticated: true,
        loading: false,
        error: null
      }
    });
  });

  test('returns user from auth state', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  test('returns isAuthenticated status', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('returns loading state', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
  });

  test('returns login function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
  });

  test('returns logout function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.logout).toBe('function');
  });

  test('handles unauthenticated state', () => {
    store = mockStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('returns error message when present', () => {
    store = mockStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Invalid credentials'
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.error).toBe('Invalid credentials');
  });
});

// ============================================================================
// tests/unit/hooks/useDashboard.test.js
// ============================================================================

describe('useDashboard Hook', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      dashboard: {
        metrics: {
          users: { id: 1, name: 'Users', value: 1234, change: 5.2 },
          revenue: { id: 2, name: 'Revenue', value: 45600, change: 12.5 }
        },
        charts: [
          { name: 'Jan', sales: 4000 },
          { name: 'Feb', sales: 3000 }
        ],
        loading: false,
        error: null,
        lastUpdate: '2025-04-23T10:00:00Z'
      }
    });
    store.dispatch = jest.fn();
  });

  test('returns metrics from dashboard state', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.metrics).toBeDefined();
    expect(Object.keys(result.current.metrics).length).toBe(2);
  });

  test('returns charts data', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(Array.isArray(result.current.charts)).toBe(true);
    expect(result.current.charts.length).toBe(2);
  });

  test('returns loading state', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.loading).toBe(false);
  });

  test('returns refresh function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(typeof result.current.refresh).toBe('function');
  });

  test('returns updateMetric function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(typeof result.current.updateMetric).toBe('function');
  });

  test('handles empty metrics', () => {
    store = mockStore({
      dashboard: {
        metrics: {},
        charts: [],
        loading: false,
        error: null,
        lastUpdate: null
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(Object.keys(result.current.metrics).length).toBe(0);
    expect(result.current.charts.length).toBe(0);
  });

  test('returns error when present', () => {
    store = mockStore({
      dashboard: {
        metrics: {},
        charts: [],
        loading: false,
        error: 'Failed to load data',
        lastUpdate: null
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.error).toBe('Failed to load data');
  });

  test('can call refresh function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.refresh();
    });

    expect(store.dispatch).toHaveBeenCalled();
  });

  test('can call updateMetric function', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.updateMetric(1, 5000);
    });

    expect(store.dispatch).toHaveBeenCalled();
  });
});

// ============================================================================
// tests/unit/hooks/useMetrics.test.js
// ============================================================================

describe('useMetrics Hook', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      dashboard: {
        metrics: {
          users: { id: 1, name: 'Users', value: 1234, change: 5.2 },
          revenue: { id: 2, name: 'Revenue', value: 45600, change: 12.5 },
          conversions: { id: 3, name: 'Conversions', value: 342, change: -2.3 }
        },
        loading: false,
        error: null,
        lastUpdate: '2025-04-23T10:00:00Z'
      }
    });
    store.dispatch = jest.fn();
  });

  test('returns all metrics', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(result.current.metrics.length).toBe(3);
  });

  test('returns metrics as array', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(Array.isArray(result.current.metrics)).toBe(true);
  });

  test('returns metrics with correct structure', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    const firstMetric = result.current.metrics[0];
    expect(firstMetric).toHaveProperty('name');
    expect(firstMetric).toHaveProperty('value');
    expect(firstMetric).toHaveProperty('change');
  });

  test('returns loading state', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(result.current.loading).toBe(false);
  });

  test('handles loading state', () => {
    store = mockStore({
      dashboard: {
        metrics: {},
        loading: true,
        error: null,
        lastUpdate: null
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  test('handles error state', () => {
    store = mockStore({
      dashboard: {
        metrics: {},
        loading: false,
        error: 'Network error',
        lastUpdate: null
      }
    });

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(result.current.error).toBe('Network error');
  });

  test('returns last update timestamp', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    expect(result.current.lastUpdate).toBe('2025-04-23T10:00:00Z');
  });

  test('can sort metrics by value', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    const sorted = result.current.metrics.sort((a, b) => b.value - a.value);
    
    expect(sorted[0].value).toBe(45600);
    expect(sorted[2].value).toBe(342);
  });

  test('can filter metrics by change', () => {
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useMetrics(), { wrapper });

    const positive = result.current.metrics.filter(m => m.change > 0);
    expect(positive.length).toBe(2);
  });
});
