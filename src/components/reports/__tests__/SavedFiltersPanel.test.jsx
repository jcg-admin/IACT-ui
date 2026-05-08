import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SavedFiltersPanel from '../SavedFiltersPanel'

const FILTERS = [
  { id: 1, name: 'Semana pasada', filters: { dateFrom: '2026-04-28', dateTo: '2026-05-04' } },
  { id: 2, name: 'Este mes', filters: { dateFrom: '2026-05-01', dateTo: '2026-05-31' } },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ savedFilters: { filters: FILTERS, loading: false, error: null } }),
}))

jest.mock('../../../redux/slices/savedFilters', () => ({
  fetchSavedFilters: () => ({ type: 'savedFilters/fetchSavedFilters' }),
  deleteFilter: jest.fn((id) => ({ type: 'savedFilters/deleteFilter', payload: id })),
  selectSavedFilters: (s) => s.savedFilters.filters,
  selectSavedFiltersLoading: (s) => s.savedFilters.loading,
}))

describe('SavedFiltersPanel', () => {
  beforeEach(() => { mockDispatch.mockClear(); window.confirm = jest.fn().mockReturnValue(true) })

  it('renders saved filter names', () => {
    render(<SavedFiltersPanel onApply={() => {}} />)
    expect(screen.getByText('Semana pasada')).toBeInTheDocument()
    expect(screen.getByText('Este mes')).toBeInTheDocument()
  })

  it('calls onApply with filter values when filter name clicked', () => {
    const onApply = jest.fn()
    render(<SavedFiltersPanel onApply={onApply} />)
    fireEvent.click(screen.getByText('Semana pasada'))
    expect(onApply).toHaveBeenCalledWith(FILTERS[0].filters)
  })

  it('dispatches deleteFilter after confirmation', () => {
    render(<SavedFiltersPanel onApply={() => {}} />)
    const deleteButtons = screen.getAllByText('✕')
    fireEvent.click(deleteButtons[0])
    expect(mockDispatch).toHaveBeenCalledTimes(2) // fetchSavedFilters + deleteFilter
  })

  it('returns null when no saved filters', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ savedFilters: { filters: [], loading: false } })
    )
    const { container } = render(<SavedFiltersPanel onApply={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('dispatches fetchSavedFilters on mount', () => {
    render(<SavedFiltersPanel onApply={() => {}} />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})
