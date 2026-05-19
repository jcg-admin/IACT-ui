import { configureStore } from '@reduxjs/toolkit'
import formReducer, {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  setFilter,
  resetFilters,
  resetForm,
  selectDateStart,
  selectDateEnd,
} from '../form'

function buildStore() {
  return configureStore({ reducer: { form: formReducer } })
}

describe('formSlice', () => {
  it('starts with all fields null', () => {
    const store = buildStore()
    expect(selectDateStart(store.getState())).toBeNull()
    expect(selectDateEnd(store.getState())).toBeNull()
  })

  it('setDateStart updates dateStart', () => {
    const store = buildStore()
    store.dispatch(setDateStart('2026-01-01'))
    expect(selectDateStart(store.getState())).toBe('2026-01-01')
  })

  it('setDateEnd updates dateEnd', () => {
    const store = buildStore()
    store.dispatch(setDateEnd('2026-12-31'))
    expect(selectDateEnd(store.getState())).toBe('2026-12-31')
  })

  it('setSelectedAction updates selectedAction', () => {
    const store = buildStore()
    store.dispatch(setSelectedAction('LOGIN'))
    expect(store.getState().form.selectedAction).toBe('LOGIN')
  })

  it('setFilter merges into filters object', () => {
    const store = buildStore()
    store.dispatch(setFilter({ name: 'status', value: 'active' }))
    expect(store.getState().form.filters.status).toBe('active')
  })

  it('resetFilters clears filter-related fields', () => {
    const store = buildStore()
    store.dispatch(setDateStart('2026-01-01'))
    store.dispatch(resetFilters())
    expect(selectDateStart(store.getState())).toBeNull()
  })

  it('resetForm returns to initial state', () => {
    const store = buildStore()
    store.dispatch(setDateStart('2026-01-01'))
    store.dispatch(setSelectedAction('LOGIN'))
    store.dispatch(resetForm())
    expect(selectDateStart(store.getState())).toBeNull()
    expect(store.getState().form.selectedAction).toBeNull()
  })
})
