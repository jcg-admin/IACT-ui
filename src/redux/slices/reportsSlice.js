/**
 * Reports Slice
 *
 * Gestión de estado para métricas del dashboard y reportes programados.
 * Incluye thunks RTK para operaciones de consulta y programación.
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import reportsService from '../../services/reportsService'

// ── Thunks ──────────────────────────────────────────────────────────────────

/** Obtiene las métricas actuales del dashboard principal. */
export const fetchDashboardMetrics = createAsyncThunk(
  'reports/fetchDashboardMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getDashboardMetrics()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** Obtiene la lista de reportes programados. */
export const fetchScheduledReports = createAsyncThunk(
  'reports/fetchScheduledReports',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getScheduledReports()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** Genera URL compartible para un reporte con los filtros actuales (client-side). */
export const shareReport = createAsyncThunk(
  'reports/shareReport',
  async ({ type, filters }, { rejectWithValue }) => {
    try {
      return reportsService.generateShareUrl(type, filters)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** Obtiene el historial de reportes generados. */
export const fetchReportHistory = createAsyncThunk(
  'reports/fetchReportHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getReportHistory()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** Programa un nuevo reporte periódico. */
export const createScheduledReport = createAsyncThunk(
  'reports/createScheduledReport',
  async (config, { rejectWithValue }) => {
    try {
      return await reportsService.scheduleReport(config)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ── Slice ────────────────────────────────────────────────────────────────────

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    metrics: null,
    scheduledReports: [],
    reportHistory: [],
    sharedUrl: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // fetchDashboardMetrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload
        state.loading = false
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // fetchScheduledReports
    builder
      .addCase(fetchScheduledReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchScheduledReports.fulfilled, (state, action) => {
        const payload = action.payload
        state.scheduledReports = payload.results ?? payload
        state.loading = false
      })
      .addCase(fetchScheduledReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // shareReport
    builder
      .addCase(shareReport.fulfilled, (state, action) => {
        state.sharedUrl = action.payload
      })

    // fetchReportHistory
    builder
      .addCase(fetchReportHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReportHistory.fulfilled, (state, action) => {
        state.reportHistory = action.payload?.results ?? action.payload ?? []
        state.loading = false
      })
      .addCase(fetchReportHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // createScheduledReport
    builder
      .addCase(createScheduledReport.fulfilled, (state, action) => {
        state.scheduledReports.push(action.payload)
      })
      .addCase(createScheduledReport.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { updateMetrics } = reportsSlice.actions

// ── Selectores ───────────────────────────────────────────────────────────────

const selectReportsState = (state) => state.reports

export const selectMetrics = createSelector(selectReportsState, (s) => s.metrics)
export const selectScheduledReports = createSelector(selectReportsState, (s) => s.scheduledReports)
export const selectReportHistory = createSelector(selectReportsState, (s) => s.reportHistory)
export const selectSharedUrl = createSelector(selectReportsState, (s) => s.sharedUrl)
export const selectReportsLoading = createSelector(selectReportsState, (s) => s.loading)
export const selectReportsError = createSelector(selectReportsState, (s) => s.error)

export default reportsSlice.reducer
