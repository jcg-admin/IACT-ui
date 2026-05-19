import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import errorReducer from '@store/slices/error'
import { GlobalErrorToast, ErrorBanner, ErrorHistoryViewer } from '../ErrorDisplay'

function buildStore(errorState) {
  return configureStore({
    reducer: { error: errorReducer },
    preloadedState: { error: { global: errorState, byContext: {}, requestErrors: [], isHandling: false } },
  })
}

function wrap(ui, store) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('GlobalErrorToast', () => {
  it('renders nothing when no global error', () => {
    const { container } = wrap(<GlobalErrorToast />, buildStore(null))
    expect(container.firstChild).toBeNull()
  })

  it('renders something when global error is set', () => {
    const error = { code: 'SERVER_ERROR', message: 'Internal error', statusCode: 500 }
    const { container } = wrap(<GlobalErrorToast />, buildStore(error))
    expect(container.firstChild).not.toBeNull()
  })
})

describe('ErrorBanner', () => {
  it('renders nothing when no global error', () => {
    const { container } = wrap(<ErrorBanner />, buildStore(null))
    expect(container.firstChild).toBeNull()
  })
})

describe('ErrorHistoryViewer', () => {
  it('renders with empty history', () => {
    wrap(<ErrorHistoryViewer />, buildStore(null))
    // Should render without crashing
  })
})
