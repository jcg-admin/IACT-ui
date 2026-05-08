import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'

jest.mock('@ui/animations', () => ({
  AnimatedLoadingSpinner: ({ message }) => <div>{message || 'loading'}</div>,
}))

jest.mock('@ui/presentational/LoginForm', () => ({
  __esModule: true,
  default: ({ onSubmit, loading, error }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email: 'a', password: 'b' }) }}>
      {error && <div>{error}</div>}
      <button type="submit" disabled={loading}>Login</button>
    </form>
  ),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockLoginUser = jest.fn(() => ({ type: 'auth/loginUser', unwrap: () => Promise.resolve({}) }))
jest.mock('@store/slices/auth', () => ({
  loginUser: (...args) => mockLoginUser(...args),
}))

jest.mock('@store/selectors', () => ({
  selectAuthLoading: (s) => s.auth?.loading ?? false,
  selectAuthError: (s) => s.auth?.error ?? null,
}))

function buildStore(auth = {}) {
  return configureStore({
    reducer: {
      auth: (state = { loading: false, error: null, ...auth }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(<Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>)
}

describe('Login', () => {
  let LoginPage
  beforeAll(() => {
    LoginPage = require('../Login').default
  })
  beforeEach(() => {
    mockNavigate.mockReset()
    mockLoginUser.mockImplementation(() => ({ type: 'auth/loginUser', unwrap: () => Promise.resolve({}) }))
  })

  it('renders IACT Dashboard heading', () => {
    wrap(<LoginPage />)
    expect(screen.getByText('IACT Dashboard')).toBeInTheDocument()
  })

  it('renders demo credentials', () => {
    wrap(<LoginPage />)
    expect(screen.getByText('Demo credentials:')).toBeInTheDocument()
  })

  it('navigates to /dashboard on successful login without next_step', async () => {
    wrap(<LoginPage />)
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('navigates to /change-password when next_step is change_password', async () => {
    mockLoginUser.mockImplementation(() => ({
      type: 'auth/loginUser',
      unwrap: () => Promise.resolve({ next_step: 'change_password', first_login: true }),
    }))
    wrap(<LoginPage />)
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/change-password'))
  })
})
