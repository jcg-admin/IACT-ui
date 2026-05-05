/**
 * LogoBrand Component
 * Displays the application logo and brand name
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './LogoBrand.module.scss'

export default function LogoBrand({ 
  appName = 'IACT Dashboard',
  onClick = () => {} 
}) {
  return (
    <div 
      className={styles.logoBrand}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <span className={styles.logo}>📊</span>
      <span className={styles.text}>{appName}</span>
    </div>
  )
}

LogoBrand.propTypes = {
  appName: PropTypes.string,
  onClick: PropTypes.func,
}
