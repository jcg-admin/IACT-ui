import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import PipelineStatusPage from '../PipelineStatusPage'

jest.mock('@redux/slices/logsSlice', () => ({
  fetchPipelineStatus: jest.fn(() => ({ type: 'logs/fetchPipelineStatus' })),
  selectPipelineStatus: (s) => s.logs?.pipelineStatus ?? null,
  selectLogsLoading: (s) => s.logs?.loading ?? false,
  selectLogsError: (s) => s.logs?.error ?? null,
}))

const MOCK_STATUS = {
  jobs: { running: 3, completed: 142, failed: 2 },
  sources: [
    { name: 'CRM', lag: '12 min', throughputRowsPerMin: 1840, bytesProcessed: 2400000, avgLatencyMs: 320 },
    { name: 'PBX', lag: '2 min', throughputRowsPerMin: 560, bytesProcessed: 890000, avgLatencyMs: 110 },
  ],
  updatedAt: '2026-05-06T06:00:00Z',
}

function buildStore(logs = {}) {
  return configureStore({
    reducer: {
      logs: (state = { pipelineStatus: null, loading: false, error: null, ...logs }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('PipelineStatusPage', () => {
  it('renderiza el título', () => {
    wrap(<PipelineStatusPage />)
    expect(screen.getByRole('heading', { name: /estado del pipeline/i })).toBeInTheDocument()
  })

  it('despacha fetchPipelineStatus al montar', () => {
    const { fetchPipelineStatus } = require('@redux/slices/logsSlice')
    wrap(<PipelineStatusPage />)
    expect(fetchPipelineStatus).toHaveBeenCalled()
  })

  it('muestra jobs running, completed, failed', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatusPage />, store)
    expect(screen.getByText('3')).toBeInTheDocument()   // running
    expect(screen.getByText('142')).toBeInTheDocument() // completed
    expect(screen.getByText('2')).toBeInTheDocument()   // failed
  })

  it('muestra tabla de sources con lag y throughput', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatusPage />, store)
    expect(screen.getByText('CRM')).toBeInTheDocument()
    expect(screen.getByText('12 min')).toBeInTheDocument()
    expect(screen.getByText('1840')).toBeInTheDocument()
    expect(screen.getByText('PBX')).toBeInTheDocument()
  })

  it('muestra indicador de carga', () => {
    const store = buildStore({ loading: true })
    wrap(<PipelineStatusPage />, store)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error cuando existe', () => {
    const store = buildStore({ error: 'Error de red' })
    wrap(<PipelineStatusPage />, store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay datos', () => {
    wrap(<PipelineStatusPage />)
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument()
  })
})
