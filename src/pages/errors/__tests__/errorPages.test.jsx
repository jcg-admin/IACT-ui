import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer from '@redux/slices/errorSlice'
import NotFoundPage from '../NotFoundPage'
import AccessDeniedPage from '../AccessDeniedPage'
import ServerErrorPage from '../ServerErrorPage'
import ServiceUnavailablePage from '../ServiceUnavailablePage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@utils/navigation', () => ({
  reloadPage: jest.fn(),
}))

function buildStore(global = null) {
  return configureStore({
    reducer: { error: errorReducer },
    preloadedState: { error: { global, byContext: {}, requestErrors: [], isHandling: false } },
  })
}

function wrapper(ui, store = buildStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  mockNavigate.mockClear()
})

// ── NotFoundPage (404) ────────────────────────────────────────────────────────

describe('NotFoundPage', () => {
  it('displays 404 code', () => {
    wrapper(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows friendly title', () => {
    wrapper(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })

  it('navigates to / when "Volver al inicio" is clicked', () => {
    wrapper(<NotFoundPage />)
    fireEvent.click(screen.getByRole('button', { name: /volver al inicio/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

// ── AccessDeniedPage (403) ────────────────────────────────────────────────────

describe('AccessDeniedPage', () => {
  it('displays 403 code', () => {
    wrapper(<AccessDeniedPage />)
    expect(screen.getByText('403')).toBeInTheDocument()
  })

  it('shows "Acceso denegado" heading', () => {
    wrapper(<AccessDeniedPage />)
    expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
  })

  it('has a Volver button that calls navigate(-1)', () => {
    wrapper(<AccessDeniedPage />)
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('has a support contact link', () => {
    wrapper(<AccessDeniedPage />)
    const link = screen.getByRole('link', { name: /contactar soporte/i })
    expect(link.href).toContain('mailto:')
  })
})

// ── ServerErrorPage (500) ─────────────────────────────────────────────────────

describe('ServerErrorPage', () => {
  it('displays 500 code', () => {
    wrapper(<ServerErrorPage />)
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('shows "Error interno" heading', () => {
    wrapper(<ServerErrorPage />)
    expect(screen.getByRole('heading', { name: /error interno del servidor/i })).toBeInTheDocument()
  })

  it('has a reload button that calls reloadPage', () => {
    const { reloadPage } = require('@utils/navigation')
    wrapper(<ServerErrorPage />)
    fireEvent.click(screen.getByRole('button', { name: /recargar página/i }))
    expect(reloadPage).toHaveBeenCalled()
  })
})

// ── ServiceUnavailablePage (503) ──────────────────────────────────────────────

describe('ServiceUnavailablePage', () => {
  it('displays 503 code', () => {
    wrapper(<ServiceUnavailablePage />)
    expect(screen.getByText('503')).toBeInTheDocument()
  })

  it('shows maintenance heading', () => {
    wrapper(<ServiceUnavailablePage />)
    expect(screen.getByRole('heading', { name: /servicio en mantenimiento/i })).toBeInTheDocument()
  })

  it('shows retryAfter seconds when available in Redux state', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'down', statusCode: 503, retryAfter: 120 })
    wrapper(<ServiceUnavailablePage />, store)
    expect(screen.getByText(/120 segundos/)).toBeInTheDocument()
  })

  it('shows generic retry message when retryAfter is null', () => {
    wrapper(<ServiceUnavailablePage />)
    expect(screen.getByText(/unos minutos/i)).toBeInTheDocument()
  })

  it('has a Reintentar button', () => {
    wrapper(<ServiceUnavailablePage />)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
