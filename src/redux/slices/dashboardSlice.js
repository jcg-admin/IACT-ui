import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMockDashboardData } from '@mocks/dashboardData';

// Async thunk para fetch de métricas
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = getMockDashboardData();
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: {},
    charts: {},
    loading: false,
    error: null,
    lastUpdate: null,
  },
  reducers: {
    setMetrics(state, action) {
      state.metrics = action.payload;
      state.lastUpdate = new Date().toISOString();
      state.error = null;
    },
    setCharts(state, action) {
      state.charts = action.payload;
      state.lastUpdate = new Date().toISOString();
      state.error = null;
    },
    setDashboardLoading(state, action) {
      state.loading = action.payload;
    },
    setDashboardError(state, action) {
      state.error = action.payload;
    },
    updateMetric(state, action) {
      const { id, value } = action.payload;
      if (state.metrics[id]) {
        state.metrics[id].value = value;
        state.lastUpdate = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.charts = action.payload.charts;
        state.lastUpdate = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setMetrics,
  setCharts,
  setDashboardLoading,
  setDashboardError,
  updateMetric,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
