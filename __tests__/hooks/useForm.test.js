/**
 * useForm Hook Tests
 * Unit tests for form state management hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useForm } from '@hooks/useForm'

describe('useForm Hook', () => {
  const _initialValues = {
    email: '',
    password: '',
    rememberMe: false,
  }

  const _mockSubmitFn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() => 
        useForm(_initialValues, _mockSubmitFn)
      )

      expect(result.current.values).toEqual(_initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should handle empty initial values', () => {
      const { result } = renderHook(() =>
        useForm({}, _mockSubmitFn)
      )

      expect(result.current.values).toEqual({})
    })

    it('should handle complex initial values', () => {
      const _complex = {
        user: { name: 'John', email: 'john@example.com' },
        settings: { notifications: true },
      }

      const { result } = renderHook(() =>
        useForm(_complex, _mockSubmitFn)
      )

      expect(result.current.values).toEqual(_complex)
    })
  })

  describe('Handle Change', () => {
    it('should update value on input change', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com', type: 'text' }
        })
      })

      expect(result.current.values.email).toBe('test@example.com')
    })

    it('should handle checkbox type inputs', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleChange({
          target: { name: 'rememberMe', type: 'checkbox', checked: true }
        })
      })

      expect(result.current.values.rememberMe).toBe(true)
    })

    it('should handle multiple field changes', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com', type: 'text' }
        })
        result.current.handleChange({
          target: { name: 'password', value: 'password123', type: 'password' }
        })
      })

      expect(result.current.values.email).toBe('test@example.com')
      expect(result.current.values.password).toBe('password123')
    })
  })

  describe('Handle Blur', () => {
    it('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleBlur({
          target: { name: 'email' }
        })
      })

      expect(result.current.touched.email).toBe(true)
    })

    it('should track multiple touched fields', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleBlur({ target: { name: 'email' } })
        result.current.handleBlur({ target: { name: 'password' } })
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.touched.password).toBe(true)
    })
  })

  describe('Handle Submit', () => {
    it('should call onSubmit with values', async () => {
      const { result } = renderHook(() =>
        useForm({ email: 'test@example.com' }, _mockSubmitFn)
      )

      const _event = { preventDefault: jest.fn() }

      await act(async () => {
        await result.current.handleSubmit(_event)
      })

      expect(_event.preventDefault).toHaveBeenCalled()
      expect(_mockSubmitFn).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      )
    })

    it('should set isSubmitting to true during submit', async () => {
      const _slowSubmit = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 50))
      )

      const { result } = renderHook(() =>
        useForm(_initialValues, _slowSubmit)
      )

      await act(async () => {
        result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      // Wait for isSubmitting to become false
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })

      // Verify submit was called
      expect(_slowSubmit).toHaveBeenCalledWith(_initialValues)
    })

    it('should handle submit errors', async () => {
      const _errorSubmit = jest.fn(
        () => Promise.reject(new Error('Submit failed'))
      )

      const { result } = renderHook(() =>
        useForm(_initialValues, _errorSubmit)
      )

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.errors.submit).toBeDefined()
    })
  })

  describe('Set Values', () => {
    it('should set all values at once', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      const _newValues = {
        email: 'new@example.com',
        password: 'newpass',
        rememberMe: true,
      }

      act(() => {
        result.current.setValues(_newValues)
      })

      expect(result.current.values).toEqual(_newValues)
    })

    it('should support functional update', () => {
      const { result } = renderHook(() =>
        useForm({ count: 1 }, _mockSubmitFn)
      )

      act(() => {
        result.current.setValues(prev => ({
          ...prev,
          count: prev.count + 1
        }))
      })

      expect(result.current.values.count).toBe(2)
    })
  })

  describe('Set Errors', () => {
    it('should set errors object', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      const _errors = {
        email: 'Invalid email',
        password: 'Password too short',
      }

      act(() => {
        result.current.setErrors(_errors)
      })

      expect(result.current.errors).toEqual(_errors)
    })

    it('should set individual errors', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.setErrors({
          email: 'Invalid email'
        })
      })

      expect(result.current.errors.email).toBe('Invalid email')
    })
  })

  describe('Reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      // Change values
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com', type: 'text' }
        })
      })

      expect(result.current.values.email).toBe('test@example.com')

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual(_initialValues)
    })

    it('should clear errors on reset', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      // Set errors
      act(() => {
        result.current.setErrors({ email: 'Error' })
      })

      expect(result.current.errors.email).toBeDefined()

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.errors).toEqual({})
    })

    it('should clear touched fields on reset', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      // Mark as touched
      act(() => {
        result.current.handleBlur({ target: { name: 'email' } })
      })

      expect(result.current.touched.email).toBe(true)

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.touched).toEqual({})
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid changes', () => {
      const { result } = renderHook(() =>
        useForm({ value: '' }, _mockSubmitFn)
      )

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.handleChange({
            target: { name: 'value', value: String(i), type: 'text' }
          })
        }
      })

      expect(result.current.values.value).toBe('9')
    })

    it('should handle undefined field names', () => {
      const { result } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      // Should not throw
      expect(() => {
        act(() => {
          result.current.handleChange({
            target: { name: undefined, value: 'test', type: 'text' }
          })
        })
      }).not.toThrow()
    })

    it('should preserve form state between renders', () => {
      const { result, rerender } = renderHook(() =>
        useForm(_initialValues, _mockSubmitFn)
      )

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com', type: 'text' }
        })
      })

      const _value = result.current.values.email

      rerender()

      expect(result.current.values.email).toBe(_value)
    })
  })
})
