import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { selectAlerts } from '@redux/slices/sessionSlice'
import AlertItem from './AlertItem'
import '@styles/components/_alert-list.scss'

function AlertList({ onMarkRead, onDismiss }) {
  const _alerts = useSelector(selectAlerts)

  if (!_alerts || _alerts.length === 0) {
    return <div className="alert-list"><p>No alerts</p></div>
  }

  return (
    <div className="alert-list">
      <h3>Alerts ({_alerts.length})</h3>
      <div className="alerts-container">
        {_alerts.map(_alert => (
          <AlertItem
            key={_alert.id}
            alert={_alert}
            onMarkRead={onMarkRead}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  )
}

AlertList.propTypes = {
  onMarkRead: PropTypes.func,
  onDismiss: PropTypes.func
}

export default AlertList
