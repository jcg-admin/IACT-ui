import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ShareReportModal from '../ShareReportModal'

const TEST_URL = 'https://example.com/reports/shared?type=agents&dateFrom=2026-05-01'

describe('ShareReportModal (uc-rpt-11)', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ShareReportModal isOpen={false} url={TEST_URL} onClose={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the share URL in a readonly input', () => {
    render(<ShareReportModal isOpen url={TEST_URL} onClose={() => {}} />)
    const input = screen.getByDisplayValue(TEST_URL)
    expect(input).toHaveAttribute('readOnly')
  })

  it('renders Copiar enlace button', () => {
    render(<ShareReportModal isOpen url={TEST_URL} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /copiar enlace/i })).toBeInTheDocument()
  })

  it('calls clipboard.writeText with URL when Copiar is clicked', async () => {
    render(<ShareReportModal isOpen url={TEST_URL} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /copiar enlace/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TEST_URL)
  })

  it('renders Cerrar button that calls onClose', () => {
    const onClose = jest.fn()
    render(<ShareReportModal isOpen url={TEST_URL} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders modal title with "compartir" text', () => {
    render(<ShareReportModal isOpen url={TEST_URL} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: /compartir/i })).toBeInTheDocument()
  })
})
