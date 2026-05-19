import { configureStore } from '@reduxjs/toolkit'
import sessionReducer, {
  setSessionId,
  createTx,
  clearSession,
  setAlerts,
  startJob,
  completeJob,
  selectSessionId,
  selectIsSessionActive,
  selectAlerts,
  selectAllJobs,
} from '../session'

function buildStore() {
  return configureStore({ reducer: { session: sessionReducer } })
}

describe('sessionSlice — initial state', () => {
  it('starts with no session', () => {
    const store = buildStore()
    expect(selectSessionId(store.getState())).toBeNull()
    expect(selectIsSessionActive(store.getState())).toBe(false)
  })
})

describe('sessionSlice — setSessionId', () => {
  it('stores the session id', () => {
    const store = buildStore()
    store.dispatch(setSessionId({ sessionId: 'sess-abc-123', expiresAt: null }))
    expect(selectSessionId(store.getState())).toBe('sess-abc-123')
  })
})

describe('sessionSlice — clearSession', () => {
  it('resets session id to null', () => {
    const store = buildStore()
    store.dispatch(setSessionId({ sessionId: 'sess-abc-123', expiresAt: null }))
    store.dispatch(clearSession())
    expect(selectSessionId(store.getState())).toBeNull()
  })
})

describe('sessionSlice — alerts', () => {
  it('setAlerts populates alerts array', () => {
    const store = buildStore()
    const alerts = [{ id: 1, message: 'CPU high', severity: 'warning' }]
    store.dispatch(setAlerts(alerts))
    expect(selectAlerts(store.getState())).toEqual(alerts)
  })
})

describe('sessionSlice — jobs', () => {
  it('startJob registers a job', () => {
    const store = buildStore()
    store.dispatch(startJob({ jobId: 'j1', type: 'export', data: {} }))
    const jobs = selectAllJobs(store.getState())
    expect(jobs).toHaveLength(1)
    expect(jobs[0].id).toBe('j1')
  })

  it('completeJob marks job as completed', () => {
    const store = buildStore()
    store.dispatch(startJob({ jobId: 'j1', type: 'export', data: {} }))
    store.dispatch(completeJob({ jobId: 'j1', result: { url: '/file.csv' } }))
    const jobs = selectAllJobs(store.getState())
    expect(jobs[0].status).toBe('completed')
  })
})
