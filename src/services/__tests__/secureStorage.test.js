import { SecureStorage } from '../secureStorage'

const storage = new SecureStorage('test-secret-key')

beforeEach(() => {
  localStorage.clear()
})

describe('SecureStorage', () => {
  it('setItem stores encrypted value in localStorage', () => {
    const result = storage.setItem('user', { id: 1, name: 'Alice' })
    expect(result).toBe(true)
    const raw = localStorage.getItem('sec_user')
    expect(raw).toBeTruthy()
    expect(raw).not.toContain('Alice')
  })

  it('getItem decrypts and returns original value', () => {
    storage.setItem('user', { id: 1, name: 'Alice' })
    const retrieved = storage.getItem('user')
    expect(retrieved).toEqual({ id: 1, name: 'Alice' })
  })

  it('getItem returns null for missing key', () => {
    expect(storage.getItem('nonexistent')).toBeNull()
  })

  it('removeItem deletes the key', () => {
    storage.setItem('token', 'abc')
    storage.removeItem('token')
    expect(storage.getItem('token')).toBeNull()
  })

  it('clear removes only sec_ prefixed keys', () => {
    storage.setItem('a', 1)
    storage.setItem('b', 2)
    localStorage.setItem('other', 'keep')
    storage.clear()
    expect(storage.getItem('a')).toBeNull()
    expect(storage.getItem('b')).toBeNull()
    expect(localStorage.getItem('other')).toBe('keep')
  })
})
