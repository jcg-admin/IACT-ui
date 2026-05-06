import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../ConfirmModal'

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirmar acción',
    message: '¿Estás seguro?',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders title and message when open', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
  })

  it('renders Cancelar and Confirmar buttons by default', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
  })

  it('renders custom confirmLabel', () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Eliminar" />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('renders custom cancelLabel', () => {
    render(<ConfirmModal {...defaultProps} cancelLabel="No, volver" />)
    expect(screen.getByRole('button', { name: /no, volver/i })).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('applies btn--danger class for variant danger', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" confirmLabel="Eliminar" />)
    const confirmBtn = screen.getByRole('button', { name: /eliminar/i })
    expect(confirmBtn).toHaveClass('btn--danger')
  })

  it('applies btn--warning class for variant warning', () => {
    render(<ConfirmModal {...defaultProps} variant="warning" />)
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    expect(confirmBtn).toHaveClass('btn--warning')
  })

  it('applies btn--primary class for default variant', () => {
    render(<ConfirmModal {...defaultProps} />)
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    expect(confirmBtn).toHaveClass('btn--primary')
  })

  it('renders message as node when passed as JSX', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        message={<span data-testid="custom-msg">Contenido custom</span>}
      />
    )
    expect(screen.getByTestId('custom-msg')).toBeInTheDocument()
  })
})
