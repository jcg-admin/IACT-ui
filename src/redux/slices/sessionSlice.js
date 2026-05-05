/**
 * Session Slice - Redux
 * Gestiona estado de:
 * - Sesiones de usuario
 * - Transacciones multi-paso
 * - Jobs asincronos
 * - Alertas en tiempo real
 */

import { createSlice } from '@reduxjs/toolkit'

// Initial State
const _initial_state = {
  // Session Info
  id: null,                     // session_id del servidor
  expiresAt: null,              // timestamp de expiración

  // Transaction Info
  txId: null,                   // transaction_id actual
  txType: null,                 // tipo de transacción
  tx: {
    id: null,
    type: null,
    status: null,               // 'initiated', 'validating', 'approved', 'completed'
    step: 0,                    // paso actual (0-based)
    totalSteps: 0,              // total de pasos
    data: {},                   // datos del usuario
    conflicts: [],              // conflictos detectados
    errors: null,               // errores de validación
    createdAt: null,
    updatedAt: null
  },

  // Jobs Info
  jobs: {},                     // { job_id: { id, type, status, progress, eta, error } }

  // Alerts Info
  alerts: [],                   // array de alertas
  lastAlertRefresh: null        // timestamp último refresh de alertas
}

// Create Slice
const sessionSlice = createSlice({
  name: 'session',
  initialState: _initial_state,
  reducers: {
    // ====== SESSION ACTIONS ======

    setSessionId(state, action) {
      /**
       * Guardar session_id del servidor
       * payload: { sessionId: string, expiresAt: timestamp }
       */
      const { sessionId, expiresAt } = action.payload
      state.id = sessionId
      state.expiresAt = expiresAt
    },

    // ====== TRANSACTION ACTIONS ======

    createTx(state, action) {
      /**
       * Iniciar transacción
       * payload: { txId, type, totalSteps, initialData }
       */
      const { txId, type, totalSteps, initialData = {} } = action.payload
      state.txId = txId
      state.txType = type
      state.tx = {
        id: txId,
        type,
        status: 'initiated',
        step: 0,
        totalSteps,
        data: initialData,
        conflicts: [],
        errors: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },

    updateTxStep(state, action) {
      /**
       * Avanzar step de transacción
       * payload: { step, data, conflicts, errors }
       */
      const { step, data, conflicts = null, errors = null } = action.payload
      if (state.tx.id) {
        state.tx.step = step
        state.tx.data = { ...state.tx.data, ...data }
        if (conflicts !== null) {
          state.tx.conflicts = conflicts
        }
        if (errors !== null) {
          state.tx.errors = errors
        }
        state.tx.status = conflicts && conflicts.length > 0 ? 'validating' : 'approved'
        state.tx.updatedAt = new Date().toISOString()
      }
    },

    addTxConflict(state, action) {
      /**
       * Agregar conflicto detectado
       * payload: conflict object { id, field, message, suggestion }
       */
      if (state.tx.id && !state.tx.conflicts.some(c => c.id === action.payload.id)) {
        state.tx.conflicts.push(action.payload)
        state.tx.updatedAt = new Date().toISOString()
      }
    },

    resolveTxConflict(state, action) {
      /**
       * Marcar conflicto como resuelto
       * payload: conflictId (string)
       */
      if (state.tx.id) {
        state.tx.conflicts = state.tx.conflicts.filter(
          c => c.id !== action.payload
        )
        state.tx.updatedAt = new Date().toISOString()
      }
    },

    confirmTx(state, action) {
      /**
       * Confirmar y completar transacción
       * payload: result object (optional)
       */
      if (state.tx.id) {
        state.tx.status = 'completed'
        state.tx.updatedAt = new Date().toISOString()
      }
    },

    cancelTx(state) {
      /**
       * Cancelar transacción en progreso
       */
      state.txId = null
      state.txType = null
      state.tx = _initial_state.tx
    },

    // ====== JOB ACTIONS ======

    startJob(state, action) {
      /**
       * Iniciar job asincrono
       * payload: { jobId, type, progress: 0, eta: null }
       */
      const { jobId, type, progress = 0, eta = null } = action.payload
      state.jobs[jobId] = {
        id: jobId,
        type,
        status: 'queued',
        progress,
        eta,
        error: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },

    updateJobProgress(state, action) {
      /**
       * Actualizar progreso del job
       * payload: { jobId, progress, eta }
       */
      const { jobId, progress, eta } = action.payload
      if (state.jobs[jobId]) {
        state.jobs[jobId].status = progress < 100 ? 'processing' : 'completed'
        state.jobs[jobId].progress = progress
        state.jobs[jobId].eta = eta
        state.jobs[jobId].updatedAt = new Date().toISOString()
      }
    },

    completeJob(state, action) {
      /**
       * Marcar job como completado
       * payload: { jobId, result? }
       */
      const { jobId, result = null } = action.payload
      if (state.jobs[jobId]) {
        state.jobs[jobId].status = 'completed'
        state.jobs[jobId].progress = 100
        state.jobs[jobId].result = result
        state.jobs[jobId].updatedAt = new Date().toISOString()
      }
    },

    setJobError(state, action) {
      /**
       * Marcar job con error
       * payload: { jobId, error }
       */
      const { jobId, error } = action.payload
      if (state.jobs[jobId]) {
        state.jobs[jobId].status = 'error'
        state.jobs[jobId].error = error
        state.jobs[jobId].updatedAt = new Date().toISOString()
      }
    },

    cancelJob(state, action) {
      /**
       * Cancelar job
       * payload: jobId
       */
      if (state.jobs[action.payload]) {
        state.jobs[action.payload].status = 'cancelled'
        state.jobs[action.payload].updatedAt = new Date().toISOString()
      }
    },

    removeJob(state, action) {
      /**
       * Remover job del estado
       * payload: jobId
       */
      delete state.jobs[action.payload]
    },

    // ====== ALERT ACTIONS ======

    setAlerts(state, action) {
      /**
       * Reemplazar lista de alertas
       * payload: alertArray
       */
      state.alerts = action.payload
      state.lastAlertRefresh = new Date().toISOString()
    },

    appendAlerts(state, action) {
      /**
       * Agregar alertas nuevas
       * payload: alertArray
       */
      state.alerts = [...state.alerts, ...action.payload]
      state.lastAlertRefresh = new Date().toISOString()
    },

    updateAlert(state, action) {
      /**
       * Actualizar alert específica
       * payload: { alertId, updates }
       */
      const { alertId, updates } = action.payload
      const _idx = state.alerts.findIndex(a => a.id === alertId)
      if (_idx !== -1) {
        state.alerts[_idx] = { ...state.alerts[_idx], ...updates }
      }
    },

    removeAlert(state, action) {
      /**
       * Remover alerta
       * payload: alertId
       */
      state.alerts = state.alerts.filter(a => a.id !== action.payload)
    },

    clearAlerts(state) {
      /**
       * Limpiar todas las alertas
       */
      state.alerts = []
    },

    // ====== SESSION CLEANUP ======

    clearSession(state) {
      /**
       * Limpiar toda la sesión (logout)
       */
      state.id = null
      state.expiresAt = null
      state.txId = null
      state.txType = null
      state.tx = _initial_state.tx
      state.jobs = {}
      state.alerts = []
      state.lastAlertRefresh = null
    }
  }
})

// ====== SELECTORS ======

export const selectSessionId = (state) => state.session.id
export const selectSessionExpiresAt = (state) => state.session.expiresAt
export const selectIsSessionActive = (state) => {
  if (!state.session.id) return false
  if (!state.session.expiresAt) return true
  return new Date().getTime() < state.session.expiresAt
}

export const selectTxId = (state) => state.session.txId
export const selectTxType = (state) => state.session.txType
export const selectTx = (state) => state.session.tx
export const selectTxStep = (state) => state.session.tx.step
export const selectTxStatus = (state) => state.session.tx.status
export const selectTxData = (state) => state.session.tx.data
export const selectTxConflicts = (state) => state.session.tx.conflicts
export const selectTxErrors = (state) => state.session.tx.errors
export const selectTxProgress = (state) => {
  const { step, totalSteps } = state.session.tx
  return totalSteps > 0 ? (step / totalSteps) * 100 : 0
}

export const selectJob = (state, _jobId) => state.session.jobs[_jobId]
export const selectAllJobs = (state) => Object.values(state.session.jobs)
export const selectActiveJobs = (state) =>
  Object.values(state.session.jobs).filter(
    j => j.status === 'processing' || j.status === 'queued'
  )
export const selectCompletedJobs = (state) =>
  Object.values(state.session.jobs).filter(j => j.status === 'completed')

export const selectAlerts = (state) => state.session.alerts
export const selectAlertCount = (state) => state.session.alerts.length
export const selectNewAlerts = (state) =>
  state.session.alerts.filter(a => !a.isRead)
export const selectLastAlertRefresh = (state) => state.session.lastAlertRefresh

// Export Actions
export const {
  // Session
  setSessionId,
  // Transaction
  createTx,
  updateTxStep,
  addTxConflict,
  resolveTxConflict,
  confirmTx,
  cancelTx,
  // Jobs
  startJob,
  updateJobProgress,
  completeJob,
  setJobError,
  cancelJob,
  removeJob,
  // Alerts
  setAlerts,
  appendAlerts,
  updateAlert,
  removeAlert,
  clearAlerts,
  // Cleanup
  clearSession
} = sessionSlice.actions

// Export Reducer
export default sessionSlice.reducer
