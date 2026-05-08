import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSavedViews,
  deleteSavedView,
  selectSavedViews,
  selectReportsLoading,
  selectReportsError,
} from '@store/slices/reports'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const REPORT_TYPE_LABELS = {
  agents:         'Agentes',
  queues:         'Colas',
  campaigns:      'Campañas',
  transfers:      'Transferencias',
  ivr_menus:      'Menús IVR',
  unique_clients: 'Clientes únicos',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: '2-digit',
  })
}

export default function SavedViews() {
  const dispatch = useDispatch()
  const views   = useSelector(selectSavedViews)
  const loading = useSelector(selectReportsLoading)
  const error   = useSelector(selectReportsError)

  useEffect(() => {
    dispatch(fetchSavedViews())
  }, [dispatch])

  const handleDelete = (view) => {
    if (!window.confirm(`¿Eliminar la vista "${view.name}"?`)) return
    dispatch(deleteSavedView(view.id))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Vistas Guardadas</h1>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando vistas guardadas..." />
      ) : views.length === 0 ? (
        <div className="empty-state">No hay vistas guardadas.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo de reporte</th>
              <th>Filtros</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {views.map((view) => (
              <tr key={view.id}>
                <td>{view.name}</td>
                <td>{REPORT_TYPE_LABELS[view.report_type] ?? view.report_type}</td>
                <td>
                  <code style={{ fontSize: '12px' }}>
                    {Object.entries(view.filters ?? {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || '—'}
                  </code>
                </td>
                <td>{formatDate(view.created_at)}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDelete(view)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
