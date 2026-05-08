import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ShareReportModal from '../ShareReportModal'

const TEST_URL = 'https://example.com/reports/shared?type=agents&dateFrom=2026-05-01'

// ── legacy URL-copy mode ─────────────────────────────────────────────────────

describe('ShareReportModal — URL copy mode (legacy)', () => {
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
})

// ── backend share form mode ──────────────────────────────────────────────────

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ shares: { createStatus: null, error: null } }),
}))

jest.mock('../../../redux/slices/shares', () => ({
  createShare: jest.fn((payload) => ({ type: 'shares/createShare', payload })),
  resetCreateStatus: jest.fn(() => ({ type: 'shares/resetCreateStatus' })),
  selectShareCreateStatus: (s) => s.shares.createStatus,
  selectSharesError: (s) => s.shares.error,
}))

describe('ShareReportModal — backend share form mode', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders share form when viewId is provided', () => {
    render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    expect(screen.getByText('Tipo de destinatario')).toBeInTheDocument()
    expect(screen.getByText('Permiso')).toBeInTheDocument()
  })

  it('shows target_id input by default (targetType=user)', () => {
    render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    expect(screen.getByPlaceholderText(/ej\. 42/i)).toBeInTheDocument()
  })

  it('hides target_id input when segment_public is selected', () => {
    render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'segment_public' } })
    expect(screen.queryByPlaceholderText(/ej\. 42/i)).toBeNull()
  })

  it('shows AGR placeholder when agr is selected', () => {
    render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'agr' } })
    expect(screen.getByPlaceholderText(/ej\. 5/i)).toBeInTheDocument()
  })

  it('dispatches createShare on form submit', () => {
    const { createShare } = require('../../../redux/slices/shares')
    const { container } = render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText(/ej\. 42/i), { target: { value: '99' } })
    fireEvent.submit(container.querySelector('form'))
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'shares/createShare' }))
    expect(createShare).toHaveBeenCalledWith(expect.objectContaining({ view_id: 5, target_id: '99' }))
  })

  it('shows success message after createStatus=success', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ shares: { createStatus: 'success', error: null } })
    )
    render(<ShareReportModal isOpen viewId={5} viewName="Vista test" onClose={() => {}} />)
    expect(screen.getByText(/vista compartida/i)).toBeInTheDocument()
  })
})
