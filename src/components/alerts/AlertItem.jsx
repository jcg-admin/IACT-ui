import React from 'react'
import PropTypes from 'prop-types'
import '@styles/components/_alert-item.scss'

function AlertItem({ alert, onMarkRead, onDismiss }) {
  // Mapear severity a icono (emojis simples como fallback)
  const iconMap = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  }
  
  const icon = iconMap[alert.severity] || iconMap.info

  return (
    <div className={`alert-item alert-item--${alert.severity || 'info'} ${alert.isRead ? 'alert-item--read' : 'alert-item--unread'}`}>
      <div className={`alert-item__icon alert-item__icon--${alert.severity || 'info'}`}>
        {icon}
      </div>
      <div className="alert-content">
        <h4>{alert.title}</h4>
        <p>{alert.message}</p>
        <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="alert-actions">
        {!alert.isRead && (
          <button onClick={() => onMarkRead?.(alert.id)} className="alert-btn--read">Mark Read</button>
        )}
        <button onClick={() => onDismiss?.(alert.id)} className="alert-btn--dismiss">Dismiss</button>
      </div>
    </div>
  )
}

AlertItem.propTypes = {
  alert: PropTypes.object.isRequired,
  onMarkRead: PropTypes.func,
  onDismiss: PropTypes.func
}

export default AlertItem
