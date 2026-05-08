/**
 * Transaction Service - WITH DECORATORS
 * 
 * Gestiona transacciones multi-paso via API con:
 * - Automatic caching (status queries)
 * - Automatic logging (all operations)
 * - Automatic validation (IDs and parameters)
 * 
 * API Endpoints:
 * POST   /api/transaction/start/              - Iniciar transaccion
 * POST   /api/transaction/{id}/step/          - Avanzar paso
 * POST   /api/transaction/{id}/confirm/       - Confirmar transaccion
 * POST   /api/transaction/{id}/cancel/        - Cancelar transaccion
 * POST   /api/transaction/{id}/conflict/{id}/resolve/ - Resolver conflicto
 * GET    /api/transaction/{id}/status/        - Obtener status
 */

import apiService from './apiClient'
import {
  withCaching,
  withLogging,
  withValidation,
  CommonValidators,
  CACHE_TTL,
} from '../decorators'

// ─────────────────────────────────────────────────────────────────────────
// Base functions (without decorators)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Iniciar nueva transaccion
 */
async function startBase(txType, data) {
  const response = await apiService.post('/api/transaction/start/', {
    type: txType,
    data: data
  })
  return {
    transaction_id: response.transaction_id,
    type: response.type,
    total_steps: response.total_steps || 3,
    conflicts: response.conflicts || []
  }
}

/**
 * Avanzar al siguiente paso
 */
async function stepBase(txId, step, stepData) {
  const response = await apiService.post(`/api/transaction/${txId}/step/`, {
    step: step,
    data: stepData
  })
  return {
    step: response.step,
    conflicts: response.conflicts || [],
    errors: response.errors || null
  }
}

/**
 * Confirmar y ejecutar transaccion
 */
async function confirmBase(txId, finalData) {
  const response = await apiService.post(`/api/transaction/${txId}/confirm/`, {
    data: finalData
  })
  return {
    status: response.status,
    result: response.result || null
  }
}

/**
 * Cancelar transaccion
 */
async function cancelBase(txId) {
  const response = await apiService.post(`/api/transaction/${txId}/cancel/`, {})
  return {
    status: response.status
  }
}

/**
 * Resolver conflicto detectado
 */
async function resolveConflictBase(txId, conflictId, resolution) {
  const response = await apiService.post(
    `/api/transaction/${txId}/conflict/${conflictId}/resolve/`,
    resolution
  )
  return {
    resolved: response.resolved,
    new_conflicts: response.new_conflicts || []
  }
}

/**
 * Obtener status de transaccion
 */
async function statusBase(txId) {
  const response = await apiService.get(`/api/transaction/${txId}/status/`)
  return {
    transaction_id: response.transaction_id,
    step: response.step,
    status: response.status,
    data: response.data || {}
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Decorated functions (with caching, logging, validation)
// ─────────────────────────────────────────────────────────────────────────

/**
 * START - Loguear + Validar
 * No cachear: cada transacción es única
 */
const start = withLogging(
  withValidation(
    startBase,
    (txType, data = {}) => {
      if (!txType || typeof txType !== 'string') {
        return { valid: false, message: 'Transaction type must be a valid string' }
      }
      if (data && typeof data !== 'object') {
        return { valid: false, message: 'Data must be an object' }
      }
      return { valid: true }
    },
    { fnName: 'transactionService.start' }
  ),
  'transactionService.start'
)

/**
 * STEP - Loguear + Validar
 * No cachear: pasos son secuenciales
 */
const step = withLogging(
  withValidation(
    stepBase,
    (txId, stepNum, stepData) => {
      if (!txId || typeof txId !== 'string') {
        return { valid: false, message: 'Transaction ID must be valid' }
      }
      if (typeof stepNum !== 'number' || stepNum < 0) {
        return { valid: false, message: 'Step must be a valid number' }
      }
      if (stepData && typeof stepData !== 'object') {
        return { valid: false, message: 'Step data must be an object' }
      }
      return { valid: true }
    },
    { fnName: 'transactionService.step' }
  ),
  'transactionService.step'
)

/**
 * CONFIRM - Loguear + Validar
 * No cachear: operación única
 */
const confirm = withLogging(
  withValidation(
    confirmBase,
    (txId, finalData) => {
      if (!txId || typeof txId !== 'string') {
        return { valid: false, message: 'Transaction ID must be valid' }
      }
      if (finalData && typeof finalData !== 'object') {
        return { valid: false, message: 'Final data must be an object' }
      }
      return { valid: true }
    },
    { fnName: 'transactionService.confirm' }
  ),
  'transactionService.confirm'
)

/**
 * CANCEL - Loguear + Validar
 * No cachear: operación única
 */
const cancel = withLogging(
  withValidation(
    cancelBase,
    CommonValidators.validateId('Transaction ID'),
    { fnName: 'transactionService.cancel' }
  ),
  'transactionService.cancel'
)

/**
 * RESOLVE CONFLICT - Loguear + Validar
 * No cachear: operación única
 */
const resolveConflict = withLogging(
  withValidation(
    resolveConflictBase,
    (txId, conflictId, resolution) => {
      if (!txId || typeof txId !== 'string') {
        return { valid: false, message: 'Transaction ID must be valid' }
      }
      if (!conflictId || typeof conflictId !== 'string') {
        return { valid: false, message: 'Conflict ID must be valid' }
      }
      if (resolution && typeof resolution !== 'object') {
        return { valid: false, message: 'Resolution must be an object' }
      }
      return { valid: true }
    },
    { fnName: 'transactionService.resolveConflict' }
  ),
  'transactionService.resolveConflict'
)

/**
 * STATUS - Cachear + Loguear + Validar
 * Cachear por 1 minuto: status es relativamente estable
 */
const status = withCaching(
  withLogging(
    withValidation(
      statusBase,
      CommonValidators.validateId('Transaction ID'),
      { fnName: 'transactionService.status' }
    ),
    'transactionService.status'
  ),
  CACHE_TTL.SHORT, // 1 minuto
  (txId) => `transaction:status:${txId}`
)

const transactionService = {
  start,
  step,
  confirm,
  cancel,
  resolveConflict,
  status
}

export default transactionService
export { start, step, confirm, cancel, resolveConflict, status }
