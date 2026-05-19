import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import SharedViews from '../SharedViews'

jest.mock('@store/slices/shares', () => ({
  fetchSharesSent: jest.fn(() => ({ type: 'shares/fetchSharesSent' })),
  fetchSharesReceived: jest.fn(() => ({ type: 'shares/fetchSharesReceived' })),
  revokeShare: jest.fn((id) => ({ type: 'shares/revokeShare', payload: id })),
  selectSharesSent: (s) => s.shares?.sent ?? [],
  selectSharesReceived: (s) => s.shares?.received ?? [],
  selectSharesLoading: (s) => s.shares?.loading ?? false,
  selectSharesError: (s) => s.shares?.error ?? null,
}))

const SENT_SHARES = [
  { id: 1, view_id: 10, owner_id: 1, target_type: 'user', target_id: 42, permission: 'read', expires_at: null, revoked_at: null, created_at: '2026-05-08T10:00:00Z' },
  { id: 2, view_id: 11, owner_id: 1, target_type: 'agr',  target_id: 5,  permission: 'clone', expires_at: null, revoked_at: '2026-05-07T09:00:00Z', created_at: '2026-05-06T10:00:00Z' },
]

const RECEIVED_SHARES = [
  { id: 3, view_id: 20, owner_id: 7, target_type: 'user', target_id: 1, permission: 'read', expires_at: null, revoked_at: null, created_at: '2026-05-08T08:00:00Z' },
]

function buildStore(shares = {}) {
  return configureStore({
    reducer: {
      shares: (state = {
        sent: [],
        received: [],
        loading: false,
        error: null,
        ...shares,
      }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

describe('SharedViews (uc-rpt-11)', () => {
  const { fetchSharesSent, fetchSharesReceived, revokeShare } = require('@store/slices/shares')

  beforeEach(() => {
    fetchSharesSent.mockClear()
    fetchSharesReceived.mockClear()
    revokeShare.mockClear()
  })

  it('renders page heading', () => {
    wrap(<SharedViews />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchSharesSent and fetchSharesReceived on mount', () => {
    wrap(<SharedViews />)
    expect(fetchSharesSent).toHaveBeenCalled()
    expect(fetchSharesReceived).toHaveBeenCalled()
  })

  it('shows empty state for sent tab when no shares sent', () => {
    wrap(<SharedViews />, buildStore({ sent: [] }))
    expect(screen.getByText(/no has compartido/i)).toBeInTheDocument()
  })

  it('renders sent shares in the table', () => {
    wrap(<SharedViews />, buildStore({ sent: SENT_SHARES }))
    expect(screen.getByText('Usuario 42')).toBeInTheDocument()
    expect(screen.getByText('Grupo 5')).toBeInTheDocument()
  })

  it('shows received shares when Recibidas tab is clicked', () => {
    wrap(<SharedViews />, buildStore({ sent: SENT_SHARES, received: RECEIVED_SHARES }))
    fireEvent.click(screen.getByRole('button', { name: /recibidas/i }))
    expect(screen.getByText('Usuario 7')).toBeInTheDocument()
  })

  it('dispatches revokeShare when Revocar is confirmed', () => {
    wrap(<SharedViews />, buildStore({ sent: SENT_SHARES }))
    fireEvent.click(screen.getByRole('button', { name: /revocar/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /revocar/i }))
    expect(revokeShare).toHaveBeenCalledWith(1)
  })

  it('does not dispatch revokeShare when Revocar is cancelled', () => {
    wrap(<SharedViews />, buildStore({ sent: SENT_SHARES }))
    fireEvent.click(screen.getByRole('button', { name: /revocar/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }))
    expect(revokeShare).not.toHaveBeenCalled()
  })
})
