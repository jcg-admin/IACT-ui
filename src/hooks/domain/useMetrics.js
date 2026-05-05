import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMetric } from '@redux/slices/dashboardSlice';
import {
  selectMetrics,
  selectMetricsArray,
  selectMetricById,
  selectMetricsStats,
} from '@redux/selectors/dashboardSelectors';

/**
 * Custom hook para manejo de métricas del dashboard
 * Proporciona acceso a métricas y funciones de actualización
 */
export const useMetrics = () => {
  const dispatch = useDispatch();

  const metricsObject = useSelector(selectMetrics);
  const metricsArray = useSelector(selectMetricsArray);
  const stats = useSelector(selectMetricsStats);

  const getMetricById = useCallback(
    (metricId) => useSelector((state) => selectMetricById(state, metricId)),
    []
  );

  const updateMetricValue = useCallback(
    (metricId, value) => {
      dispatch(updateMetric({ id: metricId, value }));
    },
    [dispatch]
  );

  return {
    // Selectors
    metrics: metricsObject,
    metricsArray,
    stats,
    getMetricById,
    // Actions
    updateMetric: updateMetricValue,
  };
};

export default useMetrics;
