/**
 * UserList Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserList from '../UserList'

const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'Admin',
    status: 'Active',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'User',
    status: 'Active',
    created_at: '2024-02-20T14:45:00Z'
  }
]

describe('UserList Component', () => {
  it('should render users in table', () => {
    render(
      <UserList
        users={mockUsers}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <UserList users={[]} loading={true} onEdit={jest.fn()} onDelete={jest.fn()} />
    )
    expect(screen.getByText('Loading users...')).toBeInTheDocument()
  })

  it('should show empty state', () => {
    render(
      <UserList users={[]} loading={false} onEdit={jest.fn()} onDelete={jest.fn()} />
    )
    expect(screen.getByText(/No users found/)).toBeInTheDocument()
  })

  it('should have action buttons', () => {
    render(
      <UserList
        users={mockUsers}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    const editButtons = screen.getAllByText('Edit')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('should render table with correct data', () => {
    const { container } = render(
      <UserList
        users={mockUsers}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    
    const table = container.querySelector('.users-table')
    expect(table).toBeInTheDocument()
  })
})
