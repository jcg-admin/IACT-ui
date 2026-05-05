import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchLogs, selectSearchResults, selectLogsLoading, selectLogsError } from '../../redux/slices/logsSlice'

export default function LogSearchPage() {
  const dispatch = useDispatch()
  const results = useSelector(selectSearchResults)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearched(true)
    dispatch(searchLogs({ query: query.trim(), params: {} }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Búsqueda de logs</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en logs..."
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>Buscar</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading && <div className="loading-state">Buscando...</div>}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">Sin resultados para "{query}".</div>
      )}

      {!loading && results.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Fuente</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {results.map((log, i) => (
              <tr key={log.id ?? i}>
                <td>{log.timestamp}</td>
                <td>{log.source}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
