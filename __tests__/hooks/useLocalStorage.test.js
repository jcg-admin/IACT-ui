/**
 * useLocalStorage Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@hooks/useLocalStorage'

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'value'))

    act(() => {
      result.current[1]('updated')
    })

    expect(localStorage.getItem('key')).toBe(JSON.stringify('updated'))
  })

  it('should retrieve persisted value', () => {
    localStorage.setItem('key', JSON.stringify('persisted'))

    const { result } = renderHook(() => useLocalStorage('key', 'default'))

    expect(result.current[0]).toBe('persisted')
  })

  it('should handle complex objects', () => {
    const _object = { name: 'John', age: 30 }
    const { result } = renderHook(() => useLocalStorage('user', _object))

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 })
    })

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 })
  })

  it('should handle arrays', () => {
    const _array = [1, 2, 3]
    const { result } = renderHook(() => useLocalStorage('items', _array))

    act(() => {
      result.current[1]([4, 5, 6])
    })

    expect(result.current[0]).toEqual([4, 5, 6])
  })

  it('should support function updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))

    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('should handle errors gracefully', () => {
    localStorage.setItem('key', 'invalid json')

    const { result } = renderHook(() => useLocalStorage('key', 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('should sync across tabs', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'value'))

    const _storageEvent = new StorageEvent('storage', {
      key: 'key',
      newValue: JSON.stringify('synced'),
    })

    act(() => {
      window.dispatchEvent(_storageEvent)
    })

    expect(result.current[0]).toBe('synced')
  })
})
