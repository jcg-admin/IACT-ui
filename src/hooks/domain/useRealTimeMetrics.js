import { useState, useEffect, useCallback } from 'react'
import reportsService from '@services/reportsService'

const POLL_INTERVAL_MS = 30_000

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const data = await reportsService.getRealTimeMetrics()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err.message ?? 'Error al cargar métricas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetch])

  return { metrics, loading, error }
}
