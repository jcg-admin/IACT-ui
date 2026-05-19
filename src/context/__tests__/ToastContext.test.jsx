import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastContext'

function TestConsumer() {
  const { addToast, removeToast, toasts } = useToast()
  return (
    <div>
      <button onClick={() => addToast('Hello', 'info', 0)}>Add</button>
      <button onClick={() => toasts[0] && removeToast(toasts[0].id)}>Remove</button>
      <ul>{toasts.map(t => <li key={t.id}>{t.message}</li>)}</ul>
    </div>
  )
}

describe('ToastContext', () => {
  it('throws when useToast is called outside ToastProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useToast debe usarse dentro de ToastProvider')
    consoleError.mockRestore()
  })

  it('addToast adds a toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('removeToast removes a toast', () => {
    render(<ToastProvider><TestConsumer /></ToastProvider>)
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('Hello')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Remove'))
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })
})
