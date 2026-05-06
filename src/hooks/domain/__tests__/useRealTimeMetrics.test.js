import { renderHook, act } from '@testing-library/react'
import { useRealTimeMetrics } from '../useRealTimeMetrics'

class MockEventSource {
  constructor(url) {
    this.url = url
    this.closed = false
    this._listeners = {}
    MockEventSource.instances.push(this)
  }

  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = []
    this._listeners[event].push(handler)
  }

  removeEventListener(event, handler) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter((h) => h !== handler)
    }
  }

  emit(event, data, lastEventId = 'evt-1') {
    const handlers = this._listeners[event] ?? []
    handlers.forEach((h) => h({ data: JSON.stringify(data), lastEventId }))
  }

  emitRaw(event, rawData) {
    const handlers = this._listeners[event] ?? []
    handlers.forEach((h) => h({ data: rawData, lastEventId: '' }))
  }

  triggerOnerror() {
    if (this.onerror) this.onerror(new Event('error'))
  }

  close() {
    this.closed = true
  }
}
MockEventSource.instances = []

const MOCK_METRICS = {
  timestamp: '2026-05-06T06:00:00Z',
  queue_count: 12,
  agents_busy: 8,
  agents_idle: 4,
  answered_per_hour: 143,
  abandon_rate_5min: 3.2,
  service_level_15min: 87.5,
  lag_seconds: 5,
  segments_applied: [],
}

beforeEach(() => {
  MockEventSource.instances = []
  global.EventSource = MockEventSource
})

afterEach(() => {
  delete global.EventSource
  jest.clearAllMocks()
})

function getEs() {
  return MockEventSource.instances[MockEventSource.instances.length - 1]
}

describe('useRealTimeMetrics — SSE', () => {
  it('abre una conexión EventSource al montar', () => {
    renderHook(() => useRealTimeMetrics())
    expect(MockEventSource.instances).toHaveLength(1)
    expect(getEs().url).toContain('/api/realtime/metrics/')
  })

  it('empieza en loading=true, metrics=null', () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    expect(result.current.loading).toBe(true)
    expect(result.current.metrics).toBeNull()
  })

  it('actualiza metrics al recibir evento "metrics"', async () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    act(() => { getEs().emit('metrics', MOCK_METRICS) })
    expect(result.current.metrics).toEqual(MOCK_METRICS)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('no cambia metrics al recibir heartbeat', async () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    act(() => { getEs().emit('metrics', MOCK_METRICS) })
    act(() => { getEs().emit('heartbeat', {}) })
    expect(result.current.metrics).toEqual(MOCK_METRICS)
  })

  it('pone error al recibir evento "error" del servidor', async () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    act(() => { getEs().emit('error', { message: 'upstream down' }) })
    expect(result.current.error).toBe('upstream down')
    expect(result.current.loading).toBe(false)
  })

  it('pone error genérico cuando onerror se dispara', async () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    act(() => { getEs().triggerOnerror() })
    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  it('cierra el EventSource al desmontar', () => {
    const { unmount } = renderHook(() => useRealTimeMetrics())
    const es = getEs()
    unmount()
    expect(es.closed).toBe(true)
  })
})
