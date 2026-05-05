/**
 * Header Component
 * Main header/navigation container with sticky positioning
 * 
 * Features:
 * - Sticky header with z-index: 10
 * - Logo/Brand on left
 * - Menu button (mobile)
 * - Breadcrumb navigation
 * - Notification bell
 * - User menu dropdown
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './Header.module.scss'

export default function Header({
  currentPage = 'Dashboard',
  unreadCount = 0,
  userInfo = {},
  onMenuClick = () => {},
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContainer}>
        {/* Left Section: Logo + Menu Button */}
        <div className={styles.headerLeft}>
          <button
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            aria-expanded="false"
          >
            ☰
          </button>
          <div className={styles.logoBrand}>
            IACT Dashboard
          </div>
        </div>

        {/* Center Section: Breadcrumb */}
        <div className={styles.breadcrumb}>
          Dashboard / {currentPage}
        </div>

        {/* Right Section: Notifications + User Menu */}
        <div className={styles.headerRight}>
          <button
            className={styles.notificationBell}
            aria-label={`${unreadCount} notifications`}
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>

          <button
            className={styles.userMenu}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            👤 {userInfo.name || 'User'}
          </button>

          {isUserMenuOpen && (
            <div className={styles.userDropdown}>
              <div className={styles.userDropdownContent}>
                <div className={styles.userInfo}>
                  {userInfo.email && <p>{userInfo.email}</p>}
                </div>
                <button onClick={onLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  currentPage: PropTypes.string,
  unreadCount: PropTypes.number,
  userInfo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
  onMenuClick: PropTypes.func,
  onNavigate: PropTypes.func,
  onLogout: PropTypes.func,
}
