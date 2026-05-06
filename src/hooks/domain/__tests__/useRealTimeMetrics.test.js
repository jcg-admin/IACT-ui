import { renderHook, act } from '@testing-library/react'
import { useRealTimeMetrics } from '../useRealTimeMetrics'
import reportsService from '@services/reportsService'

jest.mock('@services/reportsService')
jest.useFakeTimers()

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
  reportsService.getRealTimeMetrics.mockResolvedValue(MOCK_METRICS)
})

afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

describe('useRealTimeMetrics', () => {
  it('llama a getRealTimeMetrics al montar', async () => {
    const { result } = renderHook(() => useRealTimeMetrics())
    await act(async () => {})
    expect(reportsService.getRealTimeMetrics).toHaveBeenCalledTimes(1)
    expect(result.current.metrics).toEqual(MOCK_METRICS)
  })

  it('refresca métricas después de 30s', async () => {
    renderHook(() => useRealTimeMetrics())
    await act(async () => {})
    expect(reportsService.getRealTimeMetrics).toHaveBeenCalledTimes(1)

    await act(async () => {
      jest.advanceTimersByTime(30000)
    })
    expect(reportsService.getRealTimeMetrics).toHaveBeenCalledTimes(2)
  })

  it('pone loading en true mientras carga', () => {
    reportsService.getRealTimeMetrics.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useRealTimeMetrics())
    expect(result.current.loading).toBe(true)
  })

  it('captura error en el campo error', async () => {
    reportsService.getRealTimeMetrics.mockRejectedValue(new Error('timeout'))
    const { result } = renderHook(() => useRealTimeMetrics())
    await act(async () => {})
    expect(result.current.error).toBe('timeout')
    expect(result.current.metrics).toBeNull()
  })

  it('limpia el intervalo al desmontar', async () => {
    const clearSpy = jest.spyOn(global, 'clearInterval')
    const { unmount } = renderHook(() => useRealTimeMetrics())
    await act(async () => {})
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
