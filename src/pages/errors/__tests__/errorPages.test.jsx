import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer from '@redux/slices/errorSlice'
import NotFound from '../NotFound'
import AccessDenied from '../AccessDenied'
import ServerError from '../ServerError'
import ServiceUnavailable from '../ServiceUnavailable'

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

// ── NotFound (404) ────────────────────────────────────────────────────────

describe('NotFound', () => {
  it('displays 404 code', () => {
    wrapper(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows friendly title', () => {
    wrapper(<NotFound />)
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })

  it('navigates to / when "Volver al inicio" is clicked', () => {
    wrapper(<NotFound />)
    fireEvent.click(screen.getByRole('button', { name: /volver al inicio/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

// ── AccessDenied (403) ────────────────────────────────────────────────────

describe('AccessDenied', () => {
  it('displays 403 code', () => {
    wrapper(<AccessDenied />)
    expect(screen.getByText('403')).toBeInTheDocument()
  })

  it('shows "Acceso denegado" heading', () => {
    wrapper(<AccessDenied />)
    expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
  })

  it('has a Volver button that calls navigate(-1)', () => {
    wrapper(<AccessDenied />)
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('has a support contact link', () => {
    wrapper(<AccessDenied />)
    const link = screen.getByRole('link', { name: /contactar soporte/i })
    expect(link.href).toContain('mailto:')
  })
})

// ── ServerError (500) ─────────────────────────────────────────────────────

describe('ServerError', () => {
  it('displays 500 code', () => {
    wrapper(<ServerError />)
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('shows "Error interno" heading', () => {
    wrapper(<ServerError />)
    expect(screen.getByRole('heading', { name: /error interno del servidor/i })).toBeInTheDocument()
  })

  it('has a reload button that calls reloadPage', () => {
    const { reloadPage } = require('@utils/navigation')
    wrapper(<ServerError />)
    fireEvent.click(screen.getByRole('button', { name: /recargar página/i }))
    expect(reloadPage).toHaveBeenCalled()
  })
})

// ── ServiceUnavailable (503) ──────────────────────────────────────────────

describe('ServiceUnavailable', () => {
  it('displays 503 code', () => {
    wrapper(<ServiceUnavailable />)
    expect(screen.getByText('503')).toBeInTheDocument()
  })

  it('shows maintenance heading', () => {
    wrapper(<ServiceUnavailable />)
    expect(screen.getByRole('heading', { name: /servicio en mantenimiento/i })).toBeInTheDocument()
  })

  it('shows retryAfter seconds when available in Redux state', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'down', statusCode: 503, retryAfter: 120 })
    wrapper(<ServiceUnavailable />, store)
    expect(screen.getByText(/120 segundos/)).toBeInTheDocument()
  })

  it('shows generic retry message when retryAfter is null', () => {
    wrapper(<ServiceUnavailable />)
    expect(screen.getByText(/unos minutos/i)).toBeInTheDocument()
  })

  it('has a Reintentar button', () => {
    wrapper(<ServiceUnavailable />)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
