import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashboardMetrics, selectMetrics, selectReportsLoading } from '@redux/slices/reports'
import { selectContextError } from '@redux/slices/error'
import LoadingSpinner from '@components/shared/LoadingSpinner'
import styles from './Dashboard.module.scss'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const metrics = useSelector(selectMetrics)
  const loading = useSelector(selectReportsLoading)
  const error = useSelector(selectContextError('reports'))

  useEffect(() => {
    dispatch(fetchDashboardMetrics())
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bienvenido, {user?.first_name || 'Usuario'}</h1>
        <p className="page-subtitle">
          Dashboard IVR — Trimestre {metrics?.trimestre_activo ?? '…'}
        </p>
      </div>

      {error?.message && (
        <div className="error-banner" role="alert">
          Error al cargar dashboard: {error.message}
        </div>
      )}

      {loading && !metrics?.total_llamadas ? (
        <LoadingSpinner message="Cargando datos del dashboard…" />
      ) : (
        <>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total Llamadas</span>
              <span className={styles.kpiValue}>
                {metrics?.total_llamadas?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total Abandonadas</span>
              <span className={styles.kpiValue}>
                {metrics?.total_abandonadas?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Tasa de Abandono</span>
              <span className={styles.kpiValue}>
                {metrics?.tasa_abandono != null
                  ? `${metrics.tasa_abandono.toFixed(2)}%`
                  : '—'}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Trimestre</span>
              <span className={styles.kpiValue}>
                {metrics?.trimestre_activo ?? '—'}
              </span>
            </div>
          </div>

          {metrics?.centros_principales?.length > 0 && (
            <div className={`${styles.centrosCard} card`}>
              <div className="card-header">
                <h3 className="card-title">Centros de Transferencia Principales</h3>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Centro</th>
                      <th className={styles.colRight}>Llamadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.centros_principales.map((c) => (
                      <tr key={c.centro}>
                        <td>{c.centro}</td>
                        <td className={styles.colRight}>{c.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
