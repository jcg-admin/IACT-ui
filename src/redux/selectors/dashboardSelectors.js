import { createSelector } from 'reselect';

// Base selector
const selectDashboardState = (state) => state.dashboard;

// Memoized selectors
export const selectMetrics = createSelector(
  selectDashboardState,
  (dashboard) => dashboard.metrics || {}
);

export const selectCharts = createSelector(
  selectDashboardState,
  (dashboard) => dashboard.charts || {}
);

export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (dashboard) => dashboard.loading
);

export const selectDashboardError = createSelector(
  selectDashboardState,
  (dashboard) => dashboard.error
);

export const selectLastUpdate = createSelector(
  selectDashboardState,
  (dashboard) => dashboard.lastUpdate
);

// Derived selector - metrics as array
export const selectMetricsArray = createSelector(
  selectMetrics,
  (metrics) => Object.values(metrics)
);

// Derived selector - charts as array
export const selectChartsArray = createSelector(
  selectCharts,
  (charts) => Object.values(charts)
);

// Derived selector - get specific metric by ID
export const selectMetricById = createSelector(
  [selectMetrics, (_, metricId) => metricId],
  (metrics, metricId) => metrics[metricId] || null
);

// Derived selector - get specific chart by ID
export const selectChartById = createSelector(
  [selectCharts, (_, chartId) => chartId],
  (charts, chartId) => charts[chartId] || null
);

// Composite selector - dashboard status
export const selectDashboardStatus = createSelector(
  [selectDashboardLoading, selectDashboardError, selectLastUpdate],
  (loading, error, lastUpdate) => ({
    loading,
    error,
    lastUpdate,
  })
);

// Statistics selector
export const selectMetricsStats = createSelector(
  selectMetricsArray,
  (metrics) => {
    if (metrics.length === 0) {
      return { count: 0, total: 0, average: 0 };
    }
    const total = metrics.reduce((sum, m) => sum + (m.value || 0), 0);
    const average = total / metrics.length;
    return {
      count: metrics.length,
      total,
      average,
    };
  }
);
