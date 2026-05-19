import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportFilters from '../ReportFilters'

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '' }

describe('ReportFilters', () => {
  it('renders Desde and Hasta date inputs', () => {
    render(<ReportFilters filters={DEFAULT_FILTERS} onChange={() => {}} onApply={() => {}} onReset={() => {}} />)
    const inputs = document.querySelectorAll('input[type="date"]')
    expect(inputs.length).toBe(2)
  })

  it('renders Aplicar and Limpiar buttons', () => {
    render(<ReportFilters filters={DEFAULT_FILTERS} onChange={() => {}} onApply={() => {}} onReset={() => {}} />)
    expect(screen.getByText('Aplicar')).toBeInTheDocument()
    expect(screen.getByText('Limpiar')).toBeInTheDocument()
  })

  it('calls onChange with key/value when dateFrom input changes', () => {
    const onChange = jest.fn()
    render(<ReportFilters filters={DEFAULT_FILTERS} onChange={onChange} onApply={() => {}} onReset={() => {}} />)
    const inputs = document.querySelectorAll('input[type="date"]')
    fireEvent.change(inputs[0], { target: { value: '2026-01-01' } })
    expect(onChange).toHaveBeenCalledWith('dateFrom', '2026-01-01')
  })

  it('calls onApply when Aplicar clicked', () => {
    const onApply = jest.fn()
    render(<ReportFilters filters={DEFAULT_FILTERS} onChange={() => {}} onApply={onApply} onReset={() => {}} />)
    fireEvent.click(screen.getByText('Aplicar'))
    expect(onApply).toHaveBeenCalled()
  })

  it('calls onReset when Limpiar clicked', () => {
    const onReset = jest.fn()
    render(<ReportFilters filters={DEFAULT_FILTERS} onChange={() => {}} onApply={() => {}} onReset={onReset} />)
    fireEvent.click(screen.getByText('Limpiar'))
    expect(onReset).toHaveBeenCalled()
  })
})
