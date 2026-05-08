/**
 * useJobPolling Hook
 * Gestiona polling periodico de jobs asincronos
 * Actualiza progreso automáticamente cada X segundos
 */

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectJob,
  selectAllJobs,
  startJob,
  updateJobProgress,
  completeJob,
  setJobError,
  removeJob
} from '@redux/slices/sessionSlice'
import jobService from '@services/jobService'

export function useJobStatus(_jobId, _interval = 5000) {
  // Refs
  const _dispatch = useDispatch()
  const _isMounted = useRef(true)
  const _pollTimer = useRef(null)
  const _jobId_ref = useRef(_jobId)

  // State
  const [_isPolling, setIsPolling] = useState(false)
  const [_error, setError] = useState(null)

  // Redux selectors
  const _job = useSelector(state => selectJob(state, _jobId))

  // ====== POLLING METHODS ======

  /**
   * Una iteración de polling
   * GET /api/job/status/{jobId}
   */
  const _pollOnce = async () => {
    try {
      if (!_jobId_ref.current) return

      // Obtener status del backend
      const _response = await jobService.status(_jobId_ref.current)

      if (!_isMounted.current) return

      // Actualizar en Redux
      _dispatch(
        updateJobProgress({
          jobId: _jobId_ref.current,
          progress: _response.progress || 0,
          eta: _response.eta || null
        })
      )

      // Si completó, detener polling
      if (_response.status === 'completed') {
        _stopPolling()
        _dispatch(completeJob({ jobId: _jobId_ref.current }))
      }

      // Si error, detener polling y guardar error
      if (_response.status === 'error') {
        _stopPolling()
        _dispatch(
          setJobError({
            jobId: _jobId_ref.current,
            error: _response.error
          })
        )
        setError(_response.error)
      }

      setError(null)
    } catch (_err) {
      if (!_isMounted.current) return
      console.error('[useJobPolling] Poll error:', _err)
      setError(_err.message || 'Polling error')
    }
  }

  /**
   * Iniciar polling periodico
   */
  const startPolling = () => {
    if (_pollTimer.current) return // Ya polling

    setIsPolling(true)

    // Primera lectura inmediata
    _pollOnce()

    // Luego periodico
    _pollTimer.current = setInterval(() => {
      _pollOnce()
    }, _interval)
  }

  /**
   * Detener polling
   */
  const _stopPolling = () => {
    if (_pollTimer.current) {
      clearInterval(_pollTimer.current)
      _pollTimer.current = null
    }
    setIsPolling(false)
  }

  /**
   * Parar polling explícitamente (desde componente)
   */
  const stopPolling = () => {
    _stopPolling()
  }

  /**
   * Descargar resultado del job
   * GET /api/job/download/{jobId}
   */
  const downloadResult = async () => {
    try {
      if (!_jobId_ref.current) {
        throw new Error('No job ID')
      }

      // Verificar que completó
      if (_job?.status !== 'completed') {
        throw new Error('Job not completed yet')
      }

      // Descargar archivo
      const _blob = await jobService.download(_jobId_ref.current)

      if (!_isMounted.current) return

      // Disparar descarga en browser
      const _url = window.URL.createObjectURL(_blob)
      const _link = document.createElement('a')
      _link.href = _url
      _link.download = `export_${_jobId_ref.current}_${Date.now()}.csv`
      document.body.appendChild(_link)
      _link.click()
      document.body.removeChild(_link)
      window.URL.revokeObjectURL(_url)

      return { success: true }
    } catch (_err) {
      console.error('[useJobPolling] Download error:', _err)
      setError(_err.message || 'Download error')
      return { success: false, error: _err.message }
    }
  }

  /**
   * Cancelar job
   * POST /api/job/cancel/{jobId}
   */
  const cancelJob = async () => {
    try {
      if (!_jobId_ref.current) {
        throw new Error('No job ID')
      }

      // Cancelar en backend
      await jobService.cancel(_jobId_ref.current)

      if (!_isMounted.current) return

      // Detener polling
      _stopPolling()

      // Remover de Redux
      _dispatch(removeJob(_jobId_ref.current))

      return { success: true }
    } catch (_err) {
      console.error('[useJobPolling] Cancel error:', _err)
      setError(_err.message || 'Cancel error')
      return { success: false, error: _err.message }
    }
  }

  // ====== EFFECTS ======

  /**
   * Iniciar polling cuando jobId cambia
   */
  useEffect(() => {
    _jobId_ref.current = _jobId

    if (_jobId) {
      startPolling()
    }

    return () => {
      _stopPolling()
    }
  }, [_jobId, _interval])

  /**
   * Cleanup en unmount
   */
  useEffect(() => {
    return () => {
      _isMounted.current = false
      if (_pollTimer.current) {
        clearInterval(_pollTimer.current)
      }
    }
  }, [])

  // ====== RETURN ======

  return {
    // Estado
    job: _job,
    status: _job?.status || null,
    progress: _job?.progress || 0,
    eta: _job?.eta || null,
    isPolling: _isPolling,
    error: _error || _job?.error || null,

    // Métodos
    startPolling,
    stopPolling,
    downloadResult,
    cancelJob
  }
}

export default useJobStatus
