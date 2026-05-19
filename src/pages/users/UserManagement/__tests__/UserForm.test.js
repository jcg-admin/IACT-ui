/**
 * UserForm Tests — UC_USR_04 baja lógica + state enum
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserForm from '../UserForm'

const mockUser = {
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  access_groups: ['AGR-010'],
  state: 'ACTIVE',
}

describe('UserForm — modo creación', () => {
  it('muestra título "Crear Nuevo Usuario"', () => {
    render(<UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByText(/Crear Nuevo Usuario/i)).toBeInTheDocument()
  })

  it('muestra campos username, email y password', () => {
    render(<UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
  })

  it('no muestra botón "Dar de baja" en modo creación', () => {
    render(<UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.queryByText(/Dar de baja/i)).not.toBeInTheDocument()
  })

  it('llama onSubmit con datos válidos', async () => {
    const onSubmit = jest.fn()
    render(<UserForm user={null} onSubmit={onSubmit} onCancel={jest.fn()} onDeactivate={jest.fn()} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'New' } })
    fireEvent.change(screen.getByLabelText(/^apellido$/i), { target: { value: 'User' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'pass123' } })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByText(/Crear Usuario/i))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('llama onCancel al cancelar', () => {
    const onCancel = jest.fn()
    render(<UserForm user={null} onSubmit={jest.fn()} onCancel={onCancel} onDeactivate={jest.fn()} />)
    fireEvent.click(screen.getByText(/Cancelar/i))
    expect(onCancel).toHaveBeenCalled()
  })

  it('valida que contraseñas coincidan', async () => {
    render(<UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'u' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'pass123' } })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'other' } })
    fireEvent.click(screen.getByText(/Crear Usuario/i))
    await waitFor(() => expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument())
  })
})

describe('UserForm — modo edición', () => {
  it('muestra título "Editar Usuario"', () => {
    render(<UserForm user={mockUser} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByText(/Editar Usuario/i)).toBeInTheDocument()
  })

  it('muestra username pre-cargado', () => {
    render(<UserForm user={mockUser} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByDisplayValue('john_doe')).toBeInTheDocument()
  })

  it('selector estado tiene opciones ACTIVE, INACTIVE, BLOCKED', () => {
    render(<UserForm user={mockUser} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    const stateSelect = screen.getByLabelText(/Estado/i)
    const options = Array.from(stateSelect.options).map(o => o.value)
    expect(options).toContain('ACTIVE')
    expect(options).toContain('INACTIVE')
    expect(options).toContain('BLOCKED')
  })

  it('muestra botón "Dar de baja" cuando state !== ELIMINATED', () => {
    render(<UserForm user={{ ...mockUser, state: 'ACTIVE' }} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.getByText(/Dar de baja/i)).toBeInTheDocument()
  })

  it('oculta botón "Dar de baja" cuando state === ELIMINATED', () => {
    render(<UserForm user={{ ...mockUser, state: 'ELIMINATED' }} onSubmit={jest.fn()} onCancel={jest.fn()} onDeactivate={jest.fn()} />)
    expect(screen.queryByText(/Dar de baja/i)).not.toBeInTheDocument()
  })

  it('click en "Dar de baja" llama onDeactivate con user.id', () => {
    const onDeactivate = jest.fn()
    render(
      <UserForm
        user={{ ...mockUser, id: '99', state: 'ACTIVE' }}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        onDeactivate={onDeactivate}
      />
    )
    fireEvent.click(screen.getByText(/Dar de baja/i))
    expect(onDeactivate).toHaveBeenCalledWith('99')
  })
})
