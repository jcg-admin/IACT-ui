import { ErrorLogger } from '../errorLogger'

describe('ErrorLogger._sanitize', () => {
  const logger = new ErrorLogger()

  it('redacts password field', () => {
    const result = logger._sanitize({ username: 'alice', password: 'secret123' })
    expect(result.password).toBe('[REDACTED]')
    expect(result.username).toBe('alice')
  })

  it('redacts token fields', () => {
    const result = logger._sanitize({ access_token: 'tok', data: 'ok' })
    expect(result.access_token).toBe('[REDACTED]')
  })

  it('redacts nested sensitive fields', () => {
    const result = logger._sanitize({ user: { password: 'pw', name: 'Bob' } })
    expect(result.user.password).toBe('[REDACTED]')
    expect(result.user.name).toBe('Bob')
  })

  it('returns primitive values unchanged', () => {
    expect(logger._sanitize('hello')).toBe('hello')
    expect(logger._sanitize(42)).toBe(42)
    expect(logger._sanitize(null)).toBeNull()
  })
})

describe('ErrorLogger queue', () => {
  it('starts with empty queue', () => {
    const logger = new ErrorLogger()
    expect(logger.queue).toHaveLength(0)
  })

  it('maxQueueSize is 50 by default', () => {
    const logger = new ErrorLogger()
    expect(logger.maxQueueSize).toBe(50)
  })
})
