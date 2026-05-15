/**
 * alerts.slice — IACT v2
 *
 * Sincronizado con alertsGateway v2 (T2.1 + T3.1):
 *   ELIMINADO: fetchTemplates → getTemplates() no existe en IACT-api
 *   AÑADIDOS: fetchActiveAlerts, fetchAlertRules, fetchAlertRuleDetail,
 *             dryRunAlertRule, pauseAlertRule, resumeAlertRule,
 *             bulkAcknowledgeAlerts, createSubscription, cancelSubscription
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import alertsService from '../../services/alertsGateway'

const rw = (thunkFn) => async (arg, { rejectWithValue }) => {
  try { return await thunkFn(arg) }
  catch (e) { return rejectWithValue({ message: e.message, statusCode: e.response?.status ?? null }) }
}

// ── UC_ALR_02 — Alertas activas ───────────────────────────────────────────────
export const fetchAlerts = createAsyncThunk('alerts/fetchAlerts',
  rw((p) => alertsService.getAlerts(p)))

export const fetchActiveAlerts = createAsyncThunk('alerts/fetchActiveAlerts',
  rw((p) => alertsService.getActiveAlerts(p)))

// ── UC_ALR_01 — Reglas de alerta ──────────────────────────────────────────────
export const fetchAlertRules = createAsyncThunk('alerts/fetchAlertRules',
  rw((p) => alertsService.getAlertRules(p)))

export const fetchAlertRuleDetail = createAsyncThunk('alerts/fetchAlertRuleDetail',
  rw((id) => alertsService.getAlertRuleDetail(id)))

export const createAlert = createAsyncThunk('alerts/createAlert',
  rw((cfg) => alertsService.createAlert(cfg)))

export const updateAlert = createAsyncThunk('alerts/updateAlert',
  rw(({ alertId, config }) => alertsService.updateAlert(alertId, config)))

export const deleteAlert = createAsyncThunk('alerts/deleteAlert',
  async (alertId, { rejectWithValue }) => {
    try { await alertsService.deleteAlert(alertId); return alertId }
    catch (e) { return rejectWithValue({ message: e.message }) }
  })

export const dryRunAlertRule = createAsyncThunk('alerts/dryRunAlertRule',
  rw((config) => alertsService.dryRunAlertRule(config)))

export const pauseAlertRule = createAsyncThunk('alerts/pauseAlertRule',
  rw((ruleId) => alertsService.pauseAlertRule(ruleId)))

export const resumeAlertRule = createAsyncThunk('alerts/resumeAlertRule',
  rw((ruleId) => alertsService.resumeAlertRule(ruleId)))

// ── UC_ALR_04 — Historial ──────────────────────────────────────────────────────
export const fetchAlertHistory = createAsyncThunk('alerts/fetchAlertHistory',
  rw((filters) => alertsService.getAlertHistory(filters)))

// ── UC_ALR_03 — Reconocimiento ────────────────────────────────────────────────
export const acknowledgeAlert = createAsyncThunk('alerts/acknowledgeAlert',
  rw(({ alertId, note }) => alertsService.acknowledgeAlert(alertId, note)))

export const bulkAcknowledgeAlerts = createAsyncThunk('alerts/bulkAcknowledgeAlerts',
  rw((alertIds) => alertsService.bulkAcknowledgeAlerts(alertIds)))

// ── UC_ALR_05 — Suscripciones ─────────────────────────────────────────────────
export const fetchMySubscriptions = createAsyncThunk('alerts/fetchMySubscriptions',
  rw(() => alertsService.getMySubscriptions()))

export const subscribeToAlert = createAsyncThunk('alerts/subscribeToAlert',
  rw((data) => alertsService.subscribeToAlert(data)))

export const createSubscription = createAsyncThunk('alerts/createSubscription',
  rw((data) => alertsService.createSubscription(data)))

export const unsubscribeFromAlert = createAsyncThunk('alerts/unsubscribeFromAlert',
  async (subscriptionId, { rejectWithValue }) => {
    try { await alertsService.unsubscribeFromAlert(subscriptionId); return subscriptionId }
    catch (e) { return rejectWithValue({ message: e.message }) }
  })

export const cancelSubscription = createAsyncThunk('alerts/cancelSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try { await alertsService.cancelSubscription(subscriptionId); return subscriptionId }
    catch (e) { return rejectWithValue({ message: e.message }) }
  })

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
  alerts:          [],
  activeAlerts:    [],
  alertRules:      [],
  alertRuleDetail: null,
  dryRunResult:    null,
  subscriptions:   [],
  history:         [],
  loading:         false,
  ruleLoading:     false,
  error:           null,
  success:         false,
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null },
    clearSuccess: (state) => { state.success = false },
    resetState:   () => initialState,
  },
  extraReducers: (builder) => {
    const pending  = (key) => (state) => { state[key] = true;  state.error = null }
    const rejected = (key) => (state, a) => { state[key] = false; state.error = a.payload }

    // fetchAlerts / fetchActiveAlerts
    builder
      .addCase(fetchAlerts.pending,         pending('loading'))
      .addCase(fetchAlerts.fulfilled,       (state, a) => { state.loading = false; state.alerts = a.payload })
      .addCase(fetchAlerts.rejected,        rejected('loading'))
      .addCase(fetchActiveAlerts.pending,   pending('loading'))
      .addCase(fetchActiveAlerts.fulfilled, (state, a) => { state.loading = false; state.activeAlerts = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchActiveAlerts.rejected,  rejected('loading'))

    // fetchAlertRules / fetchAlertRuleDetail
    builder
      .addCase(fetchAlertRules.pending,         pending('ruleLoading'))
      .addCase(fetchAlertRules.fulfilled,       (state, a) => { state.ruleLoading = false; state.alertRules = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchAlertRules.rejected,        rejected('ruleLoading'))
      .addCase(fetchAlertRuleDetail.pending,    pending('ruleLoading'))
      .addCase(fetchAlertRuleDetail.fulfilled,  (state, a) => { state.ruleLoading = false; state.alertRuleDetail = a.payload })
      .addCase(fetchAlertRuleDetail.rejected,   rejected('ruleLoading'))

    // createAlert / updateAlert / deleteAlert
    builder
      .addCase(createAlert.pending,   pending('loading'))
      .addCase(createAlert.fulfilled, (state, a) => { state.loading = false; state.success = true; state.alertRules.push(a.payload) })
      .addCase(createAlert.rejected,  rejected('loading'))
      .addCase(updateAlert.pending,   pending('loading'))
      .addCase(updateAlert.fulfilled, (state, a) => {
        state.loading = false; state.success = true
        const idx = state.alertRules.findIndex(r => r.id === a.payload.id)
        if (idx !== -1) state.alertRules[idx] = a.payload
      })
      .addCase(updateAlert.rejected,  rejected('loading'))
      .addCase(deleteAlert.pending,   pending('loading'))
      .addCase(deleteAlert.fulfilled, (state, a) => { state.loading = false; state.success = true; state.alertRules = state.alertRules.filter(r => r.id !== a.payload) })
      .addCase(deleteAlert.rejected,  rejected('loading'))

    // dryRunAlertRule / pauseAlertRule / resumeAlertRule
    builder
      .addCase(dryRunAlertRule.pending,   pending('ruleLoading'))
      .addCase(dryRunAlertRule.fulfilled, (state, a) => { state.ruleLoading = false; state.dryRunResult = a.payload })
      .addCase(dryRunAlertRule.rejected,  rejected('ruleLoading'))
      .addCase(pauseAlertRule.pending,    pending('ruleLoading'))
      .addCase(pauseAlertRule.fulfilled,  (state) => { state.ruleLoading = false; state.success = true })
      .addCase(pauseAlertRule.rejected,   rejected('ruleLoading'))
      .addCase(resumeAlertRule.pending,   pending('ruleLoading'))
      .addCase(resumeAlertRule.fulfilled, (state) => { state.ruleLoading = false; state.success = true })
      .addCase(resumeAlertRule.rejected,  rejected('ruleLoading'))

    // fetchAlertHistory
    builder
      .addCase(fetchAlertHistory.pending,   pending('loading'))
      .addCase(fetchAlertHistory.fulfilled, (state, a) => { state.loading = false; state.history = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchAlertHistory.rejected,  rejected('loading'))

    // acknowledgeAlert / bulkAcknowledgeAlerts
    builder
      .addCase(acknowledgeAlert.pending,          (state) => { state.error = null })
      .addCase(acknowledgeAlert.fulfilled,        (state, a) => {
        const idx = state.activeAlerts.findIndex(al => String(al.id) === String(a.payload?.id))
        if (idx !== -1) state.activeAlerts[idx] = { ...state.activeAlerts[idx], state: 'acknowledged' }
      })
      .addCase(acknowledgeAlert.rejected,         (state, a) => { state.error = a.payload })
      .addCase(bulkAcknowledgeAlerts.pending,     (state) => { state.error = null })
      .addCase(bulkAcknowledgeAlerts.fulfilled,   (state) => { state.success = true })
      .addCase(bulkAcknowledgeAlerts.rejected,    (state, a) => { state.error = a.payload })

    // Subscriptions
    builder
      .addCase(fetchMySubscriptions.pending,   pending('loading'))
      .addCase(fetchMySubscriptions.fulfilled, (state, a) => { state.loading = false; state.subscriptions = a.payload?.results ?? a.payload ?? [] })
      .addCase(fetchMySubscriptions.rejected,  rejected('loading'))
      .addCase(subscribeToAlert.pending,       pending('loading'))
      .addCase(subscribeToAlert.fulfilled,     (state, a) => { state.loading = false; state.success = true; state.subscriptions.push(a.payload) })
      .addCase(subscribeToAlert.rejected,      rejected('loading'))
      .addCase(createSubscription.pending,     pending('loading'))
      .addCase(createSubscription.fulfilled,   (state, a) => { state.loading = false; state.success = true; state.subscriptions.push(a.payload) })
      .addCase(createSubscription.rejected,    rejected('loading'))
      .addCase(unsubscribeFromAlert.pending,   pending('loading'))
      .addCase(unsubscribeFromAlert.fulfilled, (state, a) => { state.loading = false; state.success = true; state.subscriptions = state.subscriptions.filter(s => s.id !== a.payload) })
      .addCase(unsubscribeFromAlert.rejected,  rejected('loading'))
      .addCase(cancelSubscription.pending,     pending('loading'))
      .addCase(cancelSubscription.fulfilled,   (state, a) => { state.loading = false; state.success = true; state.subscriptions = state.subscriptions.filter(s => s.id !== a.payload) })
      .addCase(cancelSubscription.rejected,    rejected('loading'))
  },
})

export const { clearError, clearSuccess, resetState } = alertsSlice.actions

// Selectors
export const selectAlerts             = (s) => s.alerts.alerts
export const selectActiveAlerts       = (s) => s.alerts.activeAlerts
export const selectAlertRules         = (s) => s.alerts.alertRules
export const selectAlertRuleDetail    = (s) => s.alerts.alertRuleDetail
export const selectDryRunResult       = (s) => s.alerts.dryRunResult
export const selectSubscriptions      = (s) => s.alerts.subscriptions
export const selectHistory            = (s) => s.alerts.history
export const selectLoading            = (s) => s.alerts.loading
export const selectRuleLoading        = (s) => s.alerts.ruleLoading
export const selectError              = (s) => s.alerts.error
export const selectSuccess            = (s) => s.alerts.success
export const selectUserSubscribedAlerts = (s) => s.alerts.subscriptions.map(sub => sub.rule_id)

export default alertsSlice.reducer
