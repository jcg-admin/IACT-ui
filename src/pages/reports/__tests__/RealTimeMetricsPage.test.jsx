import React from 'react'
import { render, screen } from '@testing-library/react'
import RealTimeMetricsPage from '../RealTimeMetricsPage'

jest.mock('@hooks/domain/useRealTimeMetrics', () => ({
  useRealTimeMetrics: jest.fn(),
}))

const { useRealTimeMetrics } = require('@hooks/domain/useRealTimeMetrics')

const MOCK_METRICS = {
  callsQueued: 12,
  agentsBusy: 8,
  agentsIdle: 4,
  callsAnsweredPerHour: 143,
  abandonRatePer5Min: 3.2,
  serviceLevelPer15Min: 87.5,
  lagSeconds: 5,
  updatedAt: '2026-05-06T06:00:00Z',
}

describe('RealTimeMetricsPage', () => {
  it('renderiza el título', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: null, loading: true, error: null })
    render(<RealTimeMetricsPage />)
    expect(screen.getByRole('heading', { name: /métricas en tiempo real/i })).toBeInTheDocument()
  })

  it('muestra indicador de carga', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: null, loading: true, error: null })
    render(<RealTimeMetricsPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra las 6 métricas cuando hay datos', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: MOCK_METRICS, loading: false, error: null })
    render(<RealTimeMetricsPage />)
    expect(screen.getByText('12')).toBeInTheDocument()  // callsQueued
    expect(screen.getByText('8')).toBeInTheDocument()   // agentsBusy
    expect(screen.getByText('4')).toBeInTheDocument()   // agentsIdle
    expect(screen.getByText('143')).toBeInTheDocument() // callsAnsweredPerHour
    expect(screen.getByText(/87\.5/)).toBeInTheDocument() // serviceLevelPer15Min
  })

  it('muestra indicador de lag', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: MOCK_METRICS, loading: false, error: null })
    render(<RealTimeMetricsPage />)
    expect(screen.getByText(/5\s*s/i)).toBeInTheDocument()
  })

  it('muestra error cuando existe', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: null, loading: false, error: 'timeout' })
    render(<RealTimeMetricsPage />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/timeout/i)).toBeInTheDocument()
  })

  it('muestra indicador de actualización automática', () => {
    useRealTimeMetrics.mockReturnValue({ metrics: MOCK_METRICS, loading: false, error: null })
    render(<RealTimeMetricsPage />)
    expect(screen.getAllByText(/actualiz/i).length).toBeGreaterThan(0)
  })
})
