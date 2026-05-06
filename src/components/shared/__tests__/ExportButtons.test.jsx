import React from 'react'
import { render, screen } from '@testing-library/react'
import ExportButtons from '../ExportButtons'

jest.mock('@components/animations', () => ({
  AnimatedButton: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

jest.mock('@hooks/domain/useExport', () => ({
  useExport: () => ({
    handleExportExcel: jest.fn(),
    handleExportPDF: jest.fn(),
    handleExportCSV: jest.fn(),
    exporting: false,
  }),
}))

const DEFAULT_PROPS = {
  data: [{ id: 1, name: 'Alice' }],
  exportName: 'report',
  headers: ['ID', 'Name'],
  columns: ['id', 'name'],
}

describe('ExportButtons', () => {
  it('renders Excel, PDF, and CSV buttons by default', () => {
    render(<ExportButtons {...DEFAULT_PROPS} />)
    expect(screen.getByText(/Excel/i)).toBeInTheDocument()
    expect(screen.getByText(/PDF/i)).toBeInTheDocument()
    expect(screen.getByText(/CSV/i)).toBeInTheDocument()
  })

  it('hides Excel button when showExcel is false', () => {
    render(<ExportButtons {...DEFAULT_PROPS} showExcel={false} />)
    expect(screen.queryByText(/Excel/i)).not.toBeInTheDocument()
  })

  it('hides PDF button when showPDF is false', () => {
    render(<ExportButtons {...DEFAULT_PROPS} showPDF={false} />)
    expect(screen.queryByText(/PDF/i)).not.toBeInTheDocument()
  })

  it('hides CSV button when showCSV is false', () => {
    render(<ExportButtons {...DEFAULT_PROPS} showCSV={false} />)
    expect(screen.queryByText(/CSV/i)).not.toBeInTheDocument()
  })
})
