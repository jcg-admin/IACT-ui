import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSavedFilters, deleteFilter, selectSavedFilters, selectSavedFiltersLoading } from '../../redux/slices/savedFiltersSlice'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function SavedFiltersPanel({ onApply }) {
  const dispatch = useDispatch()
  const savedFilters = useSelector(selectSavedFilters)
  const loading = useSelector(selectSavedFiltersLoading)

  useEffect(() => {
    dispatch(fetchSavedFilters())
  }, [dispatch])

  function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta vista guardada?')) return
    dispatch(deleteFilter(id))
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
              {sf.name}
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
    </div>
  )
}
