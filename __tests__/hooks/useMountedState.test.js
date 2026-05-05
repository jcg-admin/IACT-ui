/**
 * useMountedState Hook Tests
 */

import { renderHook } from '@testing-library/react'
import { useMountedState } from '@hooks/useMountedState'

describe('useMountedState Hook', () => {
  it('should return true when mounted', () => {
    const { result } = renderHook(() => useMountedState())
    expect(result.current()).toBe(true)
  })

  it('should return false after unmount', () => {
    const { result, unmount } = renderHook(() => useMountedState())

    expect(result.current()).toBe(true)

    unmount()

    expect(result.current()).toBe(false)
  })

  it('should prevent state update after unmount', () => {
    const { result, unmount } = renderHook(() => useMountedState())

    expect(result.current()).toBe(true)

    unmount()

    // Should not crash or error after unmount
    expect(result.current()).toBe(false)
  })
})
