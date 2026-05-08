/**
 * Tests para reportsSlice
 *
 * Cubre: estado inicial, thunks fetchDashboardMetrics / fetchScheduledReports /
 * createScheduledReport, updateMetrics reducer, y selectores.
 */

import { configureStore } from '@reduxjs/toolkit'
import reportsReducer, {
  fetchDashboardMetrics,
  fetchScheduledReports,
  createScheduledReport,
  updateMetrics,
  selectMetrics,
  selectScheduledReports,
  selectReportsLoading,
  selectReportsError,
} from '../reports'
import reportsService from '../../../services/reportsService'

jest.mock('../../../services/reportsService')

function buildStore(preloaded) {
  const config = { reducer: { reports: reportsReducer } }
  if (preloaded) config.preloadedState = { reports: preloaded }
  return configureStore(config)
}

// ── Estado inicial ─────────────────────────────────────────────────────────

describe('reportsSlice — estado inicial', () => {
  it('tiene valores por defecto correctos', () => {
    const store = buildStore()
    const state = store.getState().reports
    expect(state.metrics).toBeNull()
    expect(state.scheduledReports).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })
})

// ── fetchDashboardMetrics ─────────────────────────────────────────────────

describe('fetchDashboardMetrics thunk', () => {
  it('pone loading en true mientras está pendiente', () => {
    reportsService.getDashboardMetrics.mockReturnValue(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchDashboardMetrics())
    expect(selectReportsLoading(store.getState())).toBe(true)
  })

  it('puebla metrics en fulfilled y pone loading en false', async () => {
    const mockMetrics = { totalUsers: 500, activeUsers: 300 }
    reportsService.getDashboardMetrics.mockResolvedValue(mockMetrics)
    const store = buildStore()
    await store.dispatch(fetchDashboardMetrics())
    expect(selectMetrics(store.getState())).toEqual(mockMetrics)
    expect(selectReportsLoading(store.getState())).toBe(false)
  })

  it('guarda error en rejected y pone loading en false', async () => {
    reportsService.getDashboardMetrics.mockRejectedValue(new Error('Server error'))
    const store = buildStore()
    await store.dispatch(fetchDashboardMetrics())
    expect(selectReportsError(store.getState()).message).toBe('Server error')
    expect(selectReportsLoading(store.getState())).toBe(false)
  })
})

// ── fetchScheduledReports ─────────────────────────────────────────────────

describe('fetchScheduledReports thunk', () => {
  it('pone loading en true mientras está pendiente', () => {
    reportsService.getScheduledReports.mockReturnValue(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchScheduledReports())
    expect(selectReportsLoading(store.getState())).toBe(true)
  })

  it('puebla scheduledReports desde respuesta paginada', async () => {
    const mockReports = [{ id: 1, name: 'Daily' }, { id: 2, name: 'Weekly' }]
    reportsService.getScheduledReports.mockResolvedValue({ results: mockReports, count: 2 })
    const store = buildStore()
    await store.dispatch(fetchScheduledReports())
    expect(selectScheduledReports(store.getState())).toEqual(mockReports)
  })

  it('puebla scheduledReports desde array directo (sin paginación)', async () => {
    const mockReports = [{ id: 1, name: 'Daily' }]
    reportsService.getScheduledReports.mockResolvedValue(mockReports)
    const store = buildStore()
    await store.dispatch(fetchScheduledReports())
    expect(selectScheduledReports(store.getState())).toEqual(mockReports)
  })

  it('guarda error en rejected', async () => {
    reportsService.getScheduledReports.mockRejectedValue(new Error('Forbidden'))
    const store = buildStore()
    await store.dispatch(fetchScheduledReports())
    expect(selectReportsError(store.getState()).message).toBe('Forbidden')
  })
})

// ── createScheduledReport ─────────────────────────────────────────────────

describe('createScheduledReport thunk', () => {
  it('agrega el nuevo reporte a scheduledReports en fulfilled', async () => {
    const config = { name: 'Monthly', type: 'campaigns' }
    const created = { id: 99, ...config }
    reportsService.scheduleReport.mockResolvedValue(created)
    const store = buildStore()
    await store.dispatch(createScheduledReport(config))
    expect(selectScheduledReports(store.getState())).toContainEqual(created)
  })

  it('guarda error en rejected', async () => {
    reportsService.scheduleReport.mockRejectedValue(new Error('Validation error'))
    const store = buildStore()
    await store.dispatch(createScheduledReport({}))
    expect(selectReportsError(store.getState()).message).toBe('Validation error')
  })
})

// ── updateMetrics reducer ─────────────────────────────────────────────────

describe('updateMetrics reducer', () => {
  it('fusiona campos nuevos con métricas existentes', () => {
    const store = buildStore({ metrics: { totalUsers: 100, activeUsers: 50 }, scheduledReports: [], loading: false, error: null })
    store.dispatch(updateMetrics({ activeUsers: 75, jobsRunning: 5 }))
    const metrics = selectMetrics(store.getState())
    expect(metrics.totalUsers).toBe(100)
    expect(metrics.activeUsers).toBe(75)
    expect(metrics.jobsRunning).toBe(5)
  })
})

// ── Selectores ─────────────────────────────────────────────────────────────

describe('selectores', () => {
  it('selectMetrics retorna null en estado inicial', () => {
    expect(selectMetrics({ reports: { metrics: null, scheduledReports: [], loading: false, error: null } })).toBeNull()
  })

  it('selectScheduledReports retorna array vacío en estado inicial', () => {
    expect(selectScheduledReports({ reports: { metrics: null, scheduledReports: [], loading: false, error: null } })).toEqual([])
  })

  it('selectReportsLoading retorna false en estado inicial', () => {
    expect(selectReportsLoading({ reports: { metrics: null, scheduledReports: [], loading: false, error: null } })).toBe(false)
  })

  it('selectReportsError retorna null en estado inicial', () => {
    expect(selectReportsError({ reports: { metrics: null, scheduledReports: [], loading: false, error: null } })).toBeNull()
  })
})
