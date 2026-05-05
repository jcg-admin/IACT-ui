import dashboardReducer, {
  setMetrics,
  setCharts,
  updateMetric,
  setDashboardLoading,
  setDashboardError,
  fetchDashboardData,
} from '@redux/slices/dashboardSlice';

describe('dashboardSlice', () => {
  const initialState = {
    metrics: {},
    charts: {},
    loading: false,
    error: null,
    lastUpdate: null,
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(dashboardReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('setMetrics should update metrics', () => {
      const metrics = {
        users: { id: 'users', name: 'Users', value: 1234 },
        revenue: { id: 'revenue', name: 'Revenue', value: 45600 },
      };

      const result = dashboardReducer(initialState, setMetrics(metrics));

      expect(result.metrics).toEqual(metrics);
      expect(result.lastUpdate).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('setCharts should update charts', () => {
      const charts = {
        sales: { id: 'sales', type: 'line', data: [] },
      };

      const result = dashboardReducer(initialState, setCharts(charts));

      expect(result.charts).toEqual(charts);
      expect(result.lastUpdate).toBeDefined();
    });

    it('updateMetric should update specific metric value', () => {
      const previousState = {
        ...initialState,
        metrics: {
          users: { id: 'users', name: 'Users', value: 1000 },
        },
      };

      const result = dashboardReducer(previousState, updateMetric({ id: 'users', value: 2000 }));

      expect(result.metrics.users.value).toBe(2000);
      expect(result.lastUpdate).toBeDefined();
    });

    it('setDashboardLoading should update loading state', () => {
      const result = dashboardReducer(initialState, setDashboardLoading(true));
      expect(result.loading).toBe(true);
    });

    it('setDashboardError should update error state', () => {
      const error = 'Failed to fetch data';
      const result = dashboardReducer(initialState, setDashboardError(error));
      expect(result.error).toBe(error);
    });
  });

  describe('extraReducers (async thunks)', () => {
    it('fetchDashboardData.pending should set loading true', () => {
      const result = dashboardReducer(initialState, fetchDashboardData.pending());

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('fetchDashboardData.fulfilled should set data', () => {
      const payload = {
        metrics: {
          users: { id: 'users', value: 1234 },
        },
        charts: {
          sales: { id: 'sales', type: 'line', data: [] },
        },
      };

      const result = dashboardReducer(initialState, fetchDashboardData.fulfilled(payload));

      expect(result.loading).toBe(false);
      expect(result.metrics).toEqual(payload.metrics);
      expect(result.charts).toEqual(payload.charts);
      expect(result.lastUpdate).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('fetchDashboardData.rejected should set error', () => {
      const error = 'Network error';
      const result = dashboardReducer(initialState, fetchDashboardData.rejected(null, '', {}, error));

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });
});
