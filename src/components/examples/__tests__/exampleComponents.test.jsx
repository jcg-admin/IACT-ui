import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserList from '../UserList'
import UserProfile from '../UserProfile'

jest.mock('@hooks/domain/useRequest', () => ({
  __esModule: true,
  default: jest.fn((url, opts) => ({
    data: opts?.method === 'GET' && url === '/api/users'
      ? { items: [{ id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin', createdAt: '2024-01-01' }], total: 1 }
      : { name: 'Alice', role: 'admin', posts: 3, followers: 10 },
    loading: false,
    error: null,
    execute: jest.fn(),
  })),
}))

describe('UserList', () => {
  it('renders Usuarios heading', () => {
    render(<UserList />)
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
  })

  it('renders user row', () => {
    render(<UserList />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })
})

describe('UserProfile', () => {
  it('renders user name', () => {
    render(<UserProfile userId={1} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows Editar Perfil button when not in edit mode', () => {
    render(<UserProfile userId={1} />)
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
  })
})
