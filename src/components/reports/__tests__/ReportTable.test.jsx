import React from 'react'
import { render, screen } from '@testing-library/react'
import ReportTable from '../ReportTable'

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'value', label: 'Valor' },
]

const DATA = [
  { id: 1, name: 'Alpha', value: '100' },
  { id: 2, name: 'Beta', value: '200' },
]

describe('ReportTable', () => {
  it('renders column headers', () => {
    render(<ReportTable columns={COLUMNS} data={DATA} loading={false} />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Valor')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<ReportTable columns={COLUMNS} data={DATA} loading={false} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('renders loading spinner when loading', () => {
    const { container } = render(<ReportTable columns={COLUMNS} data={[]} loading={true} />)
    expect(container.querySelector('.spinner')).toBeInTheDocument()
  })

  it('renders default empty state when data is empty', () => {
    render(<ReportTable columns={COLUMNS} data={[]} loading={false} />)
    expect(screen.getByText(/no hay datos/i)).toBeInTheDocument()
  })

  it('renders custom emptyMessage', () => {
    render(<ReportTable columns={COLUMNS} data={[]} loading={false} emptyMessage="Sin registros" />)
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
  })

  it('supports custom render function per column', () => {
    const cols = [{ key: 'value', label: 'Val', render: (v) => `$${v}` }]
    render(<ReportTable columns={cols} data={[{ id: 1, value: 42 }]} loading={false} />)
    expect(screen.getByText('$42')).toBeInTheDocument()
  })
})
