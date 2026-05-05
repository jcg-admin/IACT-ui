/**
 * useAsync Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useAsync } from '@hooks/useAsync'

describe('useAsync Hook', () => {
  it('should start with idle status', () => {
    const _asyncFn = jest.fn(() => Promise.resolve('data'))
    const { result } = renderHook(() => useAsync(_asyncFn, false))

    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should execute immediately when immediate is true', async () => {
    const _asyncFn = jest.fn(() => Promise.resolve('data'))

    const { result } = renderHook(() => useAsync(_asyncFn, true))

    expect(result.current.status).toBe('pending')

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('data')
  })

  it('should handle successful async operation', async () => {
    const _asyncFn = jest.fn(() => Promise.resolve('success'))
    const { result } = renderHook(() => useAsync(_asyncFn, false))

    await act(async () => {
      await result.current.execute()
    })

    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe('success')
    expect(result.current.error).toBeNull()
  })

  it('should handle async errors', async () => {
    const _error = new Error('Failed')
    const _asyncFn = jest.fn(() => Promise.reject(_error))
    const { result } = renderHook(() => useAsync(_asyncFn, false))

    await act(async () => {
      await result.current.execute()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe(_error)
    expect(result.current.data).toBeNull()
  })

  it('should allow manual execution', async () => {
    const _asyncFn = jest.fn(() => Promise.resolve('data'))
    const { result } = renderHook(() => useAsync(_asyncFn, false))

    expect(result.current.status).toBe('idle')

    await act(async () => {
      await result.current.execute()
    })

    expect(result.current.status).toBe('success')
    expect(_asyncFn).toHaveBeenCalled()
  })

  it('should transition through states correctly', async () => {
    const _asyncFn = jest.fn(() => Promise.resolve('data'))
    const { result } = renderHook(() => useAsync(_asyncFn, false))

    expect(result.current.status).toBe('idle')

    let promiseResolve
    const _slowFn = jest.fn(
      () => new Promise(resolve => {
        promiseResolve = resolve
      })
    )

    const { result: slowResult } = renderHook(() => useAsync(_slowFn, false))

    act(() => {
      slowResult.current.execute()
    })

    // Need to wait for the async operation to dispatch PENDING
    await new Promise(r => setTimeout(r, 10))

    expect(slowResult.current.status).toBe('pending')

    await act(async () => {
      promiseResolve('result')
      // Wait for the Promise resolution to be processed
      await new Promise(r => setTimeout(r, 10))
    })

    expect(slowResult.current.status).toBe('success')
    expect(slowResult.current.data).toBe('result')
  })
})
