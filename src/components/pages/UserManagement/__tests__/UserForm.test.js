/**
 * UserForm Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserForm from '../UserForm'

describe('UserForm Component', () => {
  it('should render form for creating user', () => {
    render(
      <UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    expect(screen.getByText('Create New User')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should render form for editing user', () => {
    const mockUser = {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'Admin',
      status: 'Active'
    }

    render(
      <UserForm user={mockUser} onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john_doe')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const mockOnSubmit = jest.fn()

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={jest.fn()} />
    )

    const submitButton = screen.getByText('Create User')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('should call onSubmit with valid data', async () => {
    const mockOnSubmit = jest.fn()

    render(
      <UserForm user={null} onSubmit={mockOnSubmit} onCancel={jest.fn()} />
    )

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'newuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@example.com' }
    })
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'New' }
    })
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    })

    const submitButton = screen.getByText('Create User')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('should call onCancel when cancel button clicked', () => {
    const mockOnCancel = jest.fn()

    render(
      <UserForm user={null} onSubmit={jest.fn()} onCancel={mockOnCancel} />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should validate password match', async () => {
    render(
      <UserForm user={null} onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'user' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different' }
    })

    const submitButton = screen.getByText('Create User')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })
})
