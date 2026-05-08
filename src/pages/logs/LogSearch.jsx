import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchLogs, selectSearchResults, selectLogsLoading } from '../../redux/slices/logs'
import ReportTable from '../../components/reports/ReportTable'

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'source', label: 'Fuente' },
  { key: 'message', label: 'Mensaje' },
]

export default function LogSearch() {
  const dispatch = useDispatch()
  const results = useSelector(selectSearchResults)
  const loading = useSelector(selectLogsLoading)

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

      {(searched || results.length > 0) && (
        <ReportTable
          columns={COLUMNS}
          data={results}
          loading={loading}
          emptyMessage={`Sin resultados para "${query}".`}
        />
      )}
    </div>
  )
}
