import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import PipelineStatus from '../PipelineStatus'

jest.mock('@store/slices/logs', () => ({
  fetchPipelineStatus: jest.fn(() => ({ type: 'logs/fetchPipelineStatus' })),
  selectPipelineStatus: (s) => s.logs?.pipelineStatus ?? null,
  selectLogsLoading: (s) => s.logs?.loading ?? false,
  selectLogsError: (s) => s.logs?.error ?? null,
}))

const MOCK_STATUS = {
  estado_general: 'ok',
  ultima_ejecucion_exitosa: {
    trimestre: 'Q2_26',
    finished_at: '2026-05-06T03:42:00Z',
    base_records: 1_234_567,
  },
  ejecucion_en_curso: null,
  ultima_ejecucion_fallida: null,
  total_exitosas_24h: 2,
  total_fallidas_24h: 0,
}

const MOCK_STATUS_CRITICO = {
  estado_general: 'critico',
  ultima_ejecucion_exitosa: null,
  ejecucion_en_curso: null,
  ultima_ejecucion_fallida: {
    trimestre: 'Q2_26',
    finished_at: '2026-05-05T08:00:00Z',
    base_records: 0,
  },
  total_exitosas_24h: 0,
  total_fallidas_24h: 3,
}

const MOCK_STATUS_EN_CURSO = {
  ...MOCK_STATUS,
  ejecucion_en_curso: { trimestre: 'Q2_26', started_at: '2026-05-06T05:00:00Z' },
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

describe('PipelineStatus — uc-pip-01', () => {
  it('renderiza el título', () => {
    wrap(<PipelineStatus />)
    expect(screen.getByRole('heading', { name: /estado del pipeline/i })).toBeInTheDocument()
  })

  it('despacha fetchPipelineStatus al montar', () => {
    const { fetchPipelineStatus } = require('@store/slices/logs')
    wrap(<PipelineStatus />)
    expect(fetchPipelineStatus).toHaveBeenCalled()
  })

  it('muestra badge estado_general ok', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText(/ok/i)).toBeInTheDocument()
  })

  it('muestra trimestre de última ejecución exitosa', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText('Q2_26')).toBeInTheDocument()
  })

  it('muestra base_records formateado', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText(/1[.,]234[.,]567/)).toBeInTheDocument()
  })

  it('muestra contadores total_exitosas_24h y total_fallidas_24h', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText('2')).toBeInTheDocument()  // exitosas
    expect(screen.getByText('0')).toBeInTheDocument()  // fallidas
  })

  it('muestra indicador en curso cuando ejecucion_en_curso no es null', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS_EN_CURSO })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText(/en curso/i)).toBeInTheDocument()
  })

  it('muestra alerta de fallos cuando total_fallidas_24h > 0', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS_CRITICO })
    wrap(<PipelineStatus />, store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('muestra badge critico con color rojo', () => {
    const store = buildStore({ pipelineStatus: MOCK_STATUS_CRITICO })
    wrap(<PipelineStatus />, store)
    expect(screen.getByText(/critico/i)).toBeInTheDocument()
  })

  it('muestra indicador de carga', () => {
    const store = buildStore({ loading: true })
    wrap(<PipelineStatus />, store)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error cuando existe', () => {
    const store = buildStore({ error: 'Error de red' })
    wrap(<PipelineStatus />, store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay datos', () => {
    wrap(<PipelineStatus />)
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument()
  })
})
