/**
 * UserMenu Component
 * User profile dropdown with logout option
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './UserMenu.module.scss'

export default function UserMenu({
  userInfo = { name: 'User', email: '' },
  onLogout = () => {},
  onSettings = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <div className={styles.userMenu}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        👤 {userInfo.name || 'User'}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.name}>{userInfo.name}</div>
            {userInfo.email && <div className={styles.email}>{userInfo.email}</div>}
          </div>
          <div className={styles.divider} />
          <button className={styles.option} onClick={onSettings}>
            ⚙️ Settings
          </button>
          <button className={styles.option} onClick={() => setIsOpen(false)}>
            👁️ Profile
          </button>
          <div className={styles.divider} />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}

UserMenu.propTypes = {
  userInfo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onLogout: PropTypes.func,
  onSettings: PropTypes.func,
}
