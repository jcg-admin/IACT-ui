import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import healthReducer, { selectHealthStatus, selectHealthError } from '@state/slices/health';
import { useHealthStatus } from './useHealthStatus';
import { HealthService } from '@services/health/HealthGateway';

jest.mock('@services/health/HealthGateway', () => ({
  HealthService: {
    getStatus: jest.fn(),
  },
}));

const createStore = () =>
  configureStore({
    reducer: {
      observability: healthReducer,
    },
  });

const wrapperFactory = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useHealthStatus', () => {
  it('loads health status into the store', async () => {
    const store = createStore();
    HealthService.getStatus.mockResolvedValue({
      data: { status: 'ok', checkedAt: '2025-11-14T12:00:00Z' },
      source: 'api',
      error: null,
    });

    const { result } = renderHook(() => useHealthStatus(), { wrapper: wrapperFactory(store) });

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(selectHealthStatus(store.getState())).toBe('ok');
    expect(result.current.source).toBe('api');
    expect(result.current.lastChecked).toBe('2025-11-14T12:00:00Z');
  });

  it('stores error when the service throws', async () => {
    const store = createStore();
    HealthService.getStatus.mockRejectedValue(new Error('backend caido'));

    const { result } = renderHook(() => useHealthStatus(), { wrapper: wrapperFactory(store) });

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(selectHealthError(store.getState())).toBe('backend caido');
    expect(result.current.status).toBe('unknown');
  });

  it('uses fallback values when service returns missing fields', async () => {
    const store = createStore();
    HealthService.getStatus.mockResolvedValue({
      data: {},
      source: undefined,
      error: null,
    });

    const { result } = renderHook(() => useHealthStatus(), { wrapper: wrapperFactory(store) });

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(selectHealthStatus(store.getState())).toBe('unknown');
    expect(result.current.source).toBe('unknown');
    expect(result.current.lastChecked).toBeNull();
  });

  it('captures error message from service error object', async () => {
    const store = createStore();
    HealthService.getStatus.mockResolvedValue({
      data: { status: 'degraded' },
      source: 'api',
      error: { message: 'partial failure' },
    });

    const { result } = renderHook(() => useHealthStatus(), { wrapper: wrapperFactory(store) });

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(selectHealthError(store.getState())).toBe('partial failure');
  });
});
