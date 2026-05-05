/**
 * DashboardLayout Component
 * Main layout wrapper combining Header, Sidebar, and main content
 * 
 * Features:
 * - Sticky header at top
 * - Responsive sidebar (fixed desktop, drawer mobile)
 * - Main content area with outlet
 * - BMD (Bootstrap Material Design) layout system
 * - Full keyboard navigation
 * - Accessible structure
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'
import { Header, LogoBrand, MenuButton } from '@components/shared/Header'
import { Sidebar } from '@components/shared/Sidebar'
import { useMenuToggle } from '@hooks/useMenuToggle'
import styles from './DashboardLayout.module.scss'

export default function DashboardLayout({
  navLinks = [],
  currentPage = 'Dashboard',
  userInfo = {},
  unreadCount = 0,
}) {
  const { isSidebarOpen, toggleSidebar, closeSidebar, isMobile } = useMenuToggle()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleMenuClick = () => {
    toggleSidebar()
  }

  const handleNavigate = (link) => {
    // Update current page
    // This would typically be handled by routing
    if (isMobile) {
      closeSidebar()
    }
  }

  const handleLogout = () => {
    // Handle logout
    console.log('Logging out...')
  }

  return (
    <div className={styles.layoutCanvas}>
      {/* Header */}
      <Header
        currentPage={currentPage}
        unreadCount={unreadCount}
        userInfo={userInfo}
        onMenuClick={handleMenuClick}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className={styles.layoutContent}>
        {/* Sidebar */}
        <Sidebar
          navLinks={navLinks}
          currentPage={currentPage}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onNavigate={handleNavigate}
          isCollapsed={isCollapsed}
        />

        {/* Main Content Area */}
        <main
          className={`${styles.main} ${
            isCollapsed && !isMobile ? styles.mainCollapsed : ''
          }`}
          role="main"
        >
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Accessibility: Skip to content link */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
    </div>
  )
}

DashboardLayout.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
      icon: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  currentPage: PropTypes.string,
  userInfo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
  unreadCount: PropTypes.number,
}
