import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMetrics, selectMetrics } from '@store/slices/reports';

export const useMetrics = () => {
  const dispatch = useDispatch();

  const metricsObject = useSelector(selectMetrics);

  const metricsArray = useMemo(
    () => (metricsObject ? Object.values(metricsObject) : []),
    [metricsObject]
  );

  const stats = useMemo(() => {
    if (!metricsArray.length) return { count: 0, total: 0, average: 0 };
    const total = metricsArray.reduce((sum, m) => sum + (m.value || 0), 0);
    return { count: metricsArray.length, total, average: total / metricsArray.length };
  }, [metricsArray]);

  const getMetricById = useCallback(
    (metricId) => metricsArray.find((m) => m.id === metricId) ?? null,
    [metricsArray]
  );

  const updateMetricValue = useCallback(
    (metricId, value) => {
      dispatch(updateMetrics({ [metricId]: value }));
    },
    [dispatch]
  );

  return {
    metrics: metricsObject,
    metricsArray,
    stats,
    getMetricById,
    updateMetric: updateMetricValue,
  };
};

export default useMetrics;
