import { inputValidator, RateLimiter } from '../security'

describe('InputValidator.isValidEmail', () => {
  it('accepts valid email', () => {
    expect(inputValidator.isValidEmail('user@example.com')).toBe(true)
  })

  it('rejects email without @', () => {
    expect(inputValidator.isValidEmail('notanemail')).toBe(false)
  })
})

describe('InputValidator.isValidURL', () => {
  it('accepts http URL', () => {
    expect(inputValidator.isValidURL('http://example.com')).toBe(true)
  })

  it('rejects non-http schemes', () => {
    expect(inputValidator.isValidURL('javascript:alert(1)')).toBe(false)
  })
})

describe('InputValidator.isValidPassword', () => {
  it('accepts strong password', () => {
    expect(inputValidator.isValidPassword('Strong1@pass')).toBe(true)
  })

  it('rejects weak password', () => {
    expect(inputValidator.isValidPassword('weakpass')).toBe(false)
  })
})

describe('InputValidator.sanitizeUsername', () => {
  it('removes non-alphanumeric characters', () => {
    expect(inputValidator.sanitizeUsername('user<script>')).toBe('userscript')
  })

  it('truncates to 20 chars', () => {
    const long = 'a'.repeat(30)
    expect(inputValidator.sanitizeUsername(long)).toHaveLength(20)
  })
})

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter(3, 1000)
    expect(limiter.canMakeRequest('action1')).toBe(true)
    expect(limiter.canMakeRequest('action1')).toBe(true)
    expect(limiter.canMakeRequest('action1')).toBe(true)
  })

  it('blocks requests that exceed limit', () => {
    const limiter = new RateLimiter(2, 1000)
    limiter.canMakeRequest('action2')
    limiter.canMakeRequest('action2')
    expect(limiter.canMakeRequest('action2')).toBe(false)
  })
})
