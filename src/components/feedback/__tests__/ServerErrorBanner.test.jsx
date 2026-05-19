import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer from '@store/slices/error'
import ServerErrorBanner from '../ServerErrorBanner'

function buildStore(global = null) {
  return configureStore({
    reducer: { error: errorReducer },
    preloadedState: { error: { global, byContext: {}, requestErrors: [], isHandling: false } },
  })
}

function renderBanner(store) {
  return render(
    <Provider store={store}>
      <ServerErrorBanner />
    </Provider>
  )
}

// ── Renders nothing when no error ─────────────────────────────────────────────

describe('ServerErrorBanner — no error', () => {
  it('renders nothing when global is null', () => {
    const { container } = renderBanner(buildStore(null))
    expect(container.firstChild).toBeNull()
  })
})

// ── Only shows for 502 / 503 ──────────────────────────────────────────────────

describe('ServerErrorBanner — visibility', () => {
  it('renders for 503 Service Unavailable', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'Mantenimiento', statusCode: 503, retryAfter: null })
    renderBanner(store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
  })

  it('renders for 502 Bad Gateway', () => {
    const store = buildStore({ code: 'BAD_GATEWAY', message: 'Gateway down', statusCode: 502, retryAfter: null })
    renderBanner(store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does NOT render for 500 (handled by ApiErrorToast)', () => {
    const store = buildStore({ code: 'INTERNAL_SERVER_ERROR', message: 'Server error', statusCode: 500, retryAfter: null })
    const { container } = renderBanner(store)
    expect(container.firstChild).toBeNull()
  })

  it('does NOT render for 404', () => {
    const store = buildStore({ code: 'NOT_FOUND', message: 'Not found', statusCode: 404, retryAfter: null })
    const { container } = renderBanner(store)
    expect(container.firstChild).toBeNull()
  })
})

// ── Label ─────────────────────────────────────────────────────────────────────

describe('ServerErrorBanner — label', () => {
  it('shows maintenance label for 503', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'down', statusCode: 503, retryAfter: null })
    renderBanner(store)
    expect(screen.getByText(/Servicio en mantenimiento:/)).toBeInTheDocument()
  })

  it('shows unavailable label for 502', () => {
    const store = buildStore({ code: 'BAD_GATEWAY', message: 'down', statusCode: 502, retryAfter: null })
    renderBanner(store)
    expect(screen.getByText(/Servicio no disponible:/)).toBeInTheDocument()
  })
})

// ── Manual dismiss ────────────────────────────────────────────────────────────

describe('ServerErrorBanner — dismiss', () => {
  it('hides after clicking the close button (local state)', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'down', statusCode: 503, retryAfter: null })
    renderBanner(store)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Cerrar'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('does NOT dispatch clearGlobalError — only hides locally', () => {
    const store = buildStore({ code: 'SERVICE_UNAVAILABLE', message: 'down', statusCode: 503, retryAfter: null })
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    renderBanner(store)
    fireEvent.click(screen.getByLabelText('Cerrar'))
    // Should not dispatch anything (banner is dismissed via local useState)
    expect(dispatchSpy).not.toHaveBeenCalled()
  })
})
