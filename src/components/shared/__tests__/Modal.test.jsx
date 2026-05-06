import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../Modal'

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<Modal isOpen={false} onClose={() => {}} title="Test" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders title when open', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Confirmar">children</Modal>)
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="T"><p>modal body</p></Modal>)
    expect(screen.getByText('modal body')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Modal isOpen={true} onClose={onClose} title="T">body</Modal>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<Modal isOpen={true} onClose={onClose} title="T" closeOnEscape={true}>body</Modal>)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('does NOT call onClose on Escape when closeOnEscape is false', () => {
    const onClose = jest.fn()
    render(<Modal isOpen={true} onClose={onClose} title="T" closeOnEscape={false}>body</Modal>)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
