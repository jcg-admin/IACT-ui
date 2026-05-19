import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLErrors from '../ETLErrors'

const mockDispatch = jest.fn()

const ERRORS_DATA = [
  {
    id: 1,
    pipeline_name: 'etl-ivr-nacional',
    trimestre: 'Q1_26',
    started_at: '2026-05-08T04:00:00Z',
    finished_at: '2026-05-08T04:12:00Z',
    error_message: 'Pipeline timed out after 720s',
    error_type: 'TIMEOUT',
    correlation_id: 'corr-001',
  },
  {
    id: 2,
    pipeline_name: 'etl-ivr-puebla',
    trimestre: 'Q1_26',
    started_at: '2026-05-08T02:00:00Z',
    finished_at: '2026-05-08T02:06:00Z',
    error_message: 'Validation failed: campo negativo',
    error_type: 'DATA_VALIDATION',
    correlation_id: 'corr-002',
  },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { pipelineErrors: ERRORS_DATA, loading: false, error: null } }),
}))

jest.mock('@store/slices/logs', () => ({
  fetchPipelineErrors: jest.fn((params) => ({ type: 'logs/fetchPipelineErrors', params })),
  selectPipelineErrors: (s) => s.logs.pipelineErrors,
  selectLogsLoading: (s) => s.logs.loading ?? false,
  selectLogsError: (s) => s.logs.error ?? null,
}))

jest.mock('@ui/DateTimeInputs/SelectDropdown', () =>
  function MockSelectDropdown({ label, onChange, value, placeholder }) {
    return (
      <div>
        {label && <label>{label}</label>}
        <select
          data-testid="error-type-select"
          value={value?.value ?? ''}
          onChange={(e) => onChange(e.target.value ? { value: e.target.value, label: e.target.value } : null)}
        >
          <option value="">{placeholder}</option>
          <option value="TIMEOUT">TIMEOUT</option>
          <option value="DATA_VALIDATION">DATA_VALIDATION</option>
        </select>
      </div>
    )
  }
)

import { fetchPipelineErrors } from '@store/slices/logs'

function wrap() {
  return render(<MemoryRouter><ETLErrors /></MemoryRouter>)
}

describe('ETLErrors — UC_PIP_02', () => {
  beforeEach(() => { mockDispatch.mockClear(); fetchPipelineErrors.mockClear() })

  it('renders page title', () => {
    wrap()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/errores del pipeline/i)
  })

  it('dispatches fetchPipelineErrors on mount', () => {
    wrap()
    expect(fetchPipelineErrors).toHaveBeenCalledWith()
  })

  it('renders pipeline_name column', () => {
    wrap()
    expect(screen.getByText('etl-ivr-nacional')).toBeInTheDocument()
    expect(screen.getByText('etl-ivr-puebla')).toBeInTheDocument()
  })

  it('renders error_type badges', () => {
    wrap()
    const timeoutEls = screen.getAllByText('TIMEOUT')
    expect(timeoutEls.some((el) => el.classList.contains('badge'))).toBe(true)
    const dvEls = screen.getAllByText('DATA_VALIDATION')
    expect(dvEls.some((el) => el.classList.contains('badge'))).toBe(true)
  })

  it('renders error_message', () => {
    wrap()
    expect(screen.getByText(/timed out/i)).toBeInTheDocument()
    expect(screen.getByText(/validation failed/i)).toBeInTheDocument()
  })

  it('renders correlation_id', () => {
    wrap()
    expect(screen.getByText('corr-001')).toBeInTheDocument()
    expect(screen.getByText('corr-002')).toBeInTheDocument()
  })

  it('shows empty state when no errors', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { pipelineErrors: [], loading: false, error: null } })
    )
    wrap()
    expect(screen.getByText(/no hay errores de pipeline/i)).toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('dispatches fetchPipelineErrors with error_type filter on Aplicar', () => {
    wrap()
    fireEvent.change(screen.getByTestId('error-type-select'), { target: { value: 'TIMEOUT' } })
    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }))
    expect(fetchPipelineErrors).toHaveBeenCalledWith(expect.objectContaining({ error_type: 'TIMEOUT' }))
  })

  it('dispatches fetchPipelineErrors without params on Limpiar', () => {
    wrap()
    fireEvent.change(screen.getByTestId('error-type-select'), { target: { value: 'TIMEOUT' } })
    fireEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(fetchPipelineErrors).toHaveBeenLastCalledWith()
  })
})
