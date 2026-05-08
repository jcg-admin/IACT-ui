/**
 * UserMenu Component
 * User profile dropdown with logout option
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ConfirmModal from '@ui/shared/ConfirmModal'
import './UserMenu.scss'

export default function UserMenu({
  userInfo = { name: 'User', email: '' },
  onLogout = () => {},
  onSettings = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setIsOpen(false)
    setShowLogoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    onLogout()
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      <div className="userMenu">
        <button
          className="trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="User menu"
        >
          👤 {userInfo.name || 'User'}
        </button>

        {isOpen && (
          <div className="dropdown">
            <div className="userInfo">
              <div className="name">{userInfo.name}</div>
              {userInfo.email && <div className="email">{userInfo.email}</div>}
            </div>
            <div className="divider" />
            <button className="option" onClick={onSettings}>
              ⚙️ Settings
            </button>
            <button className="option" onClick={() => setIsOpen(false)}>
              👁️ Profile
            </button>
            <div className="divider" />
            <button className="logoutBtn" onClick={handleLogoutClick}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="default"
      />
    </>
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
