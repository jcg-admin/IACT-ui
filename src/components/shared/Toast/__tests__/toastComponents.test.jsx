import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Toast from '../Toast'
import ToastContainer from '../ToastContainer'
import { ToastProvider } from '../../../../context/ToastContext'

describe('Toast', () => {
  it('renders message', () => {
    render(<Toast id={1} message="Operation complete" type="success" onRemove={jest.fn()} />)
    expect(screen.getByText('Operation complete')).toBeInTheDocument()
  })

  it('calls onRemove when close button clicked', () => {
    const onRemove = jest.fn()
    render(<Toast id={42} message="msg" type="info" onRemove={onRemove} />)
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(onRemove).toHaveBeenCalledWith(42)
  })
})

describe('ToastContainer', () => {
  it('renders with no toasts initially', () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    )
    // Container exists but no toast messages
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
