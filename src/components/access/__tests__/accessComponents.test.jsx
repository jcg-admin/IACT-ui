import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PermissionsTable from '../PermissionsTable'
import SeparationRulesValidator from '../SeparationRulesValidator'

const PERM = {
  assignment_id: 'asgn-1',
  code: 'PIP-001',
  name: 'Execute Pipeline',
  description: 'Run ETL pipelines',
  category: 'PIPELINE',
  assigned_at: '2024-01-01T00:00:00Z',
  expires_at: null,
}

describe('PermissionsTable', () => {
  it('shows empty message when no permissions', () => {
    render(<PermissionsTable permissions={[]} />)
    expect(screen.getByText('No hay permisos para mostrar')).toBeInTheDocument()
  })

  it('renders a permission row', () => {
    render(<PermissionsTable permissions={[PERM]} />)
    expect(screen.getByText('Execute Pipeline')).toBeInTheDocument()
    expect(screen.getByText('PIP-001')).toBeInTheDocument()
  })

  it('shows stats when showStats=true (default)', () => {
    render(<PermissionsTable permissions={[PERM]} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Permanentes')).toBeInTheDocument()
  })

  it('hides stats when showStats=false', () => {
    render(<PermissionsTable permissions={[PERM]} showStats={false} />)
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })

  it('calls onRevoke when Revocar is clicked', () => {
    const onRevoke = jest.fn()
    render(<PermissionsTable permissions={[PERM]} onRevoke={onRevoke} />)
    fireEvent.click(screen.getByText('Revocar'))
    expect(onRevoke).toHaveBeenCalledWith('asgn-1')
  })

  it('shows PERMANENTE for non-expiring permission', () => {
    render(<PermissionsTable permissions={[PERM]} />)
    expect(screen.getByText('PERMANENTE')).toBeInTheDocument()
  })
})

describe('SeparationRulesValidator', () => {
  it('shows "Estado: Válido" when no conflicts', () => {
    render(<SeparationRulesValidator conflicts={[]} />)
    expect(screen.getByText('Estado: Válido')).toBeInTheDocument()
  })

  it('shows conflict count when conflicts exist', () => {
    const conflicts = [{
      rule: 'SR-001',
      message: 'Cannot combine pipeline and audit',
      setA: ['PIP-001'],
      setB: ['AUD-001'],
    }]
    render(<SeparationRulesValidator conflicts={conflicts} />)
    expect(screen.getByText('Conflictos de Separación Detectados (1)')).toBeInTheDocument()
    expect(screen.getByText('INCOMPATIBLE')).toBeInTheDocument()
  })
})
