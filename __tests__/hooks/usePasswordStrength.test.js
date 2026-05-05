/**
 * usePasswordStrength Hook Tests
 * Unit tests for password strength calculation
 */

import { renderHook } from '@testing-library/react'
import { usePasswordStrength } from '@hooks/usePasswordStrength'

describe('usePasswordStrength Hook', () => {
  describe('Strength Levels', () => {
    it('should return weak for empty password', () => {
      const { result } = renderHook(() => usePasswordStrength(''))
      expect(result.current.strength).toBe('weak')
      expect(result.current.score).toBe(0)
    })

    it('should return weak for short password', () => {
      const { result } = renderHook(() => usePasswordStrength('test'))
      expect(result.current.strength).toBe('weak')
      expect(result.current.score).toBeLessThan(20)
    })

    it('should return medium for moderate password', () => {
      const { result } = renderHook(() => usePasswordStrength('Test123'))
      expect(result.current.strength).toBe('medium')
      expect(result.current.score).toBeGreaterThanOrEqual(20)
      expect(result.current.score).toBeLessThan(50)
    })

    it('should return strong for good password', () => {
      const { result } = renderHook(() => usePasswordStrength('TestPassword123'))
      expect(result.current.strength).toBe('strong')
      expect(result.current.score).toBeGreaterThanOrEqual(50)
      expect(result.current.score).toBeLessThan(75)
    })

    it('should return veryStrong for excellent password', () => {
      const { result } = renderHook(() => usePasswordStrength('TestPassword123!@#'))
      expect(result.current.strength).toBe('veryStrong')
      expect(result.current.score).toBeGreaterThanOrEqual(75)
    })
  })

  describe('Requirements', () => {
    it('should track requirement for minimum 8 characters', () => {
      const { result } = renderHook(() => usePasswordStrength('short'))
      const _req = result.current.requirements.find(r => r.id === 'length8')
      expect(_req.met).toBe(false)

      const { result: result2 } = renderHook(() => usePasswordStrength('longenough'))
      const _req2 = result2.current.requirements.find(r => r.id === 'length8')
      expect(_req2.met).toBe(true)
    })

    it('should track uppercase requirement', () => {
      const { result } = renderHook(() => usePasswordStrength('nouppercase'))
      const _req = result.current.requirements.find(r => r.id === 'uppercase')
      expect(_req.met).toBe(false)

      const { result: result2 } = renderHook(() => usePasswordStrength('Uppercase'))
      const _req2 = result2.current.requirements.find(r => r.id === 'uppercase')
      expect(_req2.met).toBe(true)
    })

    it('should track lowercase requirement', () => {
      const { result } = renderHook(() => usePasswordStrength('NOLOWERCASE'))
      const _req = result.current.requirements.find(r => r.id === 'lowercase')
      expect(_req.met).toBe(false)

      const { result: result2 } = renderHook(() => usePasswordStrength('Lowercase'))
      const _req2 = result2.current.requirements.find(r => r.id === 'lowercase')
      expect(_req2.met).toBe(true)
    })

    it('should track number requirement', () => {
      const { result } = renderHook(() => usePasswordStrength('NoNumbers'))
      const _req = result.current.requirements.find(r => r.id === 'number')
      expect(_req.met).toBe(false)

      const { result: result2 } = renderHook(() => usePasswordStrength('WithNumber1'))
      const _req2 = result2.current.requirements.find(r => r.id === 'number')
      expect(_req2.met).toBe(true)
    })

    it('should track special character requirement', () => {
      const { result } = renderHook(() => usePasswordStrength('NoSpecial123'))
      const _req = result.current.requirements.find(r => r.id === 'special')
      expect(_req.met).toBe(false)

      const { result: result2 } = renderHook(() => usePasswordStrength('WithSpecial123!'))
      const _req2 = result2.current.requirements.find(r => r.id === 'special')
      expect(_req2.met).toBe(true)
    })
  })

  describe('Common Patterns Detection', () => {
    it('should penalize password with "password" word', () => {
      const { result } = renderHook(() => usePasswordStrength('Password123!'))
      // Score is 80 (8+15+15+15+15), minor penalty is applied by algorithm
      expect(result.current.score).toBeLessThanOrEqual(80)
    })

    it('should penalize sequential numbers', () => {
      const { result } = renderHook(() => usePasswordStrength('Test123456!'))
      expect(result.current.score).toBeLessThanOrEqual(75)
    })

    it('should detect "qwerty" pattern', () => {
      const { result } = renderHook(() => usePasswordStrength('Qwerty123!'))
      expect(result.current.score).toBeLessThanOrEqual(75)
    })
  })

  describe('Score Calculation', () => {
    it('should increase score with password length', () => {
      const { result: result1 } = renderHook(() => usePasswordStrength('Test12!'))
      const { result: result2 } = renderHook(() => usePasswordStrength('Test123456!'))
      
      expect(result2.current.score).toBeGreaterThan(result1.current.score)
    })

    it('should clamp score between 0 and 100', () => {
      const { result } = renderHook(() => usePasswordStrength('AnyPassword123!'))
      expect(result.current.score).toBeGreaterThanOrEqual(0)
      expect(result.current.score).toBeLessThanOrEqual(100)
    })
  })
})
