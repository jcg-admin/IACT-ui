import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import logsService from '../../services/logsGateway'

export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await logsService.getLogs(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchETLLogs = createAsyncThunk(
  'logs/fetchETLLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await logsService.getETLLogs(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const searchLogs = createAsyncThunk(
  'logs/searchLogs',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      return await logsService.searchLogs(query, params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const exportLogs = createAsyncThunk(
  'logs/exportLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await logsService.exportLogs(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchInfraLogs = createAsyncThunk(
  'logs/fetchInfraLogs',
  async (params, { rejectWithValue }) => {
    try {
      return await logsService.getInfraLogs(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchSystemStatus = createAsyncThunk(
  'logs/fetchSystemStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await logsService.getSystemStatus()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchPerformanceMetrics = createAsyncThunk(
  'logs/fetchPerformanceMetrics',
  async (params, { rejectWithValue }) => {
    try {
      return await logsService.getPerformanceMetrics(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const retryPipeline = createAsyncThunk(
  'logs/retryPipeline',
  async ({ logId, motivo }, { rejectWithValue }) => {
    try {
      return await logsService.retryPipeline({ logId, motivo })
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchETLAvailability = createAsyncThunk(
  'logs/fetchETLAvailability',
  async ({ trimestre } = {}, { rejectWithValue }) => {
    try {
      return await logsService.getETLAvailability(trimestre)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchPipelineErrors = createAsyncThunk(
  'logs/fetchPipelineErrors',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await logsService.getPipelineErrors(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchPipelineStatus = createAsyncThunk(
  'logs/fetchPipelineStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await logsService.getPipelineStatus()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    logs: [],
    etlLogs: [],
    etlAvailability: [],
    pipelineErrors: [],
    pipelineStatus: null,
    searchResults: [],
    infraLogs: [],
    systemStatus: null,
    performanceMetrics: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchLogs.pending, pending)
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchLogs.rejected, rejected)

      .addCase(fetchETLLogs.pending, pending)
      .addCase(fetchETLLogs.fulfilled, (state, action) => {
        state.loading = false
        state.etlLogs = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchETLLogs.rejected, rejected)

      .addCase(searchLogs.pending, pending)
      .addCase(searchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload?.results ?? action.payload ?? []
      })
      .addCase(searchLogs.rejected, rejected)

      .addCase(exportLogs.pending, pending)
      .addCase(exportLogs.fulfilled, (state) => { state.loading = false })
      .addCase(exportLogs.rejected, rejected)

      .addCase(fetchInfraLogs.pending, pending)
      .addCase(fetchInfraLogs.fulfilled, (state, action) => {
        state.loading = false
        state.infraLogs = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchInfraLogs.rejected, rejected)

      .addCase(fetchSystemStatus.pending, pending)
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.loading = false
        state.systemStatus = action.payload
      })
      .addCase(fetchSystemStatus.rejected, rejected)

      .addCase(fetchPerformanceMetrics.pending, pending)
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.performanceMetrics = action.payload
      })
      .addCase(fetchPerformanceMetrics.rejected, rejected)

      .addCase(fetchETLAvailability.pending, pending)
      .addCase(fetchETLAvailability.fulfilled, (state, action) => {
        state.loading = false
        state.etlAvailability = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchETLAvailability.rejected, rejected)

      .addCase(retryPipeline.pending, pending)
      .addCase(retryPipeline.fulfilled, (state) => { state.loading = false })
      .addCase(retryPipeline.rejected, rejected)

      .addCase(fetchPipelineStatus.pending, pending)
      .addCase(fetchPipelineStatus.fulfilled, (state, action) => {
        state.loading = false
        state.pipelineStatus = action.payload
      })
      .addCase(fetchPipelineStatus.rejected, rejected)

      .addCase(fetchPipelineErrors.pending, pending)
      .addCase(fetchPipelineErrors.fulfilled, (state, action) => {
        state.loading = false
        state.pipelineErrors = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchPipelineErrors.rejected, rejected)
  },
})

export default logsSlice.reducer

const selectLogsState = (state) => state.logs

export const selectLogs = createSelector(selectLogsState, (s) => s.logs)
export const selectETLLogs = createSelector(selectLogsState, (s) => s.etlLogs)
export const selectETLAvailability = createSelector(selectLogsState, (s) => s.etlAvailability)
export const selectPipelineStatus = createSelector(selectLogsState, (s) => s.pipelineStatus)
export const selectSearchResults = createSelector(selectLogsState, (s) => s.searchResults)
export const selectInfraLogs = createSelector(selectLogsState, (s) => s.infraLogs)
export const selectSystemStatus = createSelector(selectLogsState, (s) => s.systemStatus)
export const selectPerformanceMetrics = createSelector(selectLogsState, (s) => s.performanceMetrics)
export const selectPipelineErrors = createSelector(selectLogsState, (s) => s.pipelineErrors)
export const selectLogsLoading = createSelector(selectLogsState, (s) => s.loading)
export const selectLogsError = createSelector(selectLogsState, (s) => s.error)
