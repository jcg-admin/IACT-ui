import { configureStore } from '@reduxjs/toolkit'
import savedFiltersReducer, {
  fetchSavedFilters,
  saveFilter,
  deleteFilter,
  selectSavedFilters,
  selectSavedFiltersLoading,
} from '../savedFilters'

jest.mock('../../../services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const apiService = require('../../../services/apiService').default

function buildStore() {
  return configureStore({ reducer: { savedFilters: savedFiltersReducer } })
}

describe('savedFiltersSlice — fetchSavedFilters', () => {
  it('sets filters on fulfilled', async () => {
    const filters = [{ id: 1, name: 'Semana', filters: {} }]
    apiService.get.mockResolvedValueOnce(filters)
    const store = buildStore()
    await store.dispatch(fetchSavedFilters())
    expect(selectSavedFilters(store.getState())).toEqual(filters)
  })

  it('sets loading true while pending', () => {
    apiService.get.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchSavedFilters())
    expect(selectSavedFiltersLoading(store.getState())).toBe(true)
  })
})

describe('savedFiltersSlice — saveFilter', () => {
  it('adds new filter to state on fulfilled', async () => {
    const newFilter = { id: 2, name: 'Mes', filters: { dateFrom: '2026-05-01' } }
    apiService.post.mockResolvedValueOnce(newFilter)
    const store = buildStore()
    await store.dispatch(saveFilter({ name: 'Mes', filters: { dateFrom: '2026-05-01' } }))
    expect(selectSavedFilters(store.getState())).toContainEqual(newFilter)
  })
})

describe('savedFiltersSlice — deleteFilter', () => {
  it('removes filter from state on fulfilled', async () => {
    apiService.get.mockResolvedValueOnce([{ id: 1, name: 'Semana', filters: {} }])
    apiService.delete.mockResolvedValueOnce(undefined)
    const store = buildStore()
    await store.dispatch(fetchSavedFilters())
    await store.dispatch(deleteFilter(1))
    expect(selectSavedFilters(store.getState())).toHaveLength(0)
  })
})
