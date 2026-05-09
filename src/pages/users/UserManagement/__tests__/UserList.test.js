/**
 * UserList Tests — UC-USR-04 baja lógica
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserList from '../UserList'

jest.mock('../../../../facades/UserIdentity', () => ({
  __esModule: true,
  default: { can: jest.fn().mockReturnValue(true) },
}))

const buildUser = (overrides = {}) => ({
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  access_groups: ['AGR-010'],
  state: 'ACTIVE',
  created_at: '2024-01-15T10:30:00Z',
  ...overrides,
})

const mockUsers = [
  buildUser({ id: '1', username: 'john_doe', state: 'ACTIVE' }),
  buildUser({ id: '2', username: 'jane_smith', state: 'INACTIVE' }),
]

const defaultProps = {
  users: mockUsers,
  loading: false,
  onEdit: jest.fn(),
  onDeactivate: jest.fn(),
  onBlock: jest.fn(),
  onUnblock: jest.fn(),
}

describe('UserList — renderizado básico', () => {
  it('muestra usuarios en tabla', () => {
    render(<UserList {...defaultProps} />)
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
  })

  it('muestra estado de carga', () => {
    render(<UserList users={[]} loading={true} onEdit={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument()
  })

  it('muestra estado vacío', () => {
    render(<UserList users={[]} loading={false} onEdit={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByText(/No se encontraron usuarios/i)).toBeInTheDocument()
  })
})

describe('UserList — badges de estado (UC-USR-01)', () => {
  it('badge ACTIVE tiene clase badge-primary', () => {
    const { container } = render(
      <UserList {...defaultProps} users={[buildUser({ state: 'ACTIVE' })]} />
    )
    expect(container.querySelector('.badge-primary')).toBeInTheDocument()
  })

  it('badge INACTIVE tiene clase badge-secondary', () => {
    const { container } = render(
      <UserList {...defaultProps} users={[buildUser({ state: 'INACTIVE' })]} />
    )
    expect(container.querySelector('.badge-secondary')).toBeInTheDocument()
  })

  it('badge BLOCKED tiene clase badge-warning', () => {
    const { container } = render(
      <UserList {...defaultProps} users={[buildUser({ state: 'BLOCKED' })]} />
    )
    expect(container.querySelector('.badge-warning')).toBeInTheDocument()
  })

  it('badge ELIMINATED tiene clase badge-danger', () => {
    const { container } = render(
      <UserList {...defaultProps} users={[buildUser({ state: 'ELIMINATED' })]} />
    )
    expect(container.querySelector('.badge-danger')).toBeInTheDocument()
  })
})

describe('UserList — baja lógica (UC-USR-04)', () => {
  it('botón "Dar de baja" visible para usuario ACTIVE', () => {
    render(<UserList {...defaultProps} users={[buildUser({ state: 'ACTIVE' })]} />)
    expect(screen.getByTitle('Dar de baja')).toBeInTheDocument()
  })

  it('botón "Dar de baja" oculto para usuario ELIMINATED', () => {
    render(<UserList {...defaultProps} users={[buildUser({ state: 'ELIMINATED' })]} />)
    expect(screen.queryByTitle('Dar de baja')).not.toBeInTheDocument()
  })

  it('click en "Dar de baja" llama onDeactivate con user.id', () => {
    const onDeactivate = jest.fn()
    render(
      <UserList
        users={[buildUser({ id: '42', state: 'ACTIVE' })]}
        loading={false}
        onEdit={jest.fn()}
        onDeactivate={onDeactivate}
      />
    )
    fireEvent.click(screen.getByTitle('Dar de baja'))
    expect(onDeactivate).toHaveBeenCalledWith('42')
  })

  it('no tiene botón "Eliminar" (baja lógica, no eliminación física)', () => {
    render(<UserList {...defaultProps} />)
    expect(screen.queryByTitle('Delete user')).not.toBeInTheDocument()
  })
})
