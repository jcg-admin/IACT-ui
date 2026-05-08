import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchETLAvailability, selectETLAvailability } from '../../redux/slices/logsSlice'

export default function ETLAvailability() {
  const dispatch = useDispatch()
  const availability = useSelector(selectETLAvailability)

  useEffect(() => {
    dispatch(fetchETLAvailability())
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Disponibilidad ETL</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PIP-03 — Estado y disponibilidad de procesos ETL
        </p>
      </div>

      {!availability || availability.length === 0 ? (
        <div className="empty-state">No hay datos de disponibilidad ETL.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Proceso</th>
              <th>Estado</th>
              <th>Última ejecución</th>
              <th>Próxima ejecución</th>
            </tr>
          </thead>
          <tbody>
            {availability.map((item) => (
              <tr key={item.id}>
                <td>{item.process}</td>
                <td>
                  <span className={`badge ${item.available ? 'badge-success' : 'badge-danger'}`}>
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td>{item.last_run ? new Date(item.last_run).toLocaleString('es') : '—'}</td>
                <td>{item.next_run ? new Date(item.next_run).toLocaleString('es') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
