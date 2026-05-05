/**
 * useDebounce Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@hooks/useDebounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    expect(result.current).toBe('test')

    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('test')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'changed' })

    act(() => {
      jest.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('changed')
  })

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    )

    rerender({ value: 'b', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('a')

    rerender({ value: 'c', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(result.current).toBe('c')
  })

  it('should handle custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    act(() => {
      jest.advanceTimersByTime(999)
    })
    expect(result.current).toBe('test')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should work with empty strings', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'text', delay: 500 } }
    )

    rerender({ value: '', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('')
  })
})
