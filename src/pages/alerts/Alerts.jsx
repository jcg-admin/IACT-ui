/**
 * Alerts.jsx
 * IACT v4.0 — Alerts Module
 * UC_ALR_02: Ver alertas activas y filtrar por severidad
 * UC_ALR_03: Reconocer alerta
 */

import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAlerts, acknowledgeAlert, selectAlerts, selectLoading, selectError } from '../../redux/slices/alerts'
import Modal from '../../components/shared/Modal'

const NOTE_MAX = 500

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 }
const SEVERITY_COLOR = { critical: '#dc2626', warning: '#f59e0b', info: '#0ea5e9' }

const STATE_BADGE = {
  firing: { color: '#dc2626', label: 'Disparada' },
  acknowledged: { color: '#6b7280', label: 'Reconocida' },
  resolved: { color: '#10b981', label: 'Resuelta' },
  closed: { color: '#374151', label: 'Cerrada' },
}

function sortAlerts(alerts) {
  return [...alerts].sort((a, b) => {
    const sev = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    if (sev !== 0) return sev
    return new Date(b.fired_at ?? 0) - new Date(a.fired_at ?? 0)
  })
}

export default function Alerts() {
  const dispatch = useDispatch()
  const alerts = useSelector(selectAlerts)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  const [severityFilter, setSeverityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ackModal, setAckModal] = useState({ isOpen: false, alertId: null, note: '', error: null })
  const modalOpenRef = useRef(false)

  useEffect(() => {
    dispatch(fetchAlerts())
  }, [dispatch])

  // FA-03: auto-refresh each 10s, paused when modal is open
  useEffect(() => {
    const id = setInterval(() => {
      if (!modalOpenRef.current) dispatch(fetchAlerts())
    }, 10000)
    return () => clearInterval(id)
  }, [dispatch])

  useEffect(() => {
    modalOpenRef.current = ackModal.isOpen
  }, [ackModal.isOpen])

  function openAckModal(alertId) {
    setAckModal({ isOpen: true, alertId, note: '', error: null })
  }
  function closeAckModal() {
    setAckModal({ isOpen: false, alertId: null, note: '', error: null })
  }

  async function handleConfirmAck() {
    const { alertId, note } = ackModal
    try {
      await dispatch(acknowledgeAlert({ alertId, note })).unwrap()
      closeAckModal()
    } catch (err) {
      const msg = err?.statusCode === 409
        ? 'Esta alerta ya fue reconocida.'
        : err?.message ?? 'Error al reconocer la alerta.'
      setAckModal(m => ({ ...m, error: msg }))
    }
  }

  const filtered = sortAlerts(
    (alerts ?? []).filter(a => {
      if (severityFilter && a.severity !== severityFilter) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (a.name ?? '').toLowerCase().includes(term) || (a.rule_id ?? '').toLowerCase().includes(term)
      }
      return true
    })
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Centro de alertas</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          UC_ALR_02 — Alertas activas del sistema
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Buscar por nombre o regla…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label>Severidad</label>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">Todas</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#7f1d1d', borderRadius: '4px', color: '#fca5a5', fontSize: '13px' }}>
          {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
        </div>
      )}

      <div style={{ backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 130px 120px', gap: '12px', padding: '14px', backgroundColor: '#0f172a', fontWeight: 600, color: '#fff', fontSize: '12px' }}>
          <div>Regla</div>
          <div>Nombre</div>
          <div>Severidad</div>
          <div>Estado</div>
          <div>Acción</div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Cargando…</div>
        ) : filtered.length > 0 ? (
          filtered.map((alert, idx) => {
            const stateBadge = STATE_BADGE[alert.state] ?? { color: '#6b7280', label: alert.state }
            const isFiring = alert.state === 'firing'
            return (
              <div
                key={alert.id ?? idx}
                style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 130px 120px', gap: '12px', padding: '12px 14px', borderBottom: '1px solid #374151', alignItems: 'center', backgroundColor: '#1f2937' }}
              >
                <span style={{ color: '#9ca3af', fontSize: '11px' }}>{alert.rule_id ?? alert.id}</span>
                <div style={{ color: '#fff', fontSize: '12px' }}>{alert.name ?? alert.title}</div>
                <span style={{ backgroundColor: SEVERITY_COLOR[alert.severity] ?? '#6b7280', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  {alert.severity}
                </span>
                <span style={{ backgroundColor: stateBadge.color, color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  {stateBadge.label}
                </span>
                {isFiring ? (
                  <button
                    className="btn btn-warning"
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                    onClick={() => openAckModal(alert.id)}
                  >
                    Reconocer
                  </button>
                ) : <span />}
              </div>
            )
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No hay alertas para los filtros seleccionados.</div>
        )}
      </div>

      {/* Modal reconocer alerta (UC_ALR_03) */}
      <Modal
        isOpen={ackModal.isOpen}
        onClose={closeAckModal}
        title="Reconocer alerta"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeAckModal}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleConfirmAck}>Confirmar</button>
          </>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="ack-note" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>
            Nota de reconocimiento (opcional)
          </label>
          <textarea
            id="ack-note"
            aria-label="Nota de reconocimiento"
            value={ackModal.note}
            onChange={e => setAckModal(m => ({ ...m, note: e.target.value, error: null }))}
            maxLength={NOTE_MAX}
            rows={3}
            placeholder="Añade una nota opcional…"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '4px', backgroundColor: '#111827', color: '#fff', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            {ackModal.note.length}/{NOTE_MAX}
          </div>
        </div>
        {ackModal.error && (
          <div role="alert" style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', fontSize: '13px' }}>
            {ackModal.error}
          </div>
        )}
      </Modal>
    </div>
  )
}
