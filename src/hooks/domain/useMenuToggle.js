/**
 * useMenuToggle Hook
 * Manages sidebar menu state with keyboard shortcuts and responsive behavior
 * 
 * Features:
 * - Toggle sidebar open/closed
 * - Auto-close on mobile when route changes
 * - Keyboard shortcuts: Alt+N to toggle
 * - Detects mobile/desktop via window resize
 * - Cleanup on unmount
 */

import { useState, useEffect, useCallback } from 'react'

export function useMenuToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-close sidebar on desktop
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  // Open sidebar
  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt+N: Toggle sidebar
      if (event.altKey && event.key === 'n') {
        event.preventDefault()
        toggleSidebar()
      }

      // Escape: Close sidebar (mobile only)
      if (event.key === 'Escape' && isSidebarOpen && isMobile) {
        event.preventDefault()
        closeSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSidebarOpen, isMobile, toggleSidebar, closeSidebar])

  return {
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    isMobile,
  }
}

export default useMenuToggle
