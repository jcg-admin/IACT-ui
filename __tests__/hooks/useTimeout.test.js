/**
 * useTimeout Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useTimeout } from '@hooks/useTimeout'

describe('useTimeout Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should call callback after delay', () => {
    const _callback = jest.fn()
    renderHook(() => useTimeout(_callback, 1000))

    expect(_callback).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(_callback).toHaveBeenCalledTimes(1)
  })

  it('should cleanup on unmount', () => {
    const _callback = jest.fn()
    const { unmount } = renderHook(() => useTimeout(_callback, 1000))

    unmount()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(_callback).not.toHaveBeenCalled()
  })

  it('should handle different delays', () => {
    const _callback = jest.fn()
    renderHook(() => useTimeout(_callback, 500))

    act(() => {
      jest.advanceTimersByTime(499)
    })
    expect(_callback).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(_callback).toHaveBeenCalledTimes(1)
  })
})
