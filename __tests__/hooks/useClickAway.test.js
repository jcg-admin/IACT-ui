/**
 * useClickAway Hook Tests
 */

import React from 'react'
import { renderHook, fireEvent } from '@testing-library/react'
import { useClickAway } from '@hooks/useClickAway'

describe('useClickAway Hook', () => {
  it('should call callback on outside click', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useClickAway(_callback))

    const _element = document.createElement('div')
    result.current.current = _element

    const _event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(_event, 'target', {
      value: document.body,
      enumerable: true,
    })

    fireEvent(document, _event)

    expect(_callback).toHaveBeenCalled()
  })

  it('should not call callback on inside click', () => {
    const _callback = jest.fn()
    const { result } = renderHook(() => useClickAway(_callback))

    const _element = document.createElement('div')
    result.current.current = _element

    const _event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(_event, 'target', {
      value: _element,
      enumerable: true,
    })

    fireEvent(document, _event)

    expect(_callback).not.toHaveBeenCalled()
  })

  it('should cleanup listeners on unmount', () => {
    const _removeSpy = jest.spyOn(document, 'removeEventListener')
    const _callback = jest.fn()

    const { unmount } = renderHook(() => useClickAway(_callback))

    unmount()

    expect(_removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    expect(_removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

    _removeSpy.mockRestore()
  })
})
