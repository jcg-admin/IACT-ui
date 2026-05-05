import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, updateMetric } from '@redux/slices/dashboardSlice';
import {
  selectMetricsArray,
  selectChartsArray,
  selectDashboardLoading,
  selectDashboardError,
  selectLastUpdate,
  selectDashboardStatus,
} from '@redux/selectors/dashboardSelectors';

/**
 * Custom hook para manejo completo del dashboard
 * Integra fetching de datos, selección de métricas/gráficos, y actualizaciones
 */
export const useDashboard = (autoRefresh = true, refreshInterval = 10000) => {
  const dispatch = useDispatch();

  const metrics = useSelector(selectMetricsArray);
  const charts = useSelector(selectChartsArray);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdate = useSelector(selectLastUpdate);
  const status = useSelector(selectDashboardStatus);

  // Fetch inicial y auto-refresh
  useEffect(() => {
    // Fetch inicial
    dispatch(fetchDashboardData());

    if (!autoRefresh) {
      return;
    }

    // Auto-refresh cada intervalo
    const interval = setInterval(
      () => dispatch(fetchDashboardData()),
      refreshInterval
    );

    return () => clearInterval(interval);
  }, [dispatch, autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const updateMetricValue = useCallback(
    (metricId, value) => {
      dispatch(updateMetric({ id: metricId, value }));
    },
    [dispatch]
  );

  return {
    // State
    metrics,
    charts,
    loading,
    error,
    lastUpdate,
    status,
    // Actions
    refresh,
    updateMetric: updateMetricValue,
  };
};

export default useDashboard;
