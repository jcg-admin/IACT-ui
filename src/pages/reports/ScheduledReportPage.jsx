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

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'cron']
const FREQUENCY_LABELS = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', cron: 'Cron' }

const REPORT_TYPES = [
  { value: 'agents', label: 'Agentes' },
  { value: 'queues', label: 'Colas' },
  { value: 'campaigns', label: 'Campañas' },
  { value: 'transfers', label: 'Transferencias' },
  { value: 'ivr_menus', label: 'Menús IVR' },
  { value: 'unique_clients', label: 'Clientes únicos' },
]

const PERIOD_OPTIONS = [
  { value: 'last_24h', label: 'Últimas 24 h' },
  { value: 'last_7d', label: 'Últimos 7 días' },
  { value: 'last_30d', label: 'Últimos 30 días' },
]

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
]

const DAY_OF_WEEK_OPTIONS = [
  { value: '1', label: 'Lunes' }, { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' }, { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' }, { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
]

const fieldStyle = { marginBottom: '12px' }
const labelStyle = { display: 'block', color: '#9ca3af', marginBottom: '4px', fontSize: '14px' }

function Field({ htmlFor, label, children }) {
  return (
    <div style={fieldStyle}>
      <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function CreateForm({ onCancel }) {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [reportType, setReportType] = useState('agents')
  const [periodRelative, setPeriodRelative] = useState('last_24h')
  const [format, setFormat] = useState('csv')
  const [frequency, setFrequency] = useState('daily')
  const [time, setTime] = useState('08:00')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [cronExpr, setCronExpr] = useState('0 8 * * *')
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const schedule = { frequency, timezone }
    if (frequency !== 'cron') schedule.hour = time
    if (frequency === 'weekly') schedule.day_of_week = dayOfWeek
    if (frequency === 'monthly') schedule.day_of_month = Number(dayOfMonth)
    if (frequency === 'cron') schedule.cron_expr = cronExpr
    dispatch(createScheduledReport({
      name: name.trim(),
      report_type: reportType,
      period_relative: periodRelative,
      format,
      schedule,
    }))
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#fff' }}>Nuevo reporte programado</h2>

      <Field htmlFor="sched-name" label="Nombre del reporte">
        <input
          id="sched-name"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: KPIs diarios del call center"
          required
        />
      </Field>

      <Field htmlFor="sched-report-type" label="Tipo de reporte">
        <select id="sched-report-type" className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
          {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </Field>

      <Field htmlFor="sched-period" label="Período">
        <select id="sched-period" className="form-control" value={periodRelative} onChange={(e) => setPeriodRelative(e.target.value)}>
          {PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </Field>

      <Field htmlFor="sched-format" label="Formato">
        <select id="sched-format" className="form-control" value={format} onChange={(e) => setFormat(e.target.value)}>
          {FORMAT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </Field>

      <Field htmlFor="sched-frequency" label="Frecuencia">
        <select id="sched-frequency" className="form-control" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
        </select>
      </Field>

      {frequency !== 'cron' && (
        <Field htmlFor="sched-time" label="Hora de ejecución">
          <input id="sched-time" type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      )}

      {frequency === 'weekly' && (
        <Field htmlFor="sched-dow" label="Día de la semana">
          <select id="sched-dow" className="form-control" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            {DAY_OF_WEEK_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </Field>
      )}

      {frequency === 'monthly' && (
        <Field htmlFor="sched-dom" label="Día del mes">
          <input
            id="sched-dom"
            type="number"
            min="1"
            max="28"
            className="form-control"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
          />
        </Field>
      )}

      {frequency === 'cron' && (
        <Field htmlFor="sched-cron" label="Expresión Cron">
          <input
            id="sched-cron"
            type="text"
            className="form-control"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            placeholder="0 8 * * 1"
          />
        </Field>
      )}

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
          <button className="btn btn-sm btn-secondary" onClick={() => dispatch(pauseSchedule(schedule.id))} aria-label="Pausar">
            Pausar
          </button>
        ) : (
          <button className="btn btn-sm btn-primary" onClick={() => dispatch(resumeSchedule(schedule.id))} aria-label="Reanudar">
            Reanudar
          </button>
        )}
        <button className="btn btn-sm btn-primary" onClick={() => dispatch(runScheduleNow(schedule.id))} aria-label="Ejecutar ahora">
          Ejecutar
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => dispatch(deleteSchedule(schedule.id))} aria-label="Eliminar">
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
