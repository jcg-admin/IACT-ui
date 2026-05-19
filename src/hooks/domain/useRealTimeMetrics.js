import { useState, useEffect, useRef } from 'react'

const SSE_URL = '/api/realtime/metrics/'

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const lastEventIdRef = useRef(null)

  useEffect(() => {
    const url = lastEventIdRef.current
      ? `${SSE_URL}?lastEventId=${encodeURIComponent(lastEventIdRef.current)}`
      : SSE_URL

    const es = new EventSource(url)

    es.addEventListener('metrics', (e) => {
      try {
        const data = JSON.parse(e.data)
        setMetrics(data)
        setError(null)
        setLoading(false)
        if (e.lastEventId) lastEventIdRef.current = e.lastEventId
      } catch {
        setError('Error al parsear métricas')
        setLoading(false)
      }
    })

    es.addEventListener('heartbeat', () => {
      // keep-alive ping — no state update needed
    })

    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse(e.data)
        setError(data.message ?? 'Error en conexión SSE')
      } catch {
        setError('Error en conexión SSE')
      }
      setLoading(false)
    })

    es.addEventListener('close', () => {
      es.close()
    })

    es.onerror = () => {
      setError('Conexión SSE perdida')
      setLoading(false)
    }

    return () => {
      es.close()
    }
  }, [])

  return { metrics, loading, error }
}
