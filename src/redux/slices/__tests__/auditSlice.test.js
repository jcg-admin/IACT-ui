import { configureStore } from '@reduxjs/toolkit'
import auditReducer, {
  fetchAuditLogs,
  searchAuditLogs,
  clearError,
  setFilters,
  selectLogs,
  selectSearchResults,
  selectLoading,
  selectError,
} from '../audit'

jest.mock('../../../services/auditService', () => ({
  __esModule: true,
  default: {
    getAuditLogs: jest.fn(),
    searchLogs: jest.fn(),
  },
}))

const auditService = require('../../../services/auditService').default

function buildStore() {
  return configureStore({ reducer: { audit: auditReducer } })
}

describe('auditSlice — fetchAuditLogs', () => {
  it('sets logs on fulfilled', async () => {
    const logs = [{ id: 1, action: 'LOGIN', user: 'admin' }]
    auditService.getAuditLogs.mockResolvedValueOnce(logs)
    const store = buildStore()
    await store.dispatch(fetchAuditLogs({}))
    expect(selectLogs(store.getState())).toEqual(logs)
  })

  it('sets loading true while pending', () => {
    auditService.getAuditLogs.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchAuditLogs({}))
    expect(selectLoading(store.getState())).toBe(true)
  })
})

describe('auditSlice — searchAuditLogs', () => {
  it('sets searchResults on fulfilled', async () => {
    const results = [{ id: 2, action: 'DELETE' }]
    auditService.searchLogs.mockResolvedValueOnce(results)
    const store = buildStore()
    await store.dispatch(searchAuditLogs({ query: 'delete' }))
    expect(selectSearchResults(store.getState())).toEqual(results)
  })
})

describe('auditSlice — clearError', () => {
  it('resets error to null', () => {
    const store = configureStore({
      reducer: { audit: auditReducer },
      preloadedState: {
        audit: { logs: [], searchResults: [], complianceReport: null, summary: {}, loading: false, error: 'server error', filters: {} },
      },
    })
    store.dispatch(clearError())
    expect(selectError(store.getState())).toBeNull()
  })
})
