import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'

jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      button: ({ children, onClick, disabled, type, ...rest }) => (
        <button onClick={onClick} disabled={disabled} type={type}>{children}</button>
      ),
      div: ({ children, ...rest }) => <div>{children}</div>,
      p: ({ children, ...rest }) => <p>{children}</p>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  }
})

jest.mock('@components/animations', () => ({
  AnimatedButton: ({ children, onClick, disabled, type }) => (
    <button onClick={onClick} disabled={disabled} type={type}>{children}</button>
  ),
  AnimatedLoadingSpinner: ({ message }) => <div>{message || 'loading'}</div>,
}))

jest.mock('@components/presentational/MetricsGrid', () => ({
  __esModule: true,
  default: () => <div data-testid="metrics-grid" />,
}))

jest.mock('@components/presentational/ChartsSection', () => ({
  __esModule: true,
  default: () => <div data-testid="charts-section" />,
}))

jest.mock('@components/presentational/LoginForm', () => ({
  __esModule: true,
  default: ({ onSubmit, loading, error }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email: 'a', password: 'b' }) }}>
      {error && <div>{error}</div>}
      <button type="submit" disabled={loading}>Login</button>
    </form>
  ),
}))

jest.mock('@components/presentational/DashboardHeader', () => ({
  __esModule: true,
  default: ({ user, onLogout }) => (
    <div>
      <span>{user?.first_name}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('@redux/selectors', () => ({
  selectUser: (s) => s.auth?.user,
  selectAuthLoading: (s) => s.auth?.loading ?? false,
  selectAuthError: (s) => s.auth?.error ?? null,
}))

jest.mock('@redux/slices/authSlice', () => ({
  loginUser: jest.fn(() => ({ type: 'auth/loginUser', unwrap: () => Promise.resolve({}) })),
  logout: jest.fn(() => ({ type: 'auth/logout' })),
  setUser: jest.fn(() => ({ type: 'auth/setUser' })),
}))

jest.mock('@redux/slices/reportsSlice', () => ({
  __esModule: true,
  fetchDashboardMetrics: jest.fn(() => ({ type: 'reports/fetchDashboardMetrics/pending' })),
  selectMetrics: (s) => s.reports?.metrics ?? null,
  selectReportsLoading: (s) => s.reports?.loading ?? false,
}))

function buildStore(auth = {}, reports = {}) {
  return configureStore({
    reducer: {
      auth: (state = { user: null, loading: false, error: null, ...auth }) => state,
      reports: (state = { loading: false, metrics: null, ...reports }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(<Provider store={store}><MemoryRouter>{ui}</MemoryRouter></Provider>)
}

describe('LoginPage', () => {
  let LoginPage
  beforeAll(() => {
    LoginPage = require('../LoginPage').default
  })

  it('renders IACT Dashboard heading', () => {
    wrap(<LoginPage />)
    expect(screen.getByText('IACT Dashboard')).toBeInTheDocument()
  })

  it('renders demo credentials', () => {
    wrap(<LoginPage />)
    expect(screen.getByText('Demo credentials:')).toBeInTheDocument()
  })
})

describe('Settings', () => {
  let Settings
  beforeAll(() => {
    Settings = require('../Settings').default
  })

  it('renders Configuracion heading', () => {
    wrap(<Settings />)
    expect(screen.getByText('Configuracion')).toBeInTheDocument()
  })

  it('shows General tab by default', () => {
    wrap(<Settings />)
    expect(screen.getByText('Configuracion General')).toBeInTheDocument()
  })

  it('switches to Security tab', () => {
    wrap(<Settings />)
    fireEvent.click(screen.getByText('Seguridad'))
    expect(screen.queryByText('Configuracion General')).not.toBeInTheDocument()
  })
})

describe('Profile', () => {
  let Profile
  beforeAll(() => {
    Profile = require('../Profile').default
  })

  it('renders Mi Perfil heading', () => {
    const store = buildStore({ user: { first_name: 'Ana', last_name: 'Torres', email: 'a@a.com' } })
    wrap(<Profile />, store)
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
  })

  it('shows user name', () => {
    const store = buildStore({ user: { first_name: 'Ana', last_name: 'Torres', email: 'a@a.com' } })
    wrap(<Profile />, store)
    expect(screen.getAllByText(/Ana/i).length).toBeGreaterThan(0)
  })
})

describe('Dashboard', () => {
  let Dashboard
  beforeAll(() => {
    Dashboard = require('../Dashboard').default
  })

  it('renders Bienvenido when no user', () => {
    wrap(<Dashboard />)
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument()
  })

  it('renders user name when present', () => {
    const store = buildStore({ user: { first_name: 'Luis' } })
    wrap(<Dashboard />, store)
    expect(screen.getByText(/Luis/i)).toBeInTheDocument()
  })

  it('renders IVR KPI labels', () => {
    wrap(<Dashboard />)
    expect(screen.getByText('Total Llamadas')).toBeInTheDocument()
    expect(screen.getByText('Tasa de Abandono')).toBeInTheDocument()
  })
})

describe('DashboardPage', () => {
  let DashboardPage
  beforeAll(() => {
    DashboardPage = require('../DashboardPage').default
  })

  it('renders without crashing', () => {
    const { container } = wrap(<DashboardPage />)
    expect(container.firstChild).not.toBeNull()
  })
})
