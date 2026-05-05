/**
 * Jest Setup File
 * Global test configuration
 */

// Setup @testing-library/jest-dom matchers
require('@testing-library/jest-dom')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(_query => ({
    matches: false,
    media: _query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const _localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = _localStorageMock

// Mock window.scrollTo
window.scrollTo = jest.fn()

// Suppress console errors/warnings in tests (optional)
const _originalError = console.error
beforeAll(() => {
  console.error = (..._args) => {
    if (
      typeof _args[0] === 'string' &&
      _args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    _originalError.call(console, ..._args)
  }
})

afterAll(() => {
  console.error = _originalError
})

// Global test timeout
jest.setTimeout(10000)
