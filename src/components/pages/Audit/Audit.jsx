/**
 * AuditPage — Registro de Auditoría (ITER6)
 *
 * Visualización y búsqueda de logs de auditoría y reporte de cumplimiento.
 * Requiere permiso VIEW_AUDIT.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuditLogs,
  searchAuditLogs,
  selectLogs,
  selectSearchResults,
} from '@redux/slices/auditSlice'
import './AuditPage.scss'

const selectAuditLoading = (state) => state.audit.loading
const selectAuditError = (state) => state.audit.error

export default function Audit() {
  const dispatch = useDispatch()
  const logs = useSelector(selectLogs)
  const searchResults = useSelector(selectSearchResults)
  const loading = useSelector(selectAuditLoading)
  const error = useSelector(selectAuditError)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    dispatch(fetchAuditLogs())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearching(true)
      dispatch(searchAuditLogs({ query }))
    } else {
      setSearching(false)
    }
  }

  const displayedLogs = searching && searchResults?.length ? searchResults : logs

  return (
    <div className="audit-page page-container">
      <header className="page-header">
        <h1>Registro de Auditoría</h1>
        <p className="page-subtitle">Historial de actividad y cumplimiento normativo</p>
      </header>

      <form className="search-bar" onSubmit={handleSearch} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por usuario, acción o recurso…"
          aria-label="Buscar logs de auditoría"
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">Buscar</button>
        {searching && (
          <button type="button" className="btn btn-secondary" onClick={() => { setSearching(false); setQuery('') }}>
            Limpiar
          </button>
        )}
      </form>

      {error && (
        <div className="error-banner" role="alert">
          Error cargando auditoría: {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state" aria-busy="true">Cargando registros…</div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="table" aria-label="Logs de auditoría">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Recurso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs && displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString('es')}</td>
                    <td>{log.user || log.user_id}</td>
                    <td>{log.action}</td>
                    <td>{log.resource}</td>
                    <td>
                      <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">No hay registros disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
