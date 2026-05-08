import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ReportExport from '../ReportExport'

jest.mock('../../../services/reportsService', () => ({
  __esModule: true,
  default: {
    exportReport: jest.fn().mockResolvedValue({ job_id: 'job-abc-123' }),
  },
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('ReportExport — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('ReportExport — selectores de tipo y formato (uc-rpt-04)', () => {
  it('renderiza selector de tipo de reporte', () => {
    wrapper(<ReportExport />)
    expect(screen.getByLabelText(/tipo.*reporte|reporte.*tipo/i)).toBeInTheDocument()
  })

  it('renderiza selector de formato', () => {
    wrapper(<ReportExport />)
    expect(screen.getByLabelText(/formato/i)).toBeInTheDocument()
  })

  it('selector tipo tiene opción agents', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /agents|agentes/i })).toBeInTheDocument()
  })

  it('selector tipo tiene opción queues', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /queues|colas/i })).toBeInTheDocument()
  })

  it('selector tipo tiene opción campaigns', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /campaigns|campañas/i })).toBeInTheDocument()
  })

  it('selector tipo tiene opción dashboard', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('selector formato tiene opción CSV', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /csv/i })).toBeInTheDocument()
  })

  it('selector formato tiene opción XLSX', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /xlsx|excel/i })).toBeInTheDocument()
  })

  it('selector formato tiene opción JSON', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('option', { name: /json/i })).toBeInTheDocument()
  })
})

describe('ReportExport — botón de exportar', () => {
  it('renders botón Exportar', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
  })

  it('llama exportReport al hacer click y muestra job_id', async () => {
    const svc = jest.requireMock('../../../services/reportsService').default
    svc.exportReport.mockResolvedValueOnce({ job_id: 'job-test-456' })
    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    expect(await screen.findByText(/job-test-456/i)).toBeInTheDocument()
  })
})
