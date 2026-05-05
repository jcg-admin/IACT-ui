import { configureStore } from '@reduxjs/toolkit'
import alertsReducer, {
  fetchAlerts,
  fetchTemplates,
  clearError,
  selectAlerts,
  selectTemplates,
  selectLoading,
  selectError,
} from '../alertsSlice'

jest.mock('../../../services/alertManager', () => ({
  __esModule: true,
  default: {
    getAlerts: jest.fn(),
    getTemplates: jest.fn(),
  },
}))

const alertsService = require('../../../services/alertManager').default

function buildStore() {
  return configureStore({ reducer: { alerts: alertsReducer } })
}

describe('alertsSlice — fetchAlerts', () => {
  it('sets alerts on fulfilled', async () => {
    const alerts = [{ id: 1, name: 'CPU High', is_active: true }]
    alertsService.getAlerts.mockResolvedValueOnce(alerts)
    const store = buildStore()
    await store.dispatch(fetchAlerts())
    expect(selectAlerts(store.getState())).toEqual(alerts)
  })

  it('sets loading true while pending', () => {
    alertsService.getAlerts.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchAlerts())
    expect(selectLoading(store.getState())).toBe(true)
  })
})

describe('alertsSlice — fetchTemplates', () => {
  it('sets templates on fulfilled', async () => {
    const templates = [{ id: 1, name: 'Default Template' }]
    alertsService.getTemplates.mockResolvedValueOnce(templates)
    const store = buildStore()
    await store.dispatch(fetchTemplates())
    expect(selectTemplates(store.getState())).toEqual(templates)
  })
})

describe('alertsSlice — clearError', () => {
  it('resets error to null', () => {
    const store = configureStore({
      reducer: { alerts: alertsReducer },
      preloadedState: { alerts: { alerts: [], subscriptions: [], history: [], templates: [], loading: false, error: 'bad', success: false } },
    })
    store.dispatch(clearError())
    expect(selectError(store.getState())).toBeNull()
  })
})
