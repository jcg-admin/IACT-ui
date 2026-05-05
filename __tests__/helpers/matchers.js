/**
 * Custom Jest matchers
 */

expect.extend({
  toHaveBeenCalledWithObject(received, expected) {
    const pass = received.mock.calls.some(call => {
      return JSON.stringify(call[0]) === JSON.stringify(expected)
    })

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to have been called with ${JSON.stringify(expected)}`
          : `expected ${received} to have been called with ${JSON.stringify(expected)}`,
    }
  },

  toBeVisible(received) {
    const isVisible = received && getComputedStyle(received).visibility !== 'hidden'
    
    return {
      pass: isVisible,
      message: () =>
        isVisible
          ? `expected element not to be visible`
          : `expected element to be visible`,
    }
  },

  toBeDisabled(received) {
    const isDisabled = received.hasAttribute('disabled') || received.getAttribute('aria-disabled') === 'true'
    
    return {
      pass: isDisabled,
      message: () =>
        isDisabled
          ? `expected element not to be disabled`
          : `expected element to be disabled`,
    }
  },
})
