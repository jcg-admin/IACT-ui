import { configureStore } from '@reduxjs/toolkit'
import logsReducer, {
  fetchLogs,
  fetchETLLogs,
  selectLogs,
  selectETLLogs,
  selectLogsLoading,
} from '../logs'

jest.mock('../../../services/logsGateway', () => ({
  __esModule: true,
  default: {
    getLogs: jest.fn(),
    getETLLogs: jest.fn(),
  },
}))

const logsService = require('../../../services/logsGateway').default

function buildStore() {
  return configureStore({ reducer: { logs: logsReducer } })
}

describe('logsSlice — fetchLogs', () => {
  it('sets logs on fulfilled', async () => {
    const logs = [{ id: 1, level: 'INFO', message: 'ok' }]
    logsService.getLogs.mockResolvedValueOnce(logs)
    const store = buildStore()
    await store.dispatch(fetchLogs({}))
    expect(selectLogs(store.getState())).toEqual(logs)
  })

  it('sets loading true while pending', () => {
    logsService.getLogs.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchLogs({}))
    expect(selectLogsLoading(store.getState())).toBe(true)
  })
})

describe('logsSlice — fetchETLLogs', () => {
  it('sets etlLogs on fulfilled', async () => {
    const etlLogs = [{ id: 2, status: 'success' }]
    logsService.getETLLogs.mockResolvedValueOnce(etlLogs)
    const store = buildStore()
    await store.dispatch(fetchETLLogs())
    expect(selectETLLogs(store.getState())).toEqual(etlLogs)
  })
})
