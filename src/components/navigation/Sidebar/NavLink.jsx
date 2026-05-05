/**
 * NavLink Component
 * Individual navigation link for sidebar
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './NavLink.module.scss'

export default function NavLink({
  label = 'Link',
  icon = '',
  isActive = false,
  onClick = () => {},
  title = '',
}) {
  return (
    <button
      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={title}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  )
}

NavLink.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string,
}
