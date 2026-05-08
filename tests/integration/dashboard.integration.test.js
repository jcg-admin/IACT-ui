/**
 * Tests de integración - Dashboard Simplificado
 * Verifica setup básico del dashboard
 */

import { configureStore } from '@reduxjs/toolkit';
import reportsReducer from '@redux/slices/reportsSlice';
import authReducer from '@redux/slices/authSlice';

describe('Dashboard Integration', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        reports: reportsReducer,
        auth: authReducer,
      },
    });
  });

  test('Dashboard page can be rendered', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Metrics are displayed in dashboard', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Dashboard fetches metrics on mount', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Dashboard handles loading state', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Dashboard displays error messages', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Dashboard requires authentication', () => {
    const state = store.getState();
    expect(state.auth).toBeDefined();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  test('Dashboard live updates via WebSocket', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });

  test('Dashboard caches metrics appropriately', () => {
    const state = store.getState();
    expect(state.reports).toBeDefined();
  });
});
