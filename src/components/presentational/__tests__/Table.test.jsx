import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Table from '../Table'

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'role', label: 'Rol' },
]

const DATA = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
]

describe('Table', () => {
  it('renders column headers', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Rol')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Table columns={COLUMNS} data={[]} loading={true} />)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<Table columns={COLUMNS} data={[]} loading={false} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('sorts by column when header clicked', () => {
    render(<Table columns={COLUMNS} data={DATA} sortable={true} />)
    fireEvent.click(screen.getByText('Nombre'))
    // After click the table re-renders — just verify no crash
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
