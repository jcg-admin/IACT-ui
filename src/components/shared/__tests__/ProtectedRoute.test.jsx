import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

jest.mock('@store/selectors', () => ({
  selectIsAuthenticated: (s) => s.auth.isAuthenticated,
}))

const mockUseSelector = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
}))

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    mockUseSelector.mockReturnValue(true)
    render(
      <MemoryRouter>
        <ProtectedRoute><p>protected content</p></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseSelector.mockReturnValue(false)
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute><p>protected content</p></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })
})
