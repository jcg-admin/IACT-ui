/**
 * Tests para userSlice
 *
 * Cubre: estado inicial, thunks fetchUsers / createUser /
 * updateUser / deactivateUser, y selectores.
 */

import { configureStore } from '@reduxjs/toolkit'
import usersReducer, {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersTotal,
} from '../user'
import userService from '../../../services/userGateway'

jest.mock('../../../services/userGateway')

function buildStore(preloaded) {
  const config = { reducer: { user: usersReducer } }
  if (preloaded) config.preloadedState = { user: preloaded }
  return configureStore(config)
}

// ── Estado inicial ─────────────────────────────────────────────────────────

describe('userSlice — estado inicial', () => {
  it('tiene valores por defecto correctos', () => {
    const store = buildStore()
    const state = store.getState().user
    expect(state.users).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.total).toBe(0)
  })
})

// ── fetchUsers ─────────────────────────────────────────────────────────────

describe('fetchUsers thunk', () => {
  it('pone loading en true mientras está pendiente', () => {
    userService.getUsers.mockReturnValue(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchUsers())
    expect(selectUsersLoading(store.getState())).toBe(true)
  })

  it('puebla users desde respuesta paginada y pone loading en false', async () => {
    const mockResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }],
    }
    userService.getUsers.mockResolvedValue(mockResponse)
    const store = buildStore()
    await store.dispatch(fetchUsers())
    expect(selectUsers(store.getState())).toHaveLength(2)
    expect(selectUsersLoading(store.getState())).toBe(false)
    expect(selectUsersTotal(store.getState())).toBe(2)
  })

  it('guarda el error y pone loading en false si falla', async () => {
    userService.getUsers.mockRejectedValue(new Error('Sin conexión'))
    const store = buildStore()
    await store.dispatch(fetchUsers())
    expect(selectUsersError(store.getState()).message).toBe('Sin conexión')
    expect(selectUsersLoading(store.getState())).toBe(false)
  })

  it('pasa filtros al servicio', async () => {
    userService.getUsers.mockResolvedValue([])
    const store = buildStore()
    await store.dispatch(fetchUsers({ status: 'ACTIVE' }))
    expect(userService.getUsers).toHaveBeenCalledWith({ status: 'ACTIVE' })
  })
})

// ── createUser ─────────────────────────────────────────────────────────────

describe('createUser thunk', () => {
  it('agrega el usuario nuevo al array al completarse', async () => {
    const existing = [{ id: 1, username: 'alice' }]
    const newUser = { id: 2, username: 'bob' }
    userService.createUser.mockResolvedValue(newUser)
    const store = buildStore({ users: existing, loading: false, error: null, total: 1 })
    await store.dispatch(createUser({ username: 'bob' }))
    const users = selectUsers(store.getState())
    expect(users).toHaveLength(2)
    expect(users[1]).toEqual(newUser)
  })
})

// ── updateUser ─────────────────────────────────────────────────────────────

describe('updateUser thunk', () => {
  it('reemplaza el usuario en el array con los datos actualizados', async () => {
    const existing = [{ id: 1, username: 'alice', email: 'viejo@test.com' }]
    const updated = { id: 1, username: 'alice', email: 'nuevo@test.com' }
    userService.updateUser.mockResolvedValue(updated)
    const store = buildStore({ users: existing, loading: false, error: null, total: 1 })
    await store.dispatch(updateUser({ id: 1, data: { email: 'nuevo@test.com' } }))
    const users = selectUsers(store.getState())
    expect(users[0].email).toBe('nuevo@test.com')
  })
})

// ── deactivateUser ────────────────────────────────────────────────────────

describe('deactivateUser thunk', () => {
  it('cambia el state del usuario a ELIMINATED (baja lógica UC-USR-04)', async () => {
    const existing = [{ id: 3, username: 'carlos', state: 'ACTIVE' }]
    userService.deactivateUser.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
    const store = buildStore({ users: existing, loading: false, error: null, total: 1 })
    await store.dispatch(deactivateUser(3))
    const users = selectUsers(store.getState())
    expect(users[0].state).toBe('ELIMINATED')
  })

  it('NO elimina el usuario del array — baja lógica, no física', async () => {
    const existing = [{ id: 3, username: 'carlos', state: 'ACTIVE' }]
    userService.deactivateUser.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
    const store = buildStore({ users: existing, loading: false, error: null, total: 1 })
    await store.dispatch(deactivateUser(3))
    expect(selectUsers(store.getState())).toHaveLength(1)
  })
})

// ── Selectores ─────────────────────────────────────────────────────────────

describe('selectores', () => {
  it('selectUsers retorna el array de usuarios', () => {
    const store = buildStore({ users: [{ id: 1 }], loading: false, error: null, total: 1 })
    expect(selectUsers(store.getState())).toEqual([{ id: 1 }])
  })

  it('selectUsersLoading retorna el estado de carga', () => {
    const store = buildStore({ users: [], loading: true, error: null, total: 0 })
    expect(selectUsersLoading(store.getState())).toBe(true)
  })

  it('selectUsersError retorna el mensaje de error', () => {
    const store = buildStore({ users: [], loading: false, error: 'Fallo de red', total: 0 })
    expect(selectUsersError(store.getState())).toBe('Fallo de red')
  })

  it('selectUsersTotal retorna el total de usuarios', () => {
    const store = buildStore({ users: [{ id: 1 }, { id: 2 }], loading: false, error: null, total: 2 })
    expect(selectUsersTotal(store.getState())).toBe(2)
  })
})
