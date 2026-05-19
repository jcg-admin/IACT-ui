/**
 * AlertConfig.jsx
 * IACT v4.0 — Alerts Module
 * UC_ALR_01: Gestionar reglas de alerta (crear, editar, pausar)
 */

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createAlert, dryRunAlertRule, clearDryRunResult,
  selectLoading, selectError, selectDryRunResult,
} from '../../redux/slices/alerts'

const METRICS = [
  { value: 'SL', label: 'Nivel de servicio (SL)' },
  { value: 'abandon_rate', label: 'Tasa de abandono' },
  { value: 'queue_depth', label: 'Profundidad de cola' },
  { value: 'TMO', label: 'Tiempo medio de operación (TMO)' },
  { value: 'login_failures', label: 'Fallos de login' },
]

const SCOPES = [
  { value: 'segment', label: 'Segmento' },
  { value: 'queue', label: 'Cola' },
  { value: 'campaign', label: 'Campaña' },
]

const SEVERITIES = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
]

const ACTIONS = [
  { value: 'mailbox_notify_user', label: 'Notificar usuario (buzón)' },
  { value: 'mailbox_notify_agr', label: 'Notificar agrupador (buzón)' },
  { value: 'create_incident_ticket', label: 'Crear ticket de incidente' },
]

const EMPTY_FORM = {
  name: '',
  description: '',
  metric: 'SL',
  scope: 'segment',
  severity: 'warning',
  threshold: '',
  actions: [],
  cooldown_minutes: 15,
  window: 5,
  status: 'active',
}

export default function AlertConfig() {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const dryRunResultStore = useSelector(selectDryRunResult)

  const [config, setConfig] = useState({ ...EMPTY_FORM })
  const dryRunResult = dryRunResultStore
  const [dryRunLoading, setDryRunLoading] = useState(false)

  function toggle(field, value) {
    const current = config[field]
    setConfig({
      ...config,
      [field]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value],
    })
  }

  async function handleCreate() {
    const result = await dispatch(createAlert(config))
    if (createAlert.fulfilled.match(result)) {
      setConfig({ ...EMPTY_FORM })
      dispatch(clearDryRunResult())
    }
  }

  async function handleDryRun() {
    setDryRunLoading(true)
    try {
      await dispatch(dryRunAlertRule({
        metric:    config.metric,
        scope:     config.scope,
        threshold: config.threshold,
        window:    config.window,
      }))
    } finally {
      setDryRunLoading(false)
    }
  }

  const canCreate = config.name && config.threshold && config.actions.length > 0

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Configurar regla de alerta</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          UC_ALR_01 — Crear y configurar reglas de alerta
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Panel izquierdo — datos básicos + condición */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Nombre de la regla</label>
            <input
              type="text"
              value={config.name}
              onChange={e => setConfig({ ...config, name: e.target.value })}
              placeholder="Ej: SL crítico cola ventas"
            />
          </div>

          <div>
            <label>Descripción</label>
            <textarea
              value={config.description}
              onChange={e => setConfig({ ...config, description: e.target.value })}
              placeholder="Describe cuándo disparar esta alerta…"
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Métrica</label>
              <select
                value={config.metric}
                onChange={e => setConfig({ ...config, metric: e.target.value })}
              >
                {METRICS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Scope</label>
              <select
                value={config.scope}
                onChange={e => setConfig({ ...config, scope: e.target.value })}
              >
                {SCOPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label>Umbral</label>
              <input
                type="number"
                value={config.threshold}
                onChange={e => setConfig({ ...config, threshold: e.target.value })}
                placeholder="Ej: 80"
              />
            </div>
            <div>
              <label>Ventana (min)</label>
              <input
                type="number"
                value={config.window}
                onChange={e => setConfig({ ...config, window: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <label>Cooldown (min)</label>
              <input
                type="number"
                value={config.cooldown_minutes}
                onChange={e => setConfig({ ...config, cooldown_minutes: Number(e.target.value) })}
                min={1}
              />
            </div>
          </div>

          {/* FA-03: dry-run test */}
          <div>
            <button
              className="btn btn-secondary"
              onClick={handleDryRun}
              disabled={!config.metric || !config.threshold || dryRunLoading}
              type="button"
            >
              {dryRunLoading ? 'Probando…' : 'Probar condición (dry-run)'}
            </button>
            {dryRunResult && (
              <div
                role="status"
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: dryRunResult.ok ? '#064e3b' : '#7f1d1d',
                  color: dryRunResult.ok ? '#6ee7b7' : '#fca5a5',
                }}
              >
                {dryRunResult?.status === 'error'
                  ? `Error: ${dryRunResult?.message ?? 'Condición inválida'}`
                  : `Condición validada — ${JSON.stringify(dryRunResult)}`}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho — severity, acciones, estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Severidad</label>
            <select
              value={config.severity}
              onChange={e => setConfig({ ...config, severity: e.target.value })}
            >
              {SEVERITIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Acciones al disparar</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ACTIONS.map(action => (
                <label key={action.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.actions.includes(action.value)}
                    onChange={() => toggle('actions', action.value)}
                  />
                  {action.label}
                </label>
              ))}
            </div>
          </div>

          {/* FA-02: status toggle (active/paused) */}
          <div>
            <label>Estado inicial</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              {['active', 'paused'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={config.status === s}
                    onChange={() => setConfig({ ...config, status: s })}
                  />
                  {s === 'active' ? 'Activa' : 'Pausada'}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" className="error-banner">
              {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setConfig({ ...EMPTY_FORM }); dispatch(clearDryRunResult()) }}
              type="button"
            >
              Limpiar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!canCreate || loading}
              type="button"
            >
              {loading ? 'Creando…' : 'Crear regla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
