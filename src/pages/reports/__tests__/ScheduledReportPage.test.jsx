import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ScheduledReportPage from '../ScheduledReportPage'

jest.mock('@redux/slices/reportsSlice', () => ({
  fetchScheduledReports: jest.fn(() => ({ type: 'reports/fetchScheduledReports' })),
  createScheduledReport: jest.fn(() => ({ type: 'reports/createScheduledReport' })),
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

describe('ScheduledReportPage', () => {
  it('renderiza el título de la página', () => {
    wrap(<ScheduledReportPage />)
    expect(screen.getByRole('heading', { name: /reportes programados/i })).toBeInTheDocument()
  })

  it('despacha fetchScheduledReports al montar', () => {
    const { fetchScheduledReports } = require('@redux/slices/reportsSlice')
    wrap(<ScheduledReportPage />)
    expect(fetchScheduledReports).toHaveBeenCalled()
  })

  it('muestra lista de schedules cuando hay datos', () => {
    const store = buildStore({
      scheduledReports: [
        { id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' },
        { id: '2', name: 'Weekly Summary', frequency: 'weekly', status: 'paused' },
      ],
    })
    wrap(<ScheduledReportPage />, store)
    expect(screen.getByText('Daily KPIs')).toBeInTheDocument()
    expect(screen.getByText('Weekly Summary')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay schedules', () => {
    wrap(<ScheduledReportPage />)
    expect(screen.getByText(/no hay reportes programados/i)).toBeInTheDocument()
  })

  it('muestra el tab Crear al hacer click en "Nuevo"', () => {
    wrap(<ScheduledReportPage />)
    const btn = screen.getByRole('button', { name: /nuevo/i })
    fireEvent.click(btn)
    expect(screen.getByLabelText(/nombre del reporte/i)).toBeInTheDocument()
  })

  it('despacha pauseSchedule al hacer click en Pausar', () => {
    const { pauseSchedule } = require('@redux/slices/reportsSlice')
    const store = buildStore({
      scheduledReports: [{ id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' }],
    })
    wrap(<ScheduledReportPage />, store)
    fireEvent.click(screen.getByRole('button', { name: /pausar/i }))
    expect(pauseSchedule).toHaveBeenCalled()
  })

  it('despacha deleteSchedule al confirmar eliminación', () => {
    const { deleteSchedule } = require('@redux/slices/reportsSlice')
    const store = buildStore({
      scheduledReports: [{ id: '1', name: 'Daily KPIs', frequency: 'daily', status: 'active' }],
    })
    wrap(<ScheduledReportPage />, store)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(deleteSchedule).toHaveBeenCalled()
  })

  it('muestra indicador de loading', () => {
    const store = buildStore({ loading: true })
    wrap(<ScheduledReportPage />, store)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando existe', () => {
    const store = buildStore({ error: 'Error de red' })
    wrap(<ScheduledReportPage />, store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
