/**
 * useAlertPolling Hook
 * Gestiona polling periodico de alertas nuevas
 * Solo obtiene alertas nuevas desde último refresh
 */

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAlerts,
  selectLastAlertRefresh,
  setAlerts,
  appendAlerts,
  updateAlert,
  removeAlert,
  clearAlerts
} from '@redux/slices/session'
import apiService from '@services/apiService'

export function useAlertFeed(interval = 30000) {
  // Refs
  const dispatch = useDispatch()
  const isMounted = useRef(true)
  const pollTimer = useRef(null)

  // State
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState(null)

  // Redux selectors
  const alerts = useSelector(selectAlerts)
  const lastRefresh = useSelector(selectLastAlertRefresh)

  // ====== POLLING METHODS ======

  /**
   * Una iteración de polling
   * GET /api/alerts/ with since parameter
   */
  const pollOnce = async () => {
    try {
      // Obtener alertas nuevas desde último refresh
      let url = '/api/alerts/'
      if (lastRefresh) {
        url += `?since=${lastRefresh}`
      }

      const response = await apiService.get(url)

      if (!isMounted.current) return

      // Si hay alertas nuevas, agregarlas
      if (response.alerts && response.alerts.length > 0) {
        dispatch(appendAlerts(response.alerts))
      }

      setError(null)
    } catch (err) {
      if (!isMounted.current) return
      console.error('[useAlertPolling] Poll error:', err)
      setError(err.message || 'Polling error')
      // No detener polling en caso de error, reintentar en próximo intervalo
    }
  }

  /**
   * Iniciar polling periodico
   */
  const startPolling = () => {
    if (pollTimer.current) return // Ya polling

    setIsPolling(true)

    // Primera lectura inmediata
    pollOnce()

    // Luego periodico
    pollTimer.current = setInterval(() => {
      pollOnce()
    }, interval)
  }

  /**
   * Detener polling
   */
  const stopPollingInternal = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
    setIsPolling(false)
  }

  /**
   * Parar polling explícitamente
   */
  const stopPolling = () => {
    stopPollingInternal()
  }

  /**
   * Marcar alerta como leída
   * Solo UI, sin backend
   */
  const markAsRead = (alertId) => {
    dispatch(
      updateAlert({
        alertId: alertId,
        updates: { isRead: true }
      })
    )
  }

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = () => {
    alerts.forEach(alert => {
      dispatch(
        updateAlert({
          alertId: alert.id,
          updates: { isRead: true }
        })
      )
    })
  }

  /**
   * Remover alerta (dismiss)
   */
  const dismissAlert = (alertId) => {
    dispatch(removeAlert(alertId))
  }

  /**
   * Limpiar todas las alertas
   */
  const clearAll = () => {
    dispatch(clearAlerts())
  }

  /**
   * Recargar alertas (fuerza refresh)
   */
  const refresh = async () => {
    try {
      const response = await apiService.get('/api/alerts/')

      if (!isMounted.current) return

      if (response.alerts) {
        dispatch(setAlerts(response.alerts))
      }

      setError(null)
      return { success: true }
    } catch (err) {
      console.error('[useAlertPolling] Refresh error:', err)
      setError(err.message || 'Refresh error')
      return { success: false, error: err.message }
    }
  }

  // ====== EFFECTS ======

  /**
   * Iniciar polling en mount
   */
  useEffect(() => {
    startPolling()

    return () => {
      stopPollingInternal()
    }
  }, [interval])

  /**
   * Cleanup en unmount
   */
  useEffect(() => {
    return () => {
      isMounted.current = false
      if (pollTimer.current) {
        clearInterval(pollTimer.current)
      }
    }
  }, [])

  // ====== RETURN ======

  return {
    // Estado
    alerts: alerts,
    isPolling: isPolling,
    error: error,
    count: alerts.length,
    unreadCount: alerts.filter(a => !a.isRead).length,

    // Métodos
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    clearAll,
    refresh
  }
}

export default useAlertFeed
