import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ReportExport from '../ReportExport'

jest.mock('../../../services/reportsGateway', () => ({
  __esModule: true,
  default: {
    exportReport: jest.fn().mockResolvedValue({ job_id: 'job-abc-123' }),
    getExportJobStatus: jest.fn().mockResolvedValue({ status: 'queued', progress: 0, file_url: null, error: null }),
    cancelExportJob: jest.fn().mockResolvedValue({ status: 'cancelled' }),
  },
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

let svc
beforeEach(() => {
  svc = jest.requireMock('../../../services/reportsGateway').default
  svc.exportReport.mockResolvedValue({ job_id: 'job-abc-123' })
  svc.getExportJobStatus.mockResolvedValue({ status: 'queued', progress: 0, file_url: null, error: null })
  svc.cancelExportJob.mockResolvedValue({ status: 'cancelled' })
})

describe('ReportExport — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<ReportExport />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('ReportExport — selectores de tipo y formato (uc-rpt-04)', () => {
  it('renderiza formulario con selects de tipo y formato', () => {
    wrapper(<ReportExport />)
    expect(screen.getByLabelText(/tipo.*reporte|reporte.*tipo/i)).toBeInTheDocument()
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

  it('submit POST → muestra job_id y estado "En cola"', async () => {
    jest.useFakeTimers()
    svc.exportReport.mockResolvedValueOnce({ job_id: 'job-test-456' })
    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    await waitFor(() => {
      expect(screen.getByText(/job-test-456/)).toBeInTheDocument()
    })
    expect(screen.getByText(/en cola/i)).toBeInTheDocument()
    jest.useRealTimers()
  })
})

describe('ReportExport — polling y estados del job', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('poll detecta done → muestra botón Descargar archivo', async () => {
    svc.exportReport.mockResolvedValueOnce({ job_id: 'job-done-789' })
    svc.getExportJobStatus.mockResolvedValue({
      status: 'done',
      progress: 100,
      file_url: 'https://storage.example.com/exports/job-done-789.csv',
      error: null,
    })

    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))

    await waitFor(() => expect(screen.getByText(/job-done-789/)).toBeInTheDocument())

    await act(async () => {
      jest.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /descargar archivo/i })).toBeInTheDocument()
    })
    expect(svc.getExportJobStatus).toHaveBeenCalledWith('job-done-789')
  })

  it('poll detecta failed → muestra mensaje de fallo', async () => {
    svc.exportReport.mockResolvedValueOnce({ job_id: 'job-fail-111' })
    svc.getExportJobStatus.mockResolvedValue({
      status: 'failed',
      progress: 0,
      file_url: null,
      error: 'Export failed',
    })

    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))

    await waitFor(() => expect(screen.getByText(/job-fail-111/)).toBeInTheDocument())

    await act(async () => {
      jest.advanceTimersByTime(3100)
    })

    await waitFor(() => {
      expect(screen.getByText(/exportación falló/i)).toBeInTheDocument()
    })
  })

  it('botón cancelar visible cuando status=queued; click llama cancelExportJob', async () => {
    svc.exportReport.mockResolvedValueOnce({ job_id: 'job-cancel-222' })
    svc.getExportJobStatus.mockResolvedValue({
      status: 'queued', progress: 0, file_url: null, error: null,
    })

    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))

    await waitFor(() => expect(screen.getByText(/job-cancel-222/)).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /cancelar exportación/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancelar exportación/i }))
    expect(svc.cancelExportJob).toHaveBeenCalledWith('job-cancel-222')
  })
})

describe('ReportExport — errores específicos', () => {
  it('ROW_LIMIT_EXCEEDED → mensaje descriptivo', async () => {
    svc.exportReport.mockRejectedValueOnce({
      code: 'ROW_LIMIT_EXCEEDED',
      message: 'El reporte supera el límite de filas exportables',
    })
    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    await waitFor(() => {
      expect(screen.getByText(/supera el límite de filas/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/aplique filtros/i)).toBeInTheDocument()
  })

  it('EXPORT_LIMIT_EXCEEDED → mensaje descriptivo', async () => {
    svc.exportReport.mockRejectedValueOnce({
      code: 'EXPORT_LIMIT_EXCEEDED',
      message: 'Ya tiene exports activos en cola',
    })
    wrapper(<ReportExport />)
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    await waitFor(() => {
      expect(screen.getByText(/exports activos en cola/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/espere a que finalicen/i)).toBeInTheDocument()
  })
})
