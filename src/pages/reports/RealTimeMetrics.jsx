import React from 'react'
import { useRealTimeMetrics } from '@hooks/domain/useRealTimeMetrics'

function MetricCard({ label, value, unit, highlight }) {
  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: highlight ? '#f59e0b' : '#fff' }}>
        {value ?? '—'}
        {unit && <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '4px' }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function RealTimeMetrics() {
  const { metrics, loading, error } = useRealTimeMetrics()

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Métricas en Tiempo Real</h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
            UC-RPT-02 — Actualización automática cada 30 segundos
          </p>
        </div>
        {metrics && (
          <div style={{ textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>
            <div>Última actualización</div>
            <div>{new Date(metrics.timestamp).toLocaleTimeString()}</div>
            <div style={{ marginTop: '4px' }}>
              Lag: <span style={{ color: metrics.lag_seconds > 10 ? '#ef4444' : '#34d399' }}>
                {metrics.lag_seconds} s
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="error-banner">
          Error al cargar métricas: {error}
        </div>
      )}

      {loading && !metrics ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
          Cargando métricas en tiempo real…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <MetricCard
            label="Llamadas en cola"
            value={metrics?.queue_count}
            highlight={metrics?.queue_count > 20}
          />
          <MetricCard
            label="Agentes ocupados"
            value={metrics?.agents_busy}
          />
          <MetricCard
            label="Agentes libres"
            value={metrics?.agents_idle}
          />
          <MetricCard
            label="Atendidas / hora"
            value={metrics?.answered_per_hour}
          />
          <MetricCard
            label="Abandono / 5 min"
            value={metrics?.abandon_rate_5min != null ? `${metrics.abandon_rate_5min}` : null}
            unit="%"
            highlight={metrics?.abandon_rate_5min > 10}
          />
          <MetricCard
            label="Nivel de servicio / 15 min"
            value={metrics?.service_level_15min != null ? `${metrics.service_level_15min}` : null}
            unit="%"
          />
        </div>
      )}
    </div>
  )
}
