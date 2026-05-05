/**
 * SidebarNav Component
 * Navigation container for sidebar links
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './SidebarNav.module.scss'

export default function SidebarNav({
  navLinks = [],
  currentPage = '',
  onNavigate = () => {},
  isCollapsed = false,
}) {
  return (
    <nav className={styles.sidebarNav}>
      <ul className={styles.navList}>
        {navLinks.map((link) => (
          <li key={link.id} className={styles.navItem}>
            <button
              className={`${styles.navLink} ${
                currentPage === link.label ? styles.active : ''
              }`}
              onClick={() => onNavigate(link)}
              aria-current={currentPage === link.label ? 'page' : undefined}
              title={isCollapsed ? link.label : undefined}
            >
              {link.icon && <span className={styles.icon}>{link.icon}</span>}
              {!isCollapsed && <span className={styles.label}>{link.label}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

SidebarNav.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
      icon: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  currentPage: PropTypes.string,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}
