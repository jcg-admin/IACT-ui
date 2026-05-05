import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer, {
  setMetrics,
  setCharts,
  setDashboardLoading,
  setDashboardError,
  fetchDashboardData,
} from '../dashboardSlice'

jest.mock('@mocks/dashboardData', () => ({
  getMockDashboardData: jest.fn().mockReturnValue({ metrics: { totalCalls: 100 }, charts: {} }),
}))

function buildStore() {
  return configureStore({ reducer: { dashboard: dashboardReducer } })
}

describe('dashboardSlice', () => {
  it('starts with empty metrics and not loading', () => {
    const store = buildStore()
    const { dashboard } = store.getState()
    expect(dashboard.loading).toBe(false)
    expect(dashboard.error).toBeNull()
  })

  it('setMetrics updates metrics', () => {
    const store = buildStore()
    store.dispatch(setMetrics({ totalCalls: 42 }))
    expect(store.getState().dashboard.metrics).toEqual({ totalCalls: 42 })
  })

  it('setCharts updates charts', () => {
    const store = buildStore()
    store.dispatch(setCharts({ line: [1, 2, 3] }))
    expect(store.getState().dashboard.charts).toEqual({ line: [1, 2, 3] })
  })

  it('setDashboardLoading updates loading flag', () => {
    const store = buildStore()
    store.dispatch(setDashboardLoading(true))
    expect(store.getState().dashboard.loading).toBe(true)
  })

  it('setDashboardError sets error message', () => {
    const store = buildStore()
    store.dispatch(setDashboardError('network failure'))
    expect(store.getState().dashboard.error).toBe('network failure')
  })

  it('fetchDashboardData fulfilled populates metrics', async () => {
    const store = buildStore()
    await store.dispatch(fetchDashboardData())
    expect(store.getState().dashboard.metrics).toEqual({ totalCalls: 100 })
  }, 2000)
})
