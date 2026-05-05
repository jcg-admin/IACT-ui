/**
 * Sidebar Component
 * Main sidebar/navigation container with collapsible/drawer features
 * 
 * Features:
 * - Fixed sidebar on desktop (250px width, can collapse to 60px)
 * - Mobile drawer (full screen, translateX)
 * - Smooth animations (0.3s ease-out)
 * - Z-index: 1000
 * - Keyboard navigation support
 */

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './Sidebar.module.scss'

export default function Sidebar({
  navLinks = [],
  currentPage = '',
  isOpen = false,
  onClose = () => {},
  onNavigate = () => {},
  isCollapsed = false,
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sidebarClasses = [
    styles.sidebar,
    isOpen && styles.open,
    isCollapsed && !isMobile && styles.collapsed,
  ]
    .filter(Boolean)
    .join(' ')

  const handleNavClick = (link) => {
    onNavigate(link)
    if (isMobile) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isMobile && isOpen) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay (mobile only) */}
      {isMobile && isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
      >
        {/* Header/Close Button */}
        {isMobile && (
          <div className={styles.header}>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.id} className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${
                    currentPage === link.label ? styles.active : ''
                  }`}
                  onClick={() => handleNavClick(link)}
                  aria-current={currentPage === link.label ? 'page' : undefined}
                  title={isCollapsed && !isMobile ? link.label : undefined}
                >
                  <span className={styles.icon}>{link.icon}</span>
                  {(!isCollapsed || isMobile) && (
                    <span className={styles.label}>{link.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.footerButton}
            aria-label="More options"
            title={isCollapsed && !isMobile ? 'More' : undefined}
          >
            ⋯
          </button>
        </div>
      </aside>
    </>
  )
}

Sidebar.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  currentPage: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}
