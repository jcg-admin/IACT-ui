import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '@redux/slices/dashboardSlice';

function KpiCard({ label, value, unit }) {
  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
        {value ?? '—'}
        {unit && <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>{unit}</span>}
      </div>
    </div>
  );
}

function CentrosTable({ centros }) {
  if (!centros?.length) return null;
  return (
    <div className="card" style={{ padding: '20px', marginTop: '24px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#cbd5e1' }}>
        Centros de Transferencia Principales
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#6b7280', fontSize: '12px', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Centro</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Llamadas</th>
          </tr>
        </thead>
        <tbody>
          {centros.map((c) => (
            <tr key={c.centro} style={{ borderTop: '1px solid #1f2937' }}>
              <td style={{ padding: '10px 0', color: '#e2e8f0' }}>{c.centro}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: '#94a3b8' }}>
                {c.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { metrics, loading, error, lastUpdate } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="p-lg">
      <div style={{ marginBottom: '24px' }}>
        <h1>Bienvenido, {user?.first_name || 'Usuario'}</h1>
        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>
          Dashboard IVR — Trimestre {metrics?.trimestre_activo ?? '…'}
          {lastUpdate && (
            <span style={{ color: '#6b7280', marginLeft: '12px' }}>
              Actualizado: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', background: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          Error al cargar dashboard: {error}
        </div>
      )}

      {loading && !metrics?.total_llamadas ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
          Cargando datos del dashboard…
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            <KpiCard
              label="Total Llamadas"
              value={metrics?.total_llamadas?.toLocaleString()}
            />
            <KpiCard
              label="Total Abandonadas"
              value={metrics?.total_abandonadas?.toLocaleString()}
            />
            <KpiCard
              label="Tasa de Abandono"
              value={metrics?.tasa_abandono != null ? metrics.tasa_abandono.toFixed(2) : null}
              unit="%"
            />
            <KpiCard
              label="Trimestre"
              value={metrics?.trimestre_activo}
            />
          </div>

          <CentrosTable centros={metrics?.centros_principales} />
        </>
      )}
    </div>
  );
}
