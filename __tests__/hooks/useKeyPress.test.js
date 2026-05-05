/**
 * useKeyPress Hook Tests
 */

import { renderHook } from '@testing-library/react'
import { useKeyPress } from '@hooks/useKeyPress'

describe('useKeyPress Hook', () => {
  it('should call callback on key press', () => {
    const _callback = jest.fn()
    renderHook(() => useKeyPress('Enter', _callback))

    const _event = new KeyboardEvent('keydown', { key: 'Enter' })
    window.dispatchEvent(_event)

    expect(_callback).toHaveBeenCalled()
  })

  it('should ignore other keys', () => {
    const _callback = jest.fn()
    renderHook(() => useKeyPress('Enter', _callback))

    const _event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(_event)

    expect(_callback).not.toHaveBeenCalled()
  })

  it('should detect Escape key', () => {
    const _callback = jest.fn()
    renderHook(() => useKeyPress('Escape', _callback))

    const _event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(_event)

    expect(_callback).toHaveBeenCalled()
  })

  it('should detect Tab key', () => {
    const _callback = jest.fn()
    renderHook(() => useKeyPress('Tab', _callback))

    const _event = new KeyboardEvent('keydown', { key: 'Tab' })
    window.dispatchEvent(_event)

    expect(_callback).toHaveBeenCalled()
  })

  it('should cleanup listeners on unmount', () => {
    const _removeSpy = jest.spyOn(window, 'removeEventListener')
    const _callback = jest.fn()

    const { unmount } = renderHook(() => useKeyPress('Enter', _callback))

    unmount()

    expect(_removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    _removeSpy.mockRestore()
  })

  it('should pass event to callback', () => {
    const _callback = jest.fn()
    renderHook(() => useKeyPress('Enter', _callback))

    const _event = new KeyboardEvent('keydown', { key: 'Enter' })
    window.dispatchEvent(_event)

    expect(_callback).toHaveBeenCalledWith(expect.any(KeyboardEvent))
  })
})
