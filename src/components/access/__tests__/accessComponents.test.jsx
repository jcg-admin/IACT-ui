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

  it('shows conflict count with HARD badge when severity undefined (default HARD)', () => {
    const conflicts = [{
      rule: 'SR-001',
      message: 'Cannot combine pipeline and audit',
      setA: ['PIP-001'],
      setB: ['AUD-001'],
    }]
    render(<SeparationRulesValidator conflicts={conflicts} />)
    expect(screen.getByText('Conflictos de Separación Detectados (1)')).toBeInTheDocument()
    expect(screen.getByText('HARD')).toBeInTheDocument()
  })

  it('shows HARD badge and blocking message for HARD conflict', () => {
    const conflicts = [{ rule: 'SR-001', severity: 'HARD', message: 'Hard conflict', setA: [], setB: [] }]
    render(<SeparationRulesValidator conflicts={conflicts} />)
    expect(screen.getByText('HARD')).toBeInTheDocument()
    expect(screen.getByText(/No se puede proceder con conflictos HARD/i)).toBeInTheDocument()
    expect(screen.queryByText(/Entendido, proceder/i)).not.toBeInTheDocument()
  })

  it('shows SOFT badge and proceed button for SOFT conflict', () => {
    const onProceedAnyway = jest.fn()
    const conflicts = [{ rule: 'SR-003', severity: 'SOFT', message: 'Soft conflict', setA: [], setB: [] }]
    render(<SeparationRulesValidator conflicts={conflicts} onProceedAnyway={onProceedAnyway} />)
    expect(screen.getByText('SOFT')).toBeInTheDocument()
    expect(screen.getByText(/Entendido, proceder/i)).toBeInTheDocument()
    expect(screen.queryByText(/No se puede proceder con conflictos HARD/i)).not.toBeInTheDocument()
  })

  it('calls onProceedAnyway when proceed button is clicked (all SOFT)', () => {
    const onProceedAnyway = jest.fn()
    const conflicts = [{ rule: 'SR-002', severity: 'SOFT', message: 'Soft', setA: [], setB: [] }]
    render(<SeparationRulesValidator conflicts={conflicts} onProceedAnyway={onProceedAnyway} />)
    fireEvent.click(screen.getByText(/Entendido, proceder/i))
    expect(onProceedAnyway).toHaveBeenCalledTimes(1)
  })

  it('shows HARD blocking (no proceed) when HARD and SOFT mix', () => {
    const onProceedAnyway = jest.fn()
    const conflicts = [
      { rule: 'SR-001', severity: 'HARD', message: 'Hard', setA: [], setB: [] },
      { rule: 'SR-002', severity: 'SOFT', message: 'Soft', setA: [], setB: [] },
    ]
    render(<SeparationRulesValidator conflicts={conflicts} onProceedAnyway={onProceedAnyway} />)
    expect(screen.getByText(/No se puede proceder con conflictos HARD/i)).toBeInTheDocument()
    expect(screen.queryByText(/Entendido, proceder/i)).not.toBeInTheDocument()
  })
})
