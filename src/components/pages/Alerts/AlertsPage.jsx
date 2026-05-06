/**
 * AlertsPage — Alertas y Notificaciones (ITER5)
 *
 * Gestión de alertas del sistema y suscripciones del usuario.
 * Requiere permiso VIEW_ALERTS.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAlerts,
  updateAlert,
  selectAlerts,
  selectSubscriptions,
} from '@redux/slices/alertsSlice'
import ConfirmModal from '@components/shared/ConfirmModal'
import './AlertsPage.scss'

const selectAlertsLoading = (state) => state.alerts.loading
const selectAlertsError = (state) => state.alerts.error

const SEVERITY_LABEL = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

export default function AlertsPage() {
  const dispatch = useDispatch()
  const alerts = useSelector(selectAlerts)
  const subscriptions = useSelector(selectSubscriptions)
  const loading = useSelector(selectAlertsLoading)
  const error = useSelector(selectAlertsError)
  const [ackModal, setAckModal] = useState({ show: false, alertId: null, alertTitle: '' })

  useEffect(() => {
    dispatch(fetchAlerts())
  }, [dispatch])

  const handleAcknowledgeClick = (alertId, alertTitle) => {
    setAckModal({ show: true, alertId, alertTitle })
  }

  const handleConfirmAcknowledge = () => {
    dispatch(updateAlert({ id: ackModal.alertId, status: 'acknowledged' }))
    setAckModal({ show: false, alertId: null, alertTitle: '' })
  }

  const handleCancelAcknowledge = () => {
    setAckModal({ show: false, alertId: null, alertTitle: '' })
  }

  const unreadCount = alerts?.filter((a) => a.status === 'active')?.length ?? 0

  return (
    <div className="alerts-page page-container">
      <header className="page-header">
        <h1>
          Alertas
          {unreadCount > 0 && (
            <span className="count-badge" aria-label={`${unreadCount} alertas activas`}>
              {unreadCount}
            </span>
          )}
        </h1>
        <p className="page-subtitle">Notificaciones y eventos del sistema</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          Error cargando alertas: {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state" aria-busy="true">Cargando alertas…</div>
      ) : (
        <div className="alerts-list" role="list">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <article key={alert.id} className={`alert-card alert-${alert.severity}`} role="listitem">
                <div className="alert-card__header">
                  <span className={`badge badge-${alert.severity === 'critical' || alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'success'}`}>
                    {SEVERITY_LABEL[alert.severity] ?? alert.severity}
                  </span>
                  <span className="alert-card__time">
                    {new Date(alert.created_at).toLocaleString('es')}
                  </span>
                </div>
                <h3 className="alert-card__title">{alert.title}</h3>
                <p className="alert-card__message">{alert.message}</p>
                {alert.status === 'active' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleAcknowledgeClick(alert.id, alert.title)}
                    aria-label={`Confirmar alerta: ${alert.title}`}
                  >
                    Confirmar
                  </button>
                )}
              </article>
            ))
          ) : (
            <p className="empty-state">No hay alertas activas</p>
          )}
        </div>
      )}

      {subscriptions && subscriptions.length > 0 && (
        <section className="subscriptions-section">
          <h2>Mis Suscripciones ({subscriptions.length})</h2>
        </section>
      )}

      <ConfirmModal
        isOpen={ackModal.show}
        onClose={handleCancelAcknowledge}
        onConfirm={handleConfirmAcknowledge}
        title="Reconocer alerta"
        message={`¿Confirmar reconocimiento de la alerta "${ackModal.alertTitle}"?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="warning"
      />
    </div>
  )
}
