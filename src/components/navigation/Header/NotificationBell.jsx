/**
 * NotificationBell Component
 * Shows notification icon with unread count badge
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './NotificationBell.scss'

export default function NotificationBell({
  unreadCount = 0,
  onClick = () => {},
  onViewAll = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    onClick()
  }

  return (
    <div className="notificationBell">
      <button
        className="bellButton"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={isOpen}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="content">
            {unreadCount === 0 ? (
              <p className="empty">No new notifications</p>
            ) : (
              <p className="count">{unreadCount} new notifications</p>
            )}
          </div>
          <button className="footer" onClick={onViewAll}>
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}

NotificationBell.propTypes = {
  unreadCount: PropTypes.number,
  onClick: PropTypes.func,
  onViewAll: PropTypes.func,
}
