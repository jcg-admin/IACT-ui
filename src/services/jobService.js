/**
 * Job Service - WITH DECORATORS
 * 
 * Gestiona jobs asincronos con:
 * - Automatic caching (status queries)
 * - Automatic logging (all operations)
 * - Automatic validation (IDs and params)
 * 
 * API Endpoints:
 * POST   /api/job/start/                  - Iniciar job
 * GET    /api/job/{id}/status/            - Obtener status
 * GET    /api/job/{id}/download/          - Descargar resultado
 * POST   /api/job/{id}/cancel/            - Cancelar job
 */

import apiService from './apiService'
import { getNotificationService } from './notificationService'
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
 * Iniciar job asincrono
 */
async function startBase(jobType, filters = {}) {
  try {
    const response = await apiService.post('/api/job/start/', {
      type: jobType,
      filters: filters
    })
    const result = {
      jobId: response.jobId,
      type: response.type,
      status: response.status,
      progress: response.progress || 0,
      eta: response.eta || null
    }

    const notify = getNotificationService()
    notify.success(`Job started: ${jobType}`)

    return result
  } catch (error) {
    const notify = getNotificationService()
    notify.error(`Failed to start job: ${error.message}`)
    throw error
  }
}

/**
 * Obtener status de job
 */
async function statusBase(jobId) {
  const response = await apiService.get(`/api/job/${jobId}/status/`)
  return {
    jobId: response.jobId,
    status: response.status,
    progress: response.progress || 0,
    eta: response.eta || null,
    error: response.error || null
  }
}

/**
 * Descargar resultado del job
 */
async function downloadBase(jobId) {
  try {
    const result = await apiService.get(`/api/job/${jobId}/download/`)
    
    const notify = getNotificationService()
    notify.success('Job downloaded successfully')
    
    return result
  } catch (error) {
    const notify = getNotificationService()
    notify.error(`Failed to download job: ${error.message}`)
    throw error
  }
}

/**
 * Cancelar job
 */
async function cancelBase(jobId) {
  try {
    const response = await apiService.post(`/api/job/${jobId}/cancel/`, {})
    const result = {
      status: response.status
    }

    const notify = getNotificationService()
    notify.success('Job cancelled successfully')

    return result
  } catch (error) {
    const notify = getNotificationService()
    notify.error(`Failed to cancel job: ${error.message}`)
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Decorated functions (with caching, logging, validation)
// ─────────────────────────────────────────────────────────────────────────

/**
 * START - Loggear + Validar
 * No cachear: cada start() debería ser una nueva llamada
 */
const start = withLogging(
  withValidation(
    startBase,
    // Validar jobType y filters
    (jobType, filters = {}) => {
      if (!jobType || typeof jobType !== 'string') {
        return { valid: false, message: 'Job type must be a valid string' }
      }
      if (filters && typeof filters !== 'object') {
        return { valid: false, message: 'Filters must be an object' }
      }
      return { valid: true }
    },
    { fnName: 'jobService.start' }
  ),
  'jobService.start'
)

/**
 * STATUS - Cachear + Loguear + Validar
 * Cachear por 1 minuto: status es relativamente estable durante este período
 */
const status = withCaching(
  withLogging(
    withValidation(
      statusBase,
      CommonValidators.validateId('Job ID'),
      { fnName: 'jobService.status' }
    ),
    'jobService.status'
  ),
  CACHE_TTL.SHORT, // 1 minuto
  (jobId) => `job:status:${jobId}`
)

/**
 * DOWNLOAD - Loguear + Validar
 * No cachear: cada download() es una descarga única
 */
const download = withLogging(
  withValidation(
    downloadBase,
    CommonValidators.validateId('Job ID'),
    { fnName: 'jobService.download' }
  ),
  'jobService.download'
)

/**
 * CANCEL - Loguear + Validar
 * No cachear: cancelación es operación única
 */
const cancel = withLogging(
  withValidation(
    cancelBase,
    CommonValidators.validateId('Job ID'),
    { fnName: 'jobService.cancel' }
  ),
  'jobService.cancel'
)

const jobService = {
  start,
  status,
  download,
  cancel
}

export default jobService
export { start, status, download, cancel }
