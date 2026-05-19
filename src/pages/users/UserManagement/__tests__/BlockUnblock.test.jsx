import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserList from '../UserList'

const ACTIVE_USER = {
  id: 1,
  username: 'ana',
  email: 'ana@example.com',
  first_name: 'Ana',
  last_name: 'Gomez',
  state: 'ACTIVE',
  access_groups: [],
  created_at: '2026-01-01T00:00:00Z',
}

const BLOCKED_USER = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  first_name: 'Bob',
  last_name: 'Smith',
  state: 'BLOCKED',
  access_groups: [],
  created_at: '2026-01-01T00:00:00Z',
}

jest.mock('../../../../facades/UserIdentity', () => ({
  __esModule: true,
  default: { can: jest.fn(() => true) },
}))

jest.mock('../UserList.scss', () => ({}), { virtual: true })

const mockOnBlock = jest.fn()
const mockOnUnblock = jest.fn()
const mockOnEdit = jest.fn()
const mockOnDeactivate = jest.fn()

function renderList(users) {
  return render(
    <UserList
      users={users}
      loading={false}
      onEdit={mockOnEdit}
      onDeactivate={mockOnDeactivate}
      onBlock={mockOnBlock}
      onUnblock={mockOnUnblock}
    />
  )
}

describe('UserList — block/unblock (UC_USR_05/06)', () => {
  beforeEach(() => {
    mockOnBlock.mockClear()
    mockOnUnblock.mockClear()
  })

  it('shows Bloquear button for ACTIVE user', () => {
    renderList([ACTIVE_USER])
    expect(screen.getByRole('button', { name: /bloquear/i })).toBeInTheDocument()
  })

  it('does not show Desbloquear for ACTIVE user', () => {
    renderList([ACTIVE_USER])
    expect(screen.queryByRole('button', { name: /desbloquear/i })).not.toBeInTheDocument()
  })

  it('shows Desbloquear button for BLOCKED user', () => {
    renderList([BLOCKED_USER])
    expect(screen.getByRole('button', { name: /desbloquear/i })).toBeInTheDocument()
  })

  it('does not show Bloquear for BLOCKED user', () => {
    renderList([BLOCKED_USER])
    expect(screen.queryByRole('button', { name: 'Bloquear' })).not.toBeInTheDocument()
  })

  it('opens block modal with user name when Bloquear clicked', () => {
    renderList([ACTIVE_USER])
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/bloquear a/i)).toBeInTheDocument()
  })

  it('calls onBlock(userId) when confirming block modal', () => {
    renderList([ACTIVE_USER])
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear' }))
    const confirmBtns = screen.getAllByRole('button', { name: 'Bloquear' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(mockOnBlock).toHaveBeenCalledWith(1)
  })

  it('opens unblock modal with user name when Desbloquear clicked', () => {
    renderList([BLOCKED_USER])
    fireEvent.click(screen.getByRole('button', { name: /desbloquear/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/desbloquear a/i)).toBeInTheDocument()
  })

  it('calls onUnblock(userId) when confirming unblock modal', () => {
    renderList([BLOCKED_USER])
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }))
    const confirmBtns = screen.getAllByRole('button', { name: 'Desbloquear' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(mockOnUnblock).toHaveBeenCalledWith(2)
  })

  it('does not call onBlock/onUnblock when Cancelar clicked', () => {
    renderList([ACTIVE_USER])
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear' }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockOnBlock).not.toHaveBeenCalled()
  })
})
