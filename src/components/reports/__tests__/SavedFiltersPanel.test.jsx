import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SavedFiltersPanel from '../SavedFiltersPanel'

const FILTERS = [
  { id: 1, name: 'Semana pasada', filters: { dateFrom: '2026-04-28', dateTo: '2026-05-04' } },
  { id: 2, name: 'Este mes', filters: { dateFrom: '2026-05-01', dateTo: '2026-05-31' } },
]

const FILTERS_WITH_DEFAULT = [
  { id: 1, name: 'Semana pasada', filters: { dateFrom: '2026-04-28', dateTo: '2026-05-04' }, is_default: true },
  { id: 2, name: 'Este mes', filters: { dateFrom: '2026-05-01', dateTo: '2026-05-31' }, is_default: false },
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
  setDefaultFilter: jest.fn((id) => ({ type: 'savedFilters/setDefaultFilter', payload: id })),
  selectSavedFilters: (s) => s.savedFilters.filters,
  selectSavedFiltersLoading: (s) => s.savedFilters.loading,
}))

describe('SavedFiltersPanel', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    window.confirm = jest.fn().mockReturnValue(true)
  })

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

  describe('auto-apply default filter (UC_RPT_09 FA-04)', () => {
    beforeEach(() => {
      jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
        selector({ savedFilters: { filters: FILTERS_WITH_DEFAULT, loading: false, error: null } })
      )
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('calls onApply once with default filter filters on first data load', () => {
      const onApply = jest.fn()
      render(<SavedFiltersPanel onApply={onApply} />)
      expect(onApply).toHaveBeenCalledTimes(1)
      expect(onApply).toHaveBeenCalledWith(FILTERS_WITH_DEFAULT[0].filters)
    })

    it('does not call onApply when no filter has is_default true', () => {
      jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
        selector({ savedFilters: { filters: FILTERS, loading: false, error: null } })
      )
      const onApply = jest.fn()
      render(<SavedFiltersPanel onApply={onApply} />)
      expect(onApply).not.toHaveBeenCalled()
    })

    it('does not re-fire auto-apply when store updates after initial load', () => {
      const onApply = jest.fn()
      const { rerender } = render(<SavedFiltersPanel onApply={onApply} />)
      expect(onApply).toHaveBeenCalledTimes(1)
      rerender(<SavedFiltersPanel onApply={onApply} />)
      expect(onApply).toHaveBeenCalledTimes(1) // ref guard prevents second call
    })
  })
})
