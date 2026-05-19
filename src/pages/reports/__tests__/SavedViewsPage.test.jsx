import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import SavedViews from '../SavedViews'

jest.mock('@store/slices/reports', () => ({
  fetchSavedViews: jest.fn(() => ({ type: 'reports/fetchSavedViews' })),
  deleteSavedView: jest.fn((id) => ({ type: 'reports/deleteSavedView', payload: id })),
  selectSavedViews: (s) => s.reports?.savedViews ?? [],
  selectReportsLoading: (s) => s.reports?.loading ?? false,
  selectReportsError: (s) => s.reports?.error ?? null,
}))

const SAVED_VIEWS = [
  { id: 1, name: 'Vista semana actual', report_type: 'agents',  filters: { segmento: 'Nacional' }, created_at: '2026-01-15T10:00:00Z' },
  { id: 2, name: 'Exportación mensual',  report_type: 'queues',  filters: { trimestre: 'Q01_25' }, created_at: '2026-02-01T08:30:00Z' },
]

function buildStore(reports = {}) {
  return configureStore({
    reducer: {
      reports: (state = {
        savedViews: [],
        loading: false,
        error: null,
        ...reports,
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

describe('SavedViews', () => {
  const { fetchSavedViews, deleteSavedView } = require('@store/slices/reports')

  beforeEach(() => {
    fetchSavedViews.mockClear()
    deleteSavedView.mockClear()
  })

  it('renders page heading', () => {
    wrap(<SavedViews />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchSavedViews on mount', () => {
    wrap(<SavedViews />)
    expect(fetchSavedViews).toHaveBeenCalled()
  })

  it('shows empty state when no saved views', () => {
    wrap(<SavedViews />, buildStore({ savedViews: [] }))
    expect(screen.getByText(/no hay vistas guardadas/i)).toBeInTheDocument()
  })

  it('renders saved view list when views exist', () => {
    wrap(<SavedViews />, buildStore({ savedViews: SAVED_VIEWS }))
    expect(screen.getByText('Vista semana actual')).toBeInTheDocument()
    expect(screen.getByText('Exportación mensual')).toBeInTheDocument()
  })

  it('shows loading spinner while loading', () => {
    wrap(<SavedViews />, buildStore({ loading: true }))
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('dispatches deleteSavedView when delete is confirmed', () => {
    wrap(<SavedViews />, buildStore({ savedViews: SAVED_VIEWS }))
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /eliminar/i }))
    expect(deleteSavedView).toHaveBeenCalledWith(1)
  })

  it('does not dispatch deleteSavedView when delete is cancelled', () => {
    wrap(<SavedViews />, buildStore({ savedViews: SAVED_VIEWS }))
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }))
    expect(deleteSavedView).not.toHaveBeenCalled()
  })
})
