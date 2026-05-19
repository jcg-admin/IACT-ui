/**
 * Reports Slice
 *
 * Gestión de estado para métricas del dashboard y reportes programados.
 * Incluye thunks RTK para operaciones de consulta y programación.
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import reportsService from '../../services/reportsGateway'

// ── Thunks ──────────────────────────────────────────────────────────────────

/** Obtiene las métricas actuales del dashboard principal. */
export const fetchDashboardMetrics = createAsyncThunk(
  'reports/fetchDashboardMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getDashboardMetrics()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Obtiene la lista de reportes programados. */
export const fetchScheduledReports = createAsyncThunk(
  'reports/fetchScheduledReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await reportsService.getScheduledReports(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Obtiene el detalle de un reporte programado. */
export const fetchScheduledDetail = createAsyncThunk(
  'reports/fetchScheduledDetail',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.getScheduledDetail(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
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
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
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
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
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
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const pauseSchedule = createAsyncThunk(
  'reports/pauseSchedule',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.pauseSchedule(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const resumeSchedule = createAsyncThunk(
  'reports/resumeSchedule',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.resumeSchedule(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const deleteSchedule = createAsyncThunk(
  'reports/deleteSchedule',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.deleteSchedule(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const runScheduleNow = createAsyncThunk(
  'reports/runScheduleNow',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.runScheduleNow(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchScheduleHistory = createAsyncThunk(
  'reports/fetchScheduleHistory',
  async (id, { rejectWithValue }) => {
    try {
      return await reportsService.getScheduleHistory(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Obtiene las vistas guardadas del usuario (UC_RPT_10). */
export const fetchSavedViews = createAsyncThunk(
  'reports/fetchSavedViews',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getSavedViews()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Elimina una vista guardada por id (UC_RPT_10). */
export const deleteSavedView = createAsyncThunk(
  'reports/deleteSavedView',
  async (id, { rejectWithValue }) => {
    try {
      await reportsService.deleteSavedView(id)
      return id
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Slice ────────────────────────────────────────────────────────────────────


export const fetchExportJobs = createAsyncThunk('reports/fetchExportJobs',
  async (params = {}, { rejectWithValue }) => {
    try { return await reportsService.getExportJobs(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchExportJobDetail = createAsyncThunk('reports/fetchExportJobDetail',
  async (id, { rejectWithValue }) => {
    try { return await reportsService.getExportJobDetail(id) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const cancelExport = createAsyncThunk('reports/cancelExport',
  async (id, { rejectWithValue }) => {
    try { await reportsService.cancelExport(id); return id }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const updateSchedule = createAsyncThunk('reports/updateSchedule',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await reportsService.updateSchedule(id, data) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchUniqueClientsAnon = createAsyncThunk('reports/fetchUniqueClientsAnon',
  async (params = {}, { rejectWithValue }) => {
    try { return await reportsService.getUniqueClientsAnonReport(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchRealtimeMetrics = createAsyncThunk('reports/fetchRealtimeMetrics',
  async (params = {}, { rejectWithValue }) => {
    try { return await reportsService.getRealtimeMetrics(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchAgentDetail = createAsyncThunk('reports/fetchAgentDetail',
  async (id, { rejectWithValue }) => {
    try { return await reportsService.getAgentDetail(id) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const createSavedView = createAsyncThunk('reports/createSavedView',
  async (data, { rejectWithValue }) => {
    try { return await reportsService.createSavedView(data) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const updateSavedView = createAsyncThunk('reports/updateSavedView',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await reportsService.updateSavedView(id, data) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const cloneSavedView = createAsyncThunk('reports/cloneSavedView',
  async (id, { rejectWithValue }) => {
    try { return await reportsService.cloneSavedView(id) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchSavedViewDetail = createAsyncThunk('reports/fetchSavedViewDetail',
  async (id, { rejectWithValue }) => {
    try { return await reportsService.getSavedViewDetail(id) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchDashboardData = createAsyncThunk('reports/fetchDashboardData',
  async (params = {}, { rejectWithValue }) => {
    try { return await reportsService.getDashboardMetrics(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    metrics: null,
    scheduledReports: [],
    scheduledDetail: null,
    scheduleHistory: [],
    reportHistory: [],
    savedViews: [],
    sharedUrl: null,
    loading: false,
    scheduleActionLoading: false,
    error: null,
    exportJobId: null,
    exportJobs: [],
    exportJobDetail: null,
    realtimeMetrics: null,
    agentDetail: null,
    savedViewDetail: null,
    uniqueClientsAnon: [],
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

    // fetchScheduledDetail
    builder
      .addCase(fetchScheduledDetail.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchScheduledDetail.fulfilled, (state, action) => {
        state.scheduledDetail = action.payload
        state.loading = false
      })
      .addCase(fetchScheduledDetail.rejected, (state, action) => {
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

    // schedule management actions
    const scheduleAction = (thunk, updater) => {
      builder
        .addCase(thunk.pending, (state) => { state.scheduleActionLoading = true })
        .addCase(thunk.fulfilled, (state, action) => {
          state.scheduleActionLoading = false
          updater(state, action)
        })
        .addCase(thunk.rejected, (state, action) => {
          state.scheduleActionLoading = false
          state.error = action.payload
        })
    }

    scheduleAction(pauseSchedule, (state, action) => {
      const idx = state.scheduledReports.findIndex((r) => r.id === action.payload.id)
      if (idx !== -1) state.scheduledReports[idx].status = 'paused'
    })
    scheduleAction(resumeSchedule, (state, action) => {
      const idx = state.scheduledReports.findIndex((r) => r.id === action.payload.id)
      if (idx !== -1) state.scheduledReports[idx].status = 'active'
    })
    scheduleAction(deleteSchedule, (state, action) => {
      state.scheduledReports = state.scheduledReports.filter((r) => r.id !== action.payload.id)
    })
    scheduleAction(runScheduleNow, (state) => { state.scheduleActionLoading = false })

    builder
      .addCase(fetchScheduleHistory.fulfilled, (state, action) => {
        state.scheduleHistory = action.payload
      })

    // fetchSavedViews
    builder
      .addCase(fetchSavedViews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSavedViews.fulfilled, (state, action) => {
        state.savedViews = action.payload?.results ?? action.payload ?? []
        state.loading = false
      })
      .addCase(fetchSavedViews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // deleteSavedView
    builder
      .addCase(deleteSavedView.fulfilled, (state, action) => {
        state.savedViews = state.savedViews.filter((v) => v.id !== action.payload)
      })
      .addCase(deleteSavedView.rejected, (state, action) => {
        state.error = action.payload
      })

    builder
      .addCase(fetchExportJobs.fulfilled,     (state, a) => { state.exportJobs = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchExportJobDetail.fulfilled, (state, a) => { state.exportJobDetail = a.payload })
      .addCase(cancelExport.fulfilled,         (state, a) => { state.exportJobs = state.exportJobs.filter(j => j.id !== a.payload) })
      .addCase(updateSchedule.fulfilled,       (state, a) => { const idx = state.scheduledReports.findIndex(s => s.id === a.payload?.id); if (idx >= 0) state.scheduledReports[idx] = a.payload })
      .addCase(fetchUniqueClientsAnon.fulfilled,(state, a) => { state.uniqueClientsAnon = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchRealtimeMetrics.fulfilled,  (state, a) => { state.realtimeMetrics = a.payload })
      .addCase(fetchAgentDetail.fulfilled,      (state, a) => { state.agentDetail = a.payload })
      .addCase(createSavedView.fulfilled,       (state, a) => { state.savedViews.push(a.payload) })
      .addCase(updateSavedView.fulfilled,       (state, a) => { const idx = state.savedViews.findIndex(v => v.id === a.payload?.id); if (idx >= 0) state.savedViews[idx] = a.payload })
      .addCase(cloneSavedView.fulfilled,        (state, a) => { state.savedViews.push(a.payload) })
      .addCase(fetchSavedViewDetail.fulfilled,  (state, a) => { state.savedViewDetail = a.payload })
      .addCase(fetchDashboardData.fulfilled,    (state, a) => { state.metrics = a.payload })
  },
})
export const { updateMetrics } = reportsSlice.actions

// ── Selectores ───────────────────────────────────────────────────────────────

const selectReportsState = (state) => state.reports

export const selectMetrics = createSelector(selectReportsState, (s) => s.metrics)
export const selectScheduledReports = createSelector(selectReportsState, (s) => s.scheduledReports)
export const selectScheduleHistory = createSelector(selectReportsState, (s) => s.scheduleHistory)
export const selectReportHistory = createSelector(selectReportsState, (s) => s.reportHistory)
export const selectSavedViews = createSelector(selectReportsState, (s) => s.savedViews)
export const selectSharedUrl = createSelector(selectReportsState, (s) => s.sharedUrl)
export const selectReportsLoading = createSelector(selectReportsState, (s) => s.loading)
export const selectScheduleActionLoading = createSelector(selectReportsState, (s) => s.scheduleActionLoading)
export const selectReportsError = createSelector(selectReportsState, (s) => s.error)

export default reportsSlice.reducer
