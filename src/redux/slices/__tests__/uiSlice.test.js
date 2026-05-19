import { configureStore } from '@reduxjs/toolkit'
import uiReducer, {
  toggleSidebar,
  closeSidebar,
  toggleDarkMode,
  addNotification,
  removeNotification,
} from '../ui'

function buildStore() {
  return configureStore({ reducer: { ui: uiReducer } })
}

describe('uiSlice', () => {
  it('starts with sidebar closed and dark mode off', () => {
    const store = buildStore()
    const { ui } = store.getState()
    expect(ui.isSidebarOpen).toBe(false)
    expect(ui.isDarkMode).toBe(false)
  })

  it('toggleSidebar flips isSidebarOpen', () => {
    const store = buildStore()
    store.dispatch(toggleSidebar())
    expect(store.getState().ui.isSidebarOpen).toBe(true)
    store.dispatch(toggleSidebar())
    expect(store.getState().ui.isSidebarOpen).toBe(false)
  })

  it('closeSidebar always sets isSidebarOpen to false', () => {
    const store = buildStore()
    store.dispatch(toggleSidebar())
    store.dispatch(closeSidebar())
    expect(store.getState().ui.isSidebarOpen).toBe(false)
  })

  it('toggleDarkMode flips isDarkMode', () => {
    const store = buildStore()
    store.dispatch(toggleDarkMode())
    expect(store.getState().ui.isDarkMode).toBe(true)
  })

  it('addNotification appends to notifications', () => {
    const store = buildStore()
    store.dispatch(addNotification({ id: '1', message: 'hello', type: 'info' }))
    expect(store.getState().ui.notifications).toHaveLength(1)
    expect(store.getState().ui.notifications[0].message).toBe('hello')
  })

  it('removeNotification removes by id', () => {
    const store = buildStore()
    store.dispatch(addNotification({ id: 'a', message: 'A' }))
    store.dispatch(addNotification({ id: 'b', message: 'B' }))
    store.dispatch(removeNotification('a'))
    const ids = store.getState().ui.notifications.map((n) => n.id)
    expect(ids).toEqual(['b'])
  })
})
