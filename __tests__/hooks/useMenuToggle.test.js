/**
 * useMenuToggle Hook Tests
 * Tests for custom hook managing sidebar state
 */

import { renderHook, act } from '@testing-library/react'
import { useMenuToggle } from '../../src/hooks/useMenuToggle'

describe('useMenuToggle Hook', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useMenuToggle())

      expect(result.current.isSidebarOpen).toBe(false)
      expect(result.current.isMobile).toBeDefined()
      expect(typeof result.current.toggleSidebar).toBe('function')
      expect(typeof result.current.openSidebar).toBe('function')
      expect(typeof result.current.closeSidebar).toBe('function')
    })
  })

  describe('Toggle Functionality', () => {
    it('should toggle sidebar state', () => {
      const { result } = renderHook(() => useMenuToggle())

      expect(result.current.isSidebarOpen).toBe(false)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.isSidebarOpen).toBe(true)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.isSidebarOpen).toBe(false)
    })

    it('should open sidebar with openSidebar()', () => {
      const { result } = renderHook(() => useMenuToggle())

      act(() => {
        result.current.openSidebar()
      })

      expect(result.current.isSidebarOpen).toBe(true)
    })

    it('should close sidebar with closeSidebar()', () => {
      const { result } = renderHook(() => useMenuToggle())

      act(() => {
        result.current.openSidebar()
      })

      expect(result.current.isSidebarOpen).toBe(true)

      act(() => {
        result.current.closeSidebar()
      })

      expect(result.current.isSidebarOpen).toBe(false)
    })
  })

  describe('Mobile Detection', () => {
    it('should detect mobile state', () => {
      const { result } = renderHook(() => useMenuToggle())

      expect(typeof result.current.isMobile).toBe('boolean')
    })

    it('should expose isMobile property', () => {
      const { result } = renderHook(() => useMenuToggle())

      expect('isMobile' in result.current).toBe(true)
    })
  })

  describe('State Management', () => {
    it('should maintain toggle/open/close functionality', () => {
      const { result } = renderHook(() => useMenuToggle())

      // Start closed
      expect(result.current.isSidebarOpen).toBe(false)

      // Open
      act(() => {
        result.current.openSidebar()
      })
      expect(result.current.isSidebarOpen).toBe(true)

      // Toggle to close
      act(() => {
        result.current.toggleSidebar()
      })
      expect(result.current.isSidebarOpen).toBe(false)

      // Close (already closed, should stay closed)
      act(() => {
        result.current.closeSidebar()
      })
      expect(result.current.isSidebarOpen).toBe(false)
    })
  })

  describe('Hook API', () => {
    it('should return all required methods and properties', () => {
      const { result } = renderHook(() => useMenuToggle())

      const requiredProperties = [
        'isSidebarOpen',
        'toggleSidebar',
        'openSidebar',
        'closeSidebar',
        'isMobile',
      ]

      requiredProperties.forEach((prop) => {
        expect(prop in result.current).toBe(true)
      })
    })
  })
})
