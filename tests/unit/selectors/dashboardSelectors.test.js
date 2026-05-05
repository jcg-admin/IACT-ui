import {
  selectMetrics,
  selectCharts,
  selectMetricsArray,
  selectChartsArray,
  selectMetricById,
  selectChartById,
  selectDashboardStatus,
  selectMetricsStats,
} from '@redux/selectors/dashboardSelectors';

describe('dashboardSelectors', () => {
  const mockState = {
    dashboard: {
      metrics: {
        users: { id: 'users', name: 'Users', value: 1234 },
        revenue: { id: 'revenue', name: 'Revenue', value: 45600 },
        conversions: { id: 'conversions', name: 'Conversions', value: 342 },
      },
      charts: {
        sales: { id: 'sales', type: 'line', data: [] },
        revenue: { id: 'revenue', type: 'bar', data: [] },
      },
      loading: false,
      error: null,
      lastUpdate: '2025-04-23T10:00:00Z',
    },
  };

  it('selectMetrics should return metrics object', () => {
    expect(selectMetrics(mockState)).toEqual(mockState.dashboard.metrics);
  });

  it('selectCharts should return charts object', () => {
    expect(selectCharts(mockState)).toEqual(mockState.dashboard.charts);
  });

  it('selectMetricsArray should convert metrics to array', () => {
    const array = selectMetricsArray(mockState);
    expect(Array.isArray(array)).toBe(true);
    expect(array).toHaveLength(3);
    expect(array[0]).toHaveProperty('id');
  });

  it('selectChartsArray should convert charts to array', () => {
    const array = selectChartsArray(mockState);
    expect(Array.isArray(array)).toBe(true);
    expect(array).toHaveLength(2);
  });

  it('selectMetricById should return specific metric', () => {
    const metric = selectMetricById(mockState, 'users');
    expect(metric).toEqual(mockState.dashboard.metrics.users);
  });

  it('selectMetricById should return null for non-existent metric', () => {
    const metric = selectMetricById(mockState, 'nonexistent');
    expect(metric).toBeNull();
  });

  it('selectChartById should return specific chart', () => {
    const chart = selectChartById(mockState, 'sales');
    expect(chart).toEqual(mockState.dashboard.charts.sales);
  });

  it('selectDashboardStatus should return status composite', () => {
    const status = selectDashboardStatus(mockState);
    expect(status).toEqual({
      loading: false,
      error: null,
      lastUpdate: '2025-04-23T10:00:00Z',
    });
  });

  it('selectMetricsStats should calculate statistics', () => {
    const stats = selectMetricsStats(mockState);
    expect(stats.count).toBe(3);
    expect(stats.total).toBe(1234 + 45600 + 342); // 47176
    expect(stats.average).toBe((1234 + 45600 + 342) / 3);
  });

  it('selectMetricsStats should handle empty metrics', () => {
    const stateWithoutMetrics = {
      dashboard: { ...mockState.dashboard, metrics: {} },
    };
    const stats = selectMetricsStats(stateWithoutMetrics);
    expect(stats).toEqual({ count: 0, total: 0, average: 0 });
  });

  it('selectors should use memoization', () => {
    const result1 = selectMetrics(mockState);
    const result2 = selectMetrics(mockState);
    expect(result1).toBe(result2); // Same object reference due to memoization
  });
});
