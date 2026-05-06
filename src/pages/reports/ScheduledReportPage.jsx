import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchScheduledReports,
  createScheduledReport,
  pauseSchedule,
  resumeSchedule,
  deleteSchedule,
  runScheduleNow,
  selectScheduledReports,
  selectReportsLoading,
  selectScheduleActionLoading,
  selectReportsError,
} from '@redux/slices/reportsSlice'

const FREQUENCIES = ['daily', 'weekly', 'monthly']

const FREQUENCY_LABELS = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual' }

function CreateForm({ onCancel }) {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [time, setTime] = useState('08:00')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch(createScheduledReport({ name: name.trim(), frequency, time }))
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Nuevo reporte programado</h2>
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="sched-name" style={{ display: 'block', color: '#9ca3af', marginBottom: '4px', fontSize: '14px' }}>
          Nombre del reporte
        </label>
        <input
          id="sched-name"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: KPIs diarios del call center"
          required
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="sched-frequency" style={{ display: 'block', color: '#9ca3af', marginBottom: '4px', fontSize: '14px' }}>
          Frecuencia
        </label>
        <select
          id="sched-frequency"
          className="form-control"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="sched-time" style={{ display: 'block', color: '#9ca3af', marginBottom: '4px', fontSize: '14px' }}>
          Hora de ejecución
        </label>
        <input
          id="sched-time"
          type="time"
          className="form-control"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}

function ScheduleRow({ schedule }) {
  const dispatch = useDispatch()
  const isActive = schedule.status === 'active'

  return (
    <tr>
      <td style={{ color: '#fff', padding: '12px' }}>{schedule.name}</td>
      <td style={{ padding: '12px', color: '#9ca3af' }}>{FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency}</td>
      <td style={{ padding: '12px' }}>
        <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
          {isActive ? 'Activo' : 'Pausado'}
        </span>
      </td>
      <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
        {isActive ? (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => dispatch(pauseSchedule(schedule.id))}
            aria-label="Pausar"
          >
            Pausar
          </button>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => dispatch(resumeSchedule(schedule.id))}
            aria-label="Reanudar"
          >
            Reanudar
          </button>
        )}
        <button
          className="btn btn-sm btn-primary"
          onClick={() => dispatch(runScheduleNow(schedule.id))}
          aria-label="Ejecutar ahora"
        >
          Ejecutar
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => dispatch(deleteSchedule(schedule.id))}
          aria-label="Eliminar"
        >
          Eliminar
        </button>
      </td>
    </tr>
  )
}

export default function ScheduledReportPage() {
  const dispatch = useDispatch()
  const schedules = useSelector(selectScheduledReports)
  const loading = useSelector(selectReportsLoading)
  const actionLoading = useSelector(selectScheduleActionLoading)
  const error = useSelector(selectReportsError)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    dispatch(fetchScheduledReports())
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reportes Programados</h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
            UC-RPT-07/08 — Programar y gestionar reportes recurrentes
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate((v) => !v)}>
          Nuevo
        </button>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {showCreate && <CreateForm onCancel={() => setShowCreate(false)} />}

      {loading ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '24px', textAlign: 'center' }}>
          Cargando reportes programados…
        </div>
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <p>No hay reportes programados.</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Haz click en "Nuevo" para crear el primero.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {actionLoading && (
            <div style={{ padding: '8px 16px', backgroundColor: '#1f2937', color: '#9ca3af', fontSize: '13px' }}>
              Procesando acción…
            </div>
          )}
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Frecuencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <ScheduleRow key={s.id} schedule={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
