/**
 * useThrottle Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useThrottle } from '@hooks/useThrottle'

describe('useThrottle Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should throttle function calls', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useThrottle(_callback, 500))

    act(() => {
      result.current()
      result.current()
      result.current()
    })

    expect(_callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(500)
    })

    act(() => {
      result.current()
    })

    expect(_callback).toHaveBeenCalledTimes(2)
  })

  it('should respect delay between calls', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useThrottle(_callback, 300))

    act(() => {
      result.current()
    })

    expect(_callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(299)
      result.current()
    })

    expect(_callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(_callback).toHaveBeenCalledTimes(2)
  })

  it('should pass arguments to callback', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useThrottle(_callback, 500))

    act(() => {
      result.current('arg1', 'arg2')
    })

    expect(_callback).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should handle rapid calls', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useThrottle(_callback, 500))

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current(i)
      }
    })

    expect(_callback).toHaveBeenCalledTimes(1)
    expect(_callback).toHaveBeenCalledWith(0)
  })
})
