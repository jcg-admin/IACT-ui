import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPipelineStatus,
  selectPipelineStatus,
  selectLogsLoading,
  selectLogsError,
} from '@redux/slices/logsSlice'

const ESTADO_COLOR = {
  ok: '#34d399',
  degradado: '#f59e0b',
  critico: '#ef4444',
}

function EstadoBadge({ estado }) {
  const color = ESTADO_COLOR[estado] ?? '#9ca3af'
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 16px',
      borderRadius: '999px',
      backgroundColor: `${color}22`,
      border: `1px solid ${color}`,
      color,
      fontWeight: 700,
      fontSize: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {estado ?? '—'}
    </span>
  )
}

function CounterCard({ label, count, color }) {
  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center', flex: 1 }}>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '36px', fontWeight: 700, color }}>{count ?? '—'}</div>
    </div>
  )
}

function formatRecords(n) {
  if (n == null) return '—'
  return n.toLocaleString()
}

export default function PipelineStatus() {
  const dispatch = useDispatch()
  const status = useSelector(selectPipelineStatus)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  useEffect(() => {
    dispatch(fetchPipelineStatus())
    const id = setInterval(() => dispatch(fetchPipelineStatus()), 30_000)
    return () => clearInterval(id)
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Estado del Pipeline ETL</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PIP-01 — Salud del ETL de Analytics · refresco cada 30 s
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading && !status ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
          Cargando estado del pipeline…
        </div>
      ) : !status ? (
        <div className="empty-state">Sin datos de pipeline disponibles.</div>
      ) : (
        <>
          {/* Estado general */}
          <div className="card" style={{ padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>Estado general</div>
              <EstadoBadge estado={status.estado_general} />
            </div>

            {status.ejecucion_en_curso && (
              <div style={{ marginLeft: '24px', borderLeft: '2px solid #374151', paddingLeft: '24px' }}>
                <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '14px' }}>
                  ⟳ ETL en curso
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Trimestre: {status.ejecucion_en_curso.trimestre}
                </div>
              </div>
            )}
          </div>

          {/* Alerta de fallos */}
          {status.total_fallidas_24h > 0 && (
            <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
              {status.total_fallidas_24h} ejecución(es) fallida(s) en las últimas 24 h.{' '}
              <a href="/logs/etl" style={{ color: '#fca5a5', textDecoration: 'underline' }}>
                Ver detalles
              </a>
            </div>
          )}

          {/* Contadores 24h */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <CounterCard label="Exitosas (24 h)" count={status.total_exitosas_24h} color="#34d399" />
            <CounterCard label="Fallidas (24 h)" count={status.total_fallidas_24h} color="#ef4444" />
          </div>

          {/* Última ejecución exitosa */}
          {status.ultima_ejecucion_exitosa && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Última ejecución exitosa
              </div>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Trimestre</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                    {status.ultima_ejecucion_exitosa.trimestre}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Finalizada</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                    {new Date(status.ultima_ejecucion_exitosa.finished_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Registros cargados</div>
                  <div style={{ color: '#34d399', fontWeight: 700, fontSize: '18px' }}>
                    {formatRecords(status.ultima_ejecucion_exitosa.base_records)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
