/**
 * useInterval Hook Tests
 */

import { renderHook } from '@testing-library/react'
import { useInterval } from '@hooks/useInterval'

describe('useInterval Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
  jest.useFakeTimers()

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should call callback at interval', () => {
    const _callback = jest.fn()
    renderHook(() => useInterval(_callback, 1000))

    jest.advanceTimersByTime(1000)
    expect(_callback).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    expect(_callback).toHaveBeenCalledTimes(2)

    jest.advanceTimersByTime(1000)
    expect(_callback).toHaveBeenCalledTimes(3)
  })

  it('should cleanup on unmount', () => {
    const _callback = jest.fn()
    const { unmount } = renderHook(() => useInterval(_callback, 1000))

    jest.advanceTimersByTime(1000)
    expect(_callback).toHaveBeenCalledTimes(1)

    unmount()

    jest.advanceTimersByTime(1000)
    expect(_callback).toHaveBeenCalledTimes(1)
  })
})
