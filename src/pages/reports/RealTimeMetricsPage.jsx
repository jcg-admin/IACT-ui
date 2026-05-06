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

export default function RealTimeMetricsPage() {
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
            <div>{new Date(metrics.updatedAt).toLocaleTimeString()}</div>
            <div style={{ marginTop: '4px' }}>
              Lag: <span style={{ color: metrics.lagSeconds > 10 ? '#ef4444' : '#34d399' }}>
                {metrics.lagSeconds} s
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
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
            value={metrics?.callsQueued}
            highlight={metrics?.callsQueued > 20}
          />
          <MetricCard
            label="Agentes ocupados"
            value={metrics?.agentsBusy}
          />
          <MetricCard
            label="Agentes libres"
            value={metrics?.agentsIdle}
          />
          <MetricCard
            label="Atendidas / hora"
            value={metrics?.callsAnsweredPerHour}
          />
          <MetricCard
            label="Abandono / 5 min"
            value={metrics?.abandonRatePer5Min != null ? `${metrics.abandonRatePer5Min}` : null}
            unit="%"
            highlight={metrics?.abandonRatePer5Min > 10}
          />
          <MetricCard
            label="Nivel de servicio / 15 min"
            value={metrics?.serviceLevelPer15Min != null ? `${metrics.serviceLevelPer15Min}` : null}
            unit="%"
          />
        </div>
      )}
    </div>
  )
}
