import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ScheduledReport from '../ScheduledReport'

const mockCreateScheduledReport = jest.fn(() => ({ type: 'reports/createScheduledReport' }))

jest.mock('@store/slices/reports', () => ({
  fetchScheduledReports: jest.fn(() => ({ type: 'reports/fetchScheduledReports' })),
  createScheduledReport: (...args) => mockCreateScheduledReport(...args),
  pauseSchedule: jest.fn(() => ({ type: 'reports/pauseSchedule' })),
  resumeSchedule: jest.fn(() => ({ type: 'reports/resumeSchedule' })),
  deleteSchedule: jest.fn(() => ({ type: 'reports/deleteSchedule' })),
  runScheduleNow: jest.fn(() => ({ type: 'reports/runScheduleNow' })),
  fetchScheduleHistory: jest.fn(() => ({ type: 'reports/fetchScheduleHistory' })),
  selectScheduledReports: (s) => s.reports?.scheduledReports ?? [],
  selectScheduleHistory: (s) => s.reports?.scheduleHistory ?? [],
  selectReportsLoading: (s) => s.reports?.loading ?? false,
  selectScheduleActionLoading: (s) => s.reports?.scheduleActionLoading ?? false,
  selectReportsError: (s) => s.reports?.error ?? null,
}))

function buildStore(reports = {}) {
  return configureStore({
    reducer: {
      reports: (state = {
        scheduledReports: [],
        scheduleHistory: [],
        loading: false,
        scheduleActionLoading: false,
        error: null,
        ...reports,
      }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(<Provider store={store}>{ui}</Provider>)
}

function openForm() {
  fireEvent.click(screen.getByRole('button', { name: /nuevo/i }))
}

describe('ScheduledReport', () => {
  beforeEach(() => { mockCreateScheduledReport.mockClear() })

  it('renderiza el título de la página', () => {
    wrap(<ScheduledReport />)
    expect(screen.getByRole('heading', { name: /reportes programados/i })).toBeInTheDocument()
  })

  it('despacha fetchScheduledReports al montar', () => {
    const { fetchScheduledReports } = require('@store/slices/reports')
    wrap(<ScheduledReport />)
    expect(fetchScheduledReports).toHaveBeenCalled()
  })

  it('muestra lista de schedules cuando hay datos', () => {
    const store = buildStore({
      scheduledReports: [
        { id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' },
        { id: '2', name: 'Weekly Summary', frequency: 'weekly', status: 'paused' },
      ],
    })
    wrap(<ScheduledReport />, store)
    expect(screen.getByText('Daily KPIs')).toBeInTheDocument()
    expect(screen.getByText('Weekly Summary')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay schedules', () => {
    wrap(<ScheduledReport />)
    expect(screen.getByText(/no hay reportes programados/i)).toBeInTheDocument()
  })

  it('muestra el tab Crear al hacer click en "Nuevo"', () => {
    wrap(<ScheduledReport />)
    openForm()
    expect(screen.getByLabelText(/nombre del reporte/i)).toBeInTheDocument()
  })

  // Campos nuevos del formulario (D-004)
  it('renderiza selector report_type con opciones', () => {
    wrap(<ScheduledReport />)
    openForm()
    const select = screen.getByLabelText(/tipo de reporte/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /agentes/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /colas/i })).toBeInTheDocument()
  })

  it('renderiza selector period_relative con opciones', () => {
    wrap(<ScheduledReport />)
    openForm()
    const select = screen.getByLabelText(/período/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /últimas 24 h/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /últimos 7 días/i })).toBeInTheDocument()
  })

  it('renderiza selector format con opciones', () => {
    wrap(<ScheduledReport />)
    openForm()
    const select = screen.getByLabelText(/formato/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /csv/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /xlsx/i })).toBeInTheDocument()
  })

  it('muestra day_of_week solo cuando frequency = weekly', () => {
    wrap(<ScheduledReport />)
    openForm()
    expect(screen.queryByLabelText(/día de la semana/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/frecuencia/i), { target: { value: 'weekly' } })
    expect(screen.getByLabelText(/día de la semana/i)).toBeInTheDocument()
  })

  it('muestra day_of_month solo cuando frequency = monthly', () => {
    wrap(<ScheduledReport />)
    openForm()
    expect(screen.queryByLabelText(/día del mes/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/frecuencia/i), { target: { value: 'monthly' } })
    expect(screen.getByLabelText(/día del mes/i)).toBeInTheDocument()
  })

  it('muestra cron_expr solo cuando frequency = cron', () => {
    wrap(<ScheduledReport />)
    openForm()
    expect(screen.queryByLabelText(/expresión cron/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/frecuencia/i), { target: { value: 'cron' } })
    expect(screen.getByLabelText(/expresión cron/i)).toBeInTheDocument()
  })

  it('dispatch incluye report_type, period_relative, format en el payload', async () => {
    wrap(<ScheduledReport />)
    openForm()
    fireEvent.change(screen.getByLabelText(/nombre del reporte/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/tipo de reporte/i), { target: { value: 'agents' } })
    fireEvent.change(screen.getByLabelText(/período/i), { target: { value: 'last_7d' } })
    fireEvent.change(screen.getByLabelText(/formato/i), { target: { value: 'xlsx' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    await waitFor(() => {
      expect(mockCreateScheduledReport).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test',
          report_type: 'agents',
          period_relative: 'last_7d',
          format: 'xlsx',
        })
      )
    })
  })

  it('despacha pauseSchedule al hacer click en Pausar', () => {
    const { pauseSchedule } = require('@store/slices/reports')
    const store = buildStore({
      scheduledReports: [{ id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' }],
    })
    wrap(<ScheduledReport />, store)
    fireEvent.click(screen.getByRole('button', { name: /pausar/i }))
    expect(pauseSchedule).toHaveBeenCalled()
  })

  it('despacha deleteSchedule al confirmar eliminación', () => {
    const { deleteSchedule } = require('@store/slices/reports')
    const store = buildStore({
      scheduledReports: [{ id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' }],
    })
    wrap(<ScheduledReport />, store)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /eliminar/i }))
    expect(deleteSchedule).toHaveBeenCalled()
  })

  it('muestra indicador de loading', () => {
    const store = buildStore({ loading: true })
    wrap(<ScheduledReport />, store)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando existe', () => {
    const store = buildStore({ error: 'Error de red' })
    wrap(<ScheduledReport />, store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
