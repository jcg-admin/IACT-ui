/**
 * MenuButton Component
 * Toggle button for sidebar menu (mobile)
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './MenuButton.module.scss'

export default function MenuButton({
  isOpen = false,
  onClick = () => {},
}) {
  return (
    <button
      className={`${styles.menuButton} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
      aria-label="Toggle sidebar menu"
      aria-expanded={isOpen}
    >
      <span className={styles.line} />
      <span className={styles.line} />
      <span className={styles.line} />
    </button>
  )
}

MenuButton.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
}
