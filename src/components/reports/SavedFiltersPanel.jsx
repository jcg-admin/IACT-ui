import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSavedFilters, deleteFilter, setDefaultFilter, selectSavedFilters, selectSavedFiltersLoading } from '../../redux/slices/savedFilters'
import LoadingSpinner from '../shared/LoadingSpinner'
import ShareReportModal from './ShareReportModal'

export default function SavedFiltersPanel({ onApply }) {
  const dispatch = useDispatch()
  const savedFilters = useSelector(selectSavedFilters)
  const loading = useSelector(selectSavedFiltersLoading)
  const autoApplied = useRef(false)
  const [shareModal, setShareModal] = useState({ isOpen: false, viewId: null, viewName: '' })

  useEffect(() => {
    dispatch(fetchSavedFilters())
  }, [dispatch])

  // Auto-apply default filter once after first data load (UC_RPT_09 FA-04).
  // The ref guard prevents re-firing when the store updates later (e.g. after
  // setDefaultFilter), which would overwrite filters the user applied manually.
  useEffect(() => {
    if (savedFilters.length > 0 && onApply && !autoApplied.current) {
      const defaultFilter = savedFilters.find((sf) => sf.is_default)
      if (defaultFilter) {
        autoApplied.current = true
        onApply(defaultFilter.filters)
      }
    }
  }, [savedFilters, onApply])

  function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta vista guardada?')) return
    dispatch(deleteFilter(id))
  }

  function handleSetDefault(id) {
    dispatch(setDefaultFilter(id))
  }

  function handleShare(sf) {
    setShareModal({ isOpen: true, viewId: sf.id, viewName: sf.name })
  }

  function handleShareClose() {
    setShareModal({ isOpen: false, viewId: null, viewName: '' })
  }

  if (loading) return <LoadingSpinner size="sm" />
  if (savedFilters.length === 0) return null

  return (
    <div className="saved-filters-panel" style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Vistas guardadas</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {savedFilters.map((sf) => (
          <li key={sf.id} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => onApply(sf.filters)}>
              {sf.is_default ? '★ ' : ''}{sf.name}
            </button>
            <button
              className="btn"
              aria-label={`Marcar ${sf.name} como default`}
              title="Marcar como filtro por defecto"
              style={{ fontSize: '0.75rem', color: sf.is_default ? '#f59e0b' : '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => handleSetDefault(sf.id)}
            >
              ☆
            </button>
            <button
              className="btn"
              aria-label={`Compartir ${sf.name}`}
              title="Compartir vista"
              style={{ fontSize: '0.75rem', color: '#60a5fa', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => handleShare(sf)}
            >
              ↗
            </button>
            <button
              className="btn"
              style={{ fontSize: '0.75rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => handleDelete(sf.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <ShareReportModal
        isOpen={shareModal.isOpen}
        onClose={handleShareClose}
        viewId={shareModal.viewId}
        viewName={shareModal.viewName}
      />
    </div>
  )
}
