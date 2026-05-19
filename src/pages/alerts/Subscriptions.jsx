/**
 * Subscriptions.jsx
 * IACT v4.0 — Alerts Module
 * UC_ALR_05: Gestionar suscripciones a alertas
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchMySubscriptions,
  subscribeToAlert,
  unsubscribeFromAlert,
  selectSubscriptions,
  selectLoading,
} from '../../redux/slices/alerts'

const SUB_TYPES = [
  { value: 'rule_id', label: 'Regla específica' },
  { value: 'severity_filter', label: 'Por severidad' },
  { value: 'scope_filter', label: 'Por scope' },
]

const SEVERITY_OPTIONS = ['info', 'warning', 'critical']
const SCOPE_OPTIONS = ['segment', 'queue', 'campaign']

const SEVERITY_LABEL = { info: 'Info', warning: 'Warning', critical: 'Critical' }
const SCOPE_LABEL = { segment: 'Segmento', queue: 'Cola', campaign: 'Campaña' }

function subDescription(sub) {
  if (sub.subscription_type === 'rule_id') return `Regla: ${sub.rule_id}`
  if (sub.subscription_type === 'severity_filter') return `Severidad ≥ ${SEVERITY_LABEL[sub.severity_filter] ?? sub.severity_filter}`
  if (sub.subscription_type === 'scope_filter') return `Scope: ${SCOPE_LABEL[sub.scope_filter] ?? sub.scope_filter}`
  return '—'
}

export default function Subscriptions() {
  const dispatch = useDispatch()
  const reduxSubs = useSelector(selectSubscriptions)
  const loading = useSelector(selectLoading)

  const [subType, setSubType] = useState('severity_filter')
  const [ruleId, setRuleId] = useState('')
  const [severityFilter, setSeverityFilter] = useState('critical')
  const [scopeFilter, setScopeFilter] = useState('queue')
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    dispatch(fetchMySubscriptions())
  }, [dispatch])

  async function handleSubscribe() {
    setAddError(null)
    const payload = { subscription_type: subType }
    if (subType === 'rule_id') {
      if (!ruleId.trim()) { setAddError('Ingresa el ID de regla'); return }
      payload.rule_id = ruleId.trim()
    } else if (subType === 'severity_filter') {
      payload.severity_filter = severityFilter
    } else {
      payload.scope_filter = scopeFilter
    }
    try {
      await dispatch(subscribeToAlert(payload)).unwrap()
      dispatch(fetchMySubscriptions())
      setRuleId('')
    } catch (e) {
      setAddError(e?.message ?? 'Error al suscribirse')
    }
  }

  async function handleUnsubscribe(subId) {
    await dispatch(unsubscribeFromAlert(subId))
    dispatch(fetchMySubscriptions())
  }

  const subs = reduxSubs?.length > 0 ? reduxSubs : []

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mis suscripciones</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          UC_ALR_05 — Gestiona tus suscripciones a alertas
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Panel izquierdo — suscripciones activas */}
        <div>
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>
            Suscripciones activas ({subs.length})
          </h2>

          {subs.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No tienes suscripciones activas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subs.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    padding: '14px',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
                    {SUB_TYPES.find(t => t.value === sub.subscription_type)?.label ?? sub.subscription_type}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>
                    {subDescription(sub)}
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ width: '100%' }}
                    onClick={() => handleUnsubscribe(sub.id)}
                    disabled={loading}
                  >
                    Desuscribirse
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho — nueva suscripción */}
        <div>
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>Nueva suscripción</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label>Tipo de suscripción</label>
              <select value={subType} onChange={e => setSubType(e.target.value)}>
                {SUB_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {subType === 'rule_id' && (
              <div>
                <label>ID de regla</label>
                <input
                  type="text"
                  value={ruleId}
                  onChange={e => setRuleId(e.target.value)}
                  placeholder="Ej: rule-sl-queues"
                />
              </div>
            )}

            {subType === 'severity_filter' && (
              <div>
                <label>Severidad mínima</label>
                <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
                  {SEVERITY_OPTIONS.map(s => (
                    <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            )}

            {subType === 'scope_filter' && (
              <div>
                <label>Scope</label>
                <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
                  {SCOPE_OPTIONS.map(s => (
                    <option key={s} value={s}>{SCOPE_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            )}

            {addError && (
              <div role="alert" style={{ color: '#fca5a5', fontSize: '13px' }}>{addError}</div>
            )}

            <button className="btn btn-primary" onClick={handleSubscribe} disabled={loading}>
              Suscribirse
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
