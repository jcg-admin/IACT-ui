import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSavedViews,
  deleteSavedView,
  selectSavedViews,
  selectReportsLoading,
  selectReportsError,
} from '@store/slices/reports'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ConfirmModal from '../../components/shared/ConfirmModal'
import Table from '@ui/presentational/Table'

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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, view: null })

  useEffect(() => {
    dispatch(fetchSavedViews())
  }, [dispatch])

  const handleDelete = (view) => setDeleteModal({ isOpen: true, view })

  const handleConfirmDelete = () => {
    dispatch(deleteSavedView(deleteModal.view.id))
    setDeleteModal({ isOpen: false, view: null })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Vistas Guardadas</h1>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'report_type', label: 'Tipo de reporte', render: (v) => REPORT_TYPE_LABELS[v] ?? v },
          {
            key: 'filters',
            label: 'Filtros',
            render: (v) => (
              <code style={{ fontSize: '12px' }}>
                {Object.entries(v ?? {}).map(([k, val]) => `${k}: ${val}`).join(', ') || '—'}
              </code>
            ),
          },
          { key: 'created_at', label: 'Creada', render: (v) => formatDate(v) },
        ]}
        data={views}
        loading={loading}
        sortable={false}
        emptyMessage="No hay vistas guardadas."
        actions={[
          { label: 'Eliminar', onClick: (row) => handleDelete(row), variant: 'secondary' },
        ]}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, view: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar vista"
        message={`¿Eliminar la vista "${deleteModal.view?.name}"?`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
