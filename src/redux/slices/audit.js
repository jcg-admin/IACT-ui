/**
 * audit.slice — IACT v2
 * CNST-009: Auditoría Inmutable — solo lectura, sin edición/eliminación.
 *
 * Sincronizado con auditGateway v2 (T1.6 + T3.3):
 *   ELIMINADOS: fetchAuditSummary (getAuditSummary eliminado T1.6)
 *               fetchLoginHistory (getLogsByUser eliminado T1.6)
 *   AÑADIDOS: fetchAuditLogDetail, fetchAuditEvents, fetchAuditEventDetail,
 *             fetchAuditEventAggregations, exportAuditEvents,
 *             fetchGeneralTimeline, fetchAuditIntegrity,
 *             verifyCompliance, exportAuditLogs
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import auditService from '../../services/auditGateway'

const rw = (fn) => async (arg, { rejectWithValue }) => {
  try { return await fn(arg) }
  catch (e) { return rejectWithValue({ message: e.message, statusCode: e.response?.status ?? null }) }
}

// ── UC_AUD_01 — Consultar logs ────────────────────────────────────────────────
export const fetchAuditLogs = createAsyncThunk('audit/fetchAuditLogs',
  rw((filters) => auditService.getAuditLogs(filters)))

export const fetchAuditLogDetail = createAsyncThunk('audit/fetchAuditLogDetail',
  rw((id) => auditService.getAuditLogDetail(id)))

// ── UC_AUD_02 — Buscar ────────────────────────────────────────────────────────
export const searchAuditLogs = createAsyncThunk('audit/searchAuditLogs',
  rw((params) => auditService.searchLogs(params)))

// ── UC_AUD_03 — Exportar ──────────────────────────────────────────────────────
export const exportAuditLogs = createAsyncThunk('audit/exportAuditLogs',
  rw(({ format, filters } = {}) => auditService.exportLogs(format, filters)))

// ── UC_AUD_04 — Compliance ────────────────────────────────────────────────────
export const fetchComplianceReport = createAsyncThunk('audit/fetchComplianceReport',
  rw((filters) => auditService.getComplianceReport(filters)))

export const verifyCompliance = createAsyncThunk('audit/verifyCompliance',
  rw((reportId) => auditService.verifyCompliance(reportId)))

// ── UC_PERM_10 — Audit Events ─────────────────────────────────────────────────
export const fetchAuditEvents = createAsyncThunk('audit/fetchAuditEvents',
  rw((params) => auditService.getAuditEvents(params)))

export const fetchAuditEventDetail = createAsyncThunk('audit/fetchAuditEventDetail',
  rw((id) => auditService.getAuditEventDetail(id)))

export const fetchAuditEventAggregations = createAsyncThunk('audit/fetchAuditEventAggregations',
  rw((params) => auditService.getAuditEventAggregations(params)))

export const exportAuditEvents = createAsyncThunk('audit/exportAuditEvents',
  rw((filters) => auditService.exportAuditEvents(filters)))

// ── UC_AUD_01 ext — Timeline general ─────────────────────────────────────────
export const fetchGeneralTimeline = createAsyncThunk('audit/fetchGeneralTimeline',
  rw((params) => auditService.getGeneralTimeline(params)))

// ── UC_AUD_04 ext — Integridad ────────────────────────────────────────────────
export const fetchAuditIntegrity = createAsyncThunk('audit/fetchAuditIntegrity',
  rw((params) => auditService.verifyIntegrity(params)))

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  logs:              [],
  logDetail:         null,
  searchResults:     [],
  complianceReport:  null,
  complianceVerification: null,
  auditEvents:       [],
  auditEventDetail:  null,
  auditEventAggregations: null,
  generalTimeline:   [],
  integrityResult:   null,
  exportJobId:       null,
  loading:           false,
  error:             null,
  filters: {
    dateStart: null, dateEnd: null,
    userId: null, action: null, resource: null, limit: 100,
  },
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null },
    setFilters:   (state, a) => { state.filters = { ...state.filters, ...a.payload } },
    resetFilters: (state) => { state.filters = initialState.filters },
    resetState:   () => initialState,
  },
  extraReducers: (builder) => {
    const lp = (state) => { state.loading = true;  state.error = null }
    const lf = (state) => { state.loading = false }
    const lr = (state, a) => { state.loading = false; state.error = a.payload }

    builder
      .addCase(fetchAuditLogs.pending,   lp)
      .addCase(fetchAuditLogs.fulfilled, (s,a) => { lf(s); s.logs = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchAuditLogs.rejected,  lr)

      .addCase(fetchAuditLogDetail.pending,   lp)
      .addCase(fetchAuditLogDetail.fulfilled, (s,a) => { lf(s); s.logDetail = a.payload })
      .addCase(fetchAuditLogDetail.rejected,  lr)

      .addCase(searchAuditLogs.pending,   lp)
      .addCase(searchAuditLogs.fulfilled, (s,a) => { lf(s); s.searchResults = a.payload?.results ?? a.payload ?? [] })
      .addCase(searchAuditLogs.rejected,  lr)

      .addCase(exportAuditLogs.pending,   lp)
      .addCase(exportAuditLogs.fulfilled, (s,a) => { lf(s); s.exportJobId = a.payload?.job_id ?? null })
      .addCase(exportAuditLogs.rejected,  lr)

      .addCase(fetchComplianceReport.pending,   lp)
      .addCase(fetchComplianceReport.fulfilled, (s,a) => { lf(s); s.complianceReport = a.payload })
      .addCase(fetchComplianceReport.rejected,  lr)

      .addCase(verifyCompliance.pending,   lp)
      .addCase(verifyCompliance.fulfilled, (s,a) => { lf(s); s.complianceVerification = a.payload })
      .addCase(verifyCompliance.rejected,  lr)

      .addCase(fetchAuditEvents.pending,   lp)
      .addCase(fetchAuditEvents.fulfilled, (s,a) => { lf(s); s.auditEvents = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchAuditEvents.rejected,  lr)

      .addCase(fetchAuditEventDetail.pending,   lp)
      .addCase(fetchAuditEventDetail.fulfilled, (s,a) => { lf(s); s.auditEventDetail = a.payload })
      .addCase(fetchAuditEventDetail.rejected,  lr)

      .addCase(fetchAuditEventAggregations.pending,   lp)
      .addCase(fetchAuditEventAggregations.fulfilled, (s,a) => { lf(s); s.auditEventAggregations = a.payload })
      .addCase(fetchAuditEventAggregations.rejected,  lr)

      .addCase(exportAuditEvents.pending,   lp)
      .addCase(exportAuditEvents.fulfilled, (s,a) => { lf(s); s.exportJobId = a.payload?.job_id ?? null })
      .addCase(exportAuditEvents.rejected,  lr)

      .addCase(fetchGeneralTimeline.pending,   lp)
      .addCase(fetchGeneralTimeline.fulfilled, (s,a) => { lf(s); s.generalTimeline = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchGeneralTimeline.rejected,  lr)

      .addCase(fetchAuditIntegrity.pending,   lp)
      .addCase(fetchAuditIntegrity.fulfilled, (s,a) => { lf(s); s.integrityResult = a.payload })
      .addCase(fetchAuditIntegrity.rejected,  lr)
  },
})

export const { clearError, setFilters, resetFilters, resetState } = auditSlice.actions

// Selectors
export const selectLogs                    = (s) => s.audit.logs
export const selectLogDetail               = (s) => s.audit.logDetail
export const selectSearchResults           = (s) => s.audit.searchResults
export const selectComplianceReport        = (s) => s.audit.complianceReport
export const selectComplianceVerification  = (s) => s.audit.complianceVerification
export const selectAuditEvents             = (s) => s.audit.auditEvents
export const selectAuditEventDetail        = (s) => s.audit.auditEventDetail
export const selectAuditEventAggregations  = (s) => s.audit.auditEventAggregations
export const selectGeneralTimeline         = (s) => s.audit.generalTimeline
export const selectIntegrityResult         = (s) => s.audit.integrityResult
export const selectExportJobId             = (s) => s.audit.exportJobId
export const selectLoading                 = (s) => s.audit.loading
export const selectError                   = (s) => s.audit.error
export const selectFilters                 = (s) => s.audit.filters
// Derived selectors (operan sobre logs en memoria — no hacen fetch)
export const selectLogsByUser    = (s, uid) => s.audit.logs.filter(l => l.user_id === uid)
export const selectLogsByAction  = (s, act) => s.audit.logs.filter(l => l.action === act)
export const selectCriticalLogs  = (s)      => s.audit.logs.filter(l => l.severity === 'CRITICAL')

export default auditSlice.reducer
