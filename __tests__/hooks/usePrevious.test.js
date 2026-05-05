/**
 * usePrevious Hook Tests
 */

import { renderHook } from '@testing-library/react'
import { usePrevious } from '@hooks/usePrevious'

describe('usePrevious Hook', () => {
  it('should return previous value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    rerender({ value: 'changed' })
    expect(result.current).toBe('updated')
  })

  it('should work with different types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    )

    rerender({ value: 2 })
    expect(result.current).toBe(1)

    rerender({ value: { a: 1 } })
    expect(result.current).toBe(2)
  })

  it('should handle null and undefined', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null } }
    )

    rerender({ value: undefined })
    expect(result.current).toBe(null)

    rerender({ value: 'value' })
    expect(result.current).toBeUndefined()
  })
})
