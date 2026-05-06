import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import SavedViewsPage from '../SavedViewsPage'

jest.mock('@redux/slices/reportsSlice', () => ({
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

describe('SavedViewsPage', () => {
  const { fetchSavedViews, deleteSavedView } = require('@redux/slices/reportsSlice')

  beforeEach(() => {
    fetchSavedViews.mockClear()
    deleteSavedView.mockClear()
  })

  it('renders page heading', () => {
    wrap(<SavedViewsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchSavedViews on mount', () => {
    wrap(<SavedViewsPage />)
    expect(fetchSavedViews).toHaveBeenCalled()
  })

  it('shows empty state when no saved views', () => {
    wrap(<SavedViewsPage />, buildStore({ savedViews: [] }))
    expect(screen.getByText(/no hay vistas guardadas/i)).toBeInTheDocument()
  })

  it('renders saved view list when views exist', () => {
    wrap(<SavedViewsPage />, buildStore({ savedViews: SAVED_VIEWS }))
    expect(screen.getByText('Vista semana actual')).toBeInTheDocument()
    expect(screen.getByText('Exportación mensual')).toBeInTheDocument()
  })

  it('shows loading spinner while loading', () => {
    wrap(<SavedViewsPage />, buildStore({ loading: true }))
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('dispatches deleteSavedView when delete is confirmed', () => {
    window.confirm = jest.fn(() => true)
    wrap(<SavedViewsPage />, buildStore({ savedViews: SAVED_VIEWS }))
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    expect(deleteSavedView).toHaveBeenCalledWith(1)
    window.confirm.mockRestore()
  })

  it('does not dispatch deleteSavedView when delete is cancelled', () => {
    window.confirm = jest.fn(() => false)
    wrap(<SavedViewsPage />, buildStore({ savedViews: SAVED_VIEWS }))
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    expect(deleteSavedView).not.toHaveBeenCalled()
    window.confirm.mockRestore()
  })
})
