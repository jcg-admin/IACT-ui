import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer from '@store/slices/error'
import ContextErrorBanner from '../ContextErrorBanner'

function buildStore(byContext = {}) {
  return configureStore({
    reducer: { error: errorReducer },
    preloadedState: {
      error: {
        global: null,
        byContext,
        requestErrors: [],
        isHandling: false,
      },
    },
  })
}

function renderBanner(context, store) {
  return render(
    <Provider store={store}>
      <ContextErrorBanner context={context} />
    </Provider>
  )
}

// ── Renders nothing when no error ─────────────────────────────────────────────

describe('ContextErrorBanner — no error', () => {
  it('renders nothing when byContext is empty', () => {
    const { container } = renderBanner('admin', buildStore())
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for a different context', () => {
    const store = buildStore({ reports: { message: 'oops', statusCode: 500, code: 'ERR' } })
    const { container } = renderBanner('admin', store)
    expect(container.firstChild).toBeNull()
  })
})

// ── 500 server error shows fixed message ─────────────────────────────────────

describe('ContextErrorBanner — 500 server error', () => {
  it('shows fixed server error message for 500', () => {
    const store = buildStore({
      admin: { message: 'Internal Server Error', statusCode: 500, code: 'SERVER_ERROR' },
    })
    renderBanner('admin', store)
    expect(screen.getByText('Error del servidor. Por favor intenta nuevamente.')).toBeInTheDocument()
  })

  it('does not expose raw server message for 500', () => {
    const store = buildStore({
      admin: { message: 'Traceback: NullPointerException', statusCode: 500, code: 'SERVER_ERROR' },
    })
    renderBanner('admin', store)
    expect(screen.queryByText(/Traceback/)).toBeNull()
  })

  it('shows fixed message for 503', () => {
    const store = buildStore({
      admin: { message: 'Service Unavailable', statusCode: 503, code: 'SERVICE_UNAVAILABLE' },
    })
    renderBanner('admin', store)
    expect(screen.getByText('Error del servidor. Por favor intenta nuevamente.')).toBeInTheDocument()
  })

  it('renders with role="alert"', () => {
    const store = buildStore({
      admin: { message: 'oops', statusCode: 500, code: 'SERVER_ERROR' },
    })
    renderBanner('admin', store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

// ── Network error shows no-connection message ─────────────────────────────────

describe('ContextErrorBanner — network error', () => {
  it('shows no-connection message when statusCode is 0', () => {
    const store = buildStore({
      reports: { message: 'Network Error', statusCode: 0, code: 'NETWORK_ERROR' },
    })
    renderBanner('reports', store)
    expect(screen.getByText('Sin conexión. Verifica tu conexión a internet.')).toBeInTheDocument()
  })

  it('shows no-connection message when statusCode is null', () => {
    const store = buildStore({
      logs: { message: 'fetch failed', statusCode: null, code: 'NETWORK_ERROR' },
    })
    renderBanner('logs', store)
    expect(screen.getByText('Sin conexión. Verifica tu conexión a internet.')).toBeInTheDocument()
  })
})

// ── Non-500 passes contextError.message through ───────────────────────────────

describe('ContextErrorBanner — 4xx passthrough', () => {
  it('shows contextError.message for 403', () => {
    const store = buildStore({
      access: { message: 'No tienes permiso para esta acción', statusCode: 403, code: 'FORBIDDEN' },
    })
    renderBanner('access', store)
    expect(screen.getByText('No tienes permiso para esta acción')).toBeInTheDocument()
  })
})

// ── Works for any context prop ────────────────────────────────────────────────

describe('ContextErrorBanner — generic context', () => {
  it('renders banner for "reports" context', () => {
    const store = buildStore({
      reports: { message: 'report error', statusCode: 500, code: 'ERR' },
    })
    renderBanner('reports', store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders banner for "alerts" context', () => {
    const store = buildStore({
      alerts: { message: 'alerts error', statusCode: 500, code: 'ERR' },
    })
    renderBanner('alerts', store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

// ── Close button ──────────────────────────────────────────────────────────────

describe('ContextErrorBanner — dismiss', () => {
  it('has a close button with aria-label', () => {
    const store = buildStore({
      admin: { message: 'oops', statusCode: 500, code: 'ERR' },
    })
    renderBanner('admin', store)
    expect(screen.getByLabelText('Cerrar error')).toBeInTheDocument()
  })

  it('dispatches clearContextError on close click', () => {
    const store = buildStore({
      admin: { message: 'oops', statusCode: 500, code: 'ERR' },
    })
    renderBanner('admin', store)
    fireEvent.click(screen.getByLabelText('Cerrar error'))
    expect(store.getState().error.byContext.admin).toBeUndefined()
  })

  it('only clears its own context, not others', () => {
    const store = buildStore({
      admin: { message: 'admin err', statusCode: 500, code: 'ERR' },
      reports: { message: 'report err', statusCode: 500, code: 'ERR' },
    })
    renderBanner('admin', store)
    fireEvent.click(screen.getByLabelText('Cerrar error'))
    expect(store.getState().error.byContext.admin).toBeUndefined()
    expect(store.getState().error.byContext.reports).toBeDefined()
  })
})
