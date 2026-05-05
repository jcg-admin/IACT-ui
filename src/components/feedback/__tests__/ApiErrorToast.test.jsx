import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer, { setGlobalError, clearGlobalError } from '@redux/slices/errorSlice'
import ApiErrorToast from '../ApiErrorToast'

jest.useFakeTimers()

function buildStore(errorState = {}) {
  return configureStore({
    reducer: { error: errorReducer },
    preloadedState: {
      error: {
        global: null,
        byContext: {},
        requestErrors: [],
        isHandling: false,
        ...errorState,
      },
    },
  })
}

function renderToast(store) {
  return render(
    <Provider store={store}>
      <ApiErrorToast />
    </Provider>
  )
}

// ── Renders nothing when no error ─────────────────────────────────────────────

describe('ApiErrorToast — no error', () => {
  it('renders nothing when global error is null', () => {
    const store = buildStore()
    const { container } = renderToast(store)
    expect(container.firstChild).toBeNull()
  })
})

// ── Renders for general errors ────────────────────────────────────────────────

describe('ApiErrorToast — error display', () => {
  it('shows error message for a 500 error', () => {
    const store = buildStore({
      global: { code: 'INTERNAL_SERVER_ERROR', message: 'Server error', statusCode: 500, retryAfter: null },
    })
    renderToast(store)
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('uses danger severity class for 500', () => {
    const store = buildStore({
      global: { code: 'INTERNAL_SERVER_ERROR', message: 'Server error', statusCode: 500, retryAfter: null },
    })
    const { container } = renderToast(store)
    expect(container.querySelector('.api-error-toast--danger')).toBeInTheDocument()
  })

  it('uses warning severity class for 429', () => {
    const store = buildStore({
      global: { code: 'RATE_LIMIT', message: 'Too many requests', statusCode: 429, retryAfter: 30 },
    })
    const { container } = renderToast(store)
    expect(container.querySelector('.api-error-toast--warning')).toBeInTheDocument()
  })

  it('shows severity label in bold', () => {
    const store = buildStore({
      global: { code: 'INTERNAL_SERVER_ERROR', message: 'oops', statusCode: 500, retryAfter: null },
    })
    renderToast(store)
    expect(screen.getByText(/Error:/)).toBeInTheDocument()
  })
})

// ── Does NOT render for persistent 502/503 ────────────────────────────────────

describe('ApiErrorToast — persistent errors excluded', () => {
  it('renders nothing for 503 (handled by ServerErrorBanner)', () => {
    const store = buildStore({
      global: { code: 'SERVICE_UNAVAILABLE', message: 'Maintenance', statusCode: 503, retryAfter: null },
    })
    const { container } = renderToast(store)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for 502', () => {
    const store = buildStore({
      global: { code: 'BAD_GATEWAY', message: 'Bad gateway', statusCode: 502, retryAfter: null },
    })
    const { container } = renderToast(store)
    expect(container.firstChild).toBeNull()
  })
})

// ── Close button ──────────────────────────────────────────────────────────────

describe('ApiErrorToast — dismiss', () => {
  it('dispatches clearGlobalError when close button is clicked', () => {
    const store = buildStore({
      global: { code: 'NOT_FOUND', message: 'Not found', statusCode: 404, retryAfter: null },
    })
    renderToast(store)
    fireEvent.click(screen.getByLabelText('Cerrar'))
    expect(store.getState().error.global).toBeNull()
  })
})

// ── Auto-close ────────────────────────────────────────────────────────────────

describe('ApiErrorToast — auto-close', () => {
  it('clears error after 6 seconds', () => {
    const store = buildStore({
      global: { code: 'NOT_FOUND', message: 'Not found', statusCode: 404, retryAfter: null },
    })
    renderToast(store)
    expect(store.getState().error.global).not.toBeNull()

    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(store.getState().error.global).toBeNull()
  })
})

// ── 429 countdown ─────────────────────────────────────────────────────────────

describe('ApiErrorToast — rate-limit countdown', () => {
  it('shows initial retryAfter seconds', () => {
    const store = buildStore({
      global: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again in 30 seconds.', statusCode: 429, retryAfter: 30 },
    })
    renderToast(store)
    expect(screen.getByText(/Reintentar en 30s/)).toBeInTheDocument()
  })

  it('decrements countdown each second', () => {
    const store = buildStore({
      global: { code: 'RATE_LIMIT', message: 'rate limit', statusCode: 429, retryAfter: 5 },
    })
    renderToast(store)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText(/Reintentar en 4s/)).toBeInTheDocument()
  })
})

// ── Retry button ──────────────────────────────────────────────────────────────

describe('ApiErrorToast — retry button', () => {
  it('shows Reintentar button for retryable errors without active countdown', () => {
    // retryAfter: 0 means retryable but no countdown
    const store = buildStore({
      global: { code: 'REQUEST_TIMEOUT', message: 'Timeout', statusCode: 408, retryAfter: 0 },
    })
    renderToast(store)
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('does NOT show Reintentar for non-retryable errors', () => {
    const store = buildStore({
      global: { code: 'NOT_FOUND', message: 'Not found', statusCode: 404, retryAfter: null },
    })
    renderToast(store)
    expect(screen.queryByText('Reintentar')).toBeNull()
  })
})
