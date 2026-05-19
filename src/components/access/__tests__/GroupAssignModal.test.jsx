import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GroupAssignModal from '../GroupAssignModal'

const GROUPS = [
  { id: 1, name: 'Auditores', code: 'AUD' },
  { id: 2, name: 'Operadores', code: 'OPR' },
]

const defaultProps = {
  isOpen: true,
  mode: 'assign',
  groups: GROUPS,
  onConfirm: jest.fn(),
  onClose: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('GroupAssignModal — assign mode (uc-perm-01)', () => {
  it('renders modal with assign title', () => {
    render(<GroupAssignModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /asignar grupo/i })).toBeInTheDocument()
  })

  it('renders group list', () => {
    render(<GroupAssignModal {...defaultProps} />)
    expect(screen.getByText('Auditores')).toBeInTheDocument()
    expect(screen.getByText('Operadores')).toBeInTheDocument()
  })

  it('calls onConfirm with selected groupId when confirmed', () => {
    render(<GroupAssignModal {...defaultProps} />)
    fireEvent.click(screen.getByLabelText(/Auditores/i))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(1)
  })

  it('calls onClose when cancel is clicked', () => {
    render(<GroupAssignModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('does not call onConfirm when no group is selected', () => {
    render(<GroupAssignModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })
})

describe('GroupAssignModal — revoke mode (uc-perm-02)', () => {
  it('renders modal with revoke title', () => {
    render(<GroupAssignModal {...defaultProps} mode="revoke" />)
    expect(screen.getByRole('heading', { name: /revocar grupo/i })).toBeInTheDocument()
  })

  it('calls onConfirm with selected groupId in revoke mode', () => {
    render(<GroupAssignModal {...defaultProps} mode="revoke" />)
    fireEvent.click(screen.getByLabelText(/Operadores/i))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(2)
  })
})

describe('GroupAssignModal — closed state', () => {
  it('renders nothing when isOpen=false', () => {
    render(<GroupAssignModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('heading', { name: /asignar grupo/i })).not.toBeInTheDocument()
  })
})
