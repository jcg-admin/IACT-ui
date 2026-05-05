/**
 * useMediaQuery Hook Tests
 */

import { renderHook } from '@testing-library/react'
import { useMediaQuery } from '@hooks/useMediaQuery'

describe('useMediaQuery Hook', () => {
  beforeEach(() => {
    // Limpiar el mock antes de cada test
    if (window.matchMedia) {
      delete window.matchMedia
    }
  })

  afterEach(() => {
    // Limpiar después de cada test también
    if (window.matchMedia) {
      delete window.matchMedia
    }
  })
  it('should return match status', () => {
    window.matchMedia = jest.fn().mockImplementation(_query => ({
      matches: true,
      media: _query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => useMediaQuery('(max-width: 480px)'))
    expect(result.current).toBe(true)
  })

  it('should detect mobile viewport', () => {
    window.matchMedia = jest.fn().mockImplementation(_query => ({
      matches: _query === '(max-width: 480px)',
      media: _query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))

    const { result } = renderHook(() => useMediaQuery('(max-width: 480px)'))
    expect(result.current).toBe(true)
  })

  it('should detect desktop viewport', () => {
    window.matchMedia = jest.fn().mockImplementation(_query => ({
      matches: _query === '(min-width: 768px)',
      media: _query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('should cleanup listeners on unmount', () => {
    const _removeListener = jest.fn()
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: _removeListener,
    }))

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 480px)'))

    unmount()

    expect(_removeListener).toHaveBeenCalled()
  })
})
