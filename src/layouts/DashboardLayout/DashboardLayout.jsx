/**
 * DashboardLayout Component
 * Main layout wrapper combining Header, Sidebar, and main content
 *
 * Features:
 * - Sticky header at top
 * - Responsive sidebar (fixed desktop, drawer mobile)
 * - Main content area with outlet
 * - Full keyboard navigation
 * - Accessible structure
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Header } from '@ui/shared/Header'
import { Sidebar } from '@ui/shared/Sidebar'
import { useMenuToggle } from '@hooks/useMenuToggle'
import { logoutUser } from '@store/slices/auth'
import ContextErrorBanner from '../../components/feedback/ContextErrorBanner'
import './DashboardLayout.scss'

const SEGMENT_CONTEXT_MAP = {
  admin:       'admin',
  reports:     'reports',
  access:      'access',
  permissions: 'access',
  alerts:      'alerts',
  audit:       'audit',
  logs:        'logs',
  users:       'user',
}

function ModuleContextBanner() {
  const { pathname } = useLocation()
  const segment = pathname.split('/')[1]
  const context = SEGMENT_CONTEXT_MAP[segment]
  if (!context) return null
  return <ContextErrorBanner context={context} />
}

export default function DashboardLayout({
  navLinks = [],
  currentPage = 'Dashboard',
  userInfo = {},
  unreadCount = 0,
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isSidebarOpen, toggleSidebar, closeSidebar, isMobile } = useMenuToggle()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleMenuClick = () => {
    toggleSidebar()
  }

  const handleNavigate = (link) => {
    if (isMobile) {
      closeSidebar()
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser()).finally(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="layoutCanvas">
      {/* Header */}
      <Header
        currentPage={currentPage}
        unreadCount={unreadCount}
        userInfo={userInfo}
        onMenuClick={handleMenuClick}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="layoutContent">
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
          className={`main${isCollapsed && !isMobile ? ' mainCollapsed' : ''}`}
          role="main"
        >
          <div className="container">
            <ModuleContextBanner />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Accessibility: Skip to content link */}
      <a href="#main-content" className="skipLink">
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
