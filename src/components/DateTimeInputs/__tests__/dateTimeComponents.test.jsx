import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectDropdown from '../SelectDropdown'
import DateTimeInput from '../DateTimeInput'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

describe('SelectDropdown', () => {
  it('renders placeholder', () => {
    render(<SelectDropdown options={OPTIONS} placeholder="Elegir..." />)
    expect(screen.getByText('Elegir...')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<SelectDropdown options={OPTIONS} label="Mi campo" />)
    expect(screen.getByText('Mi campo')).toBeInTheDocument()
  })

  it('calls onChange when option selected', () => {
    const onChange = jest.fn()
    render(<SelectDropdown options={OPTIONS} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('react-select'), { target: { value: 'a' } })
    expect(onChange).toHaveBeenCalledWith(OPTIONS[0])
  })

  it('disables when isDisabled', () => {
    render(<SelectDropdown options={OPTIONS} isDisabled={true} />)
    expect(screen.getByTestId('react-select')).toBeDisabled()
  })
})

describe('DateTimeInput', () => {
  it('renders label when provided', () => {
    render(<DateTimeInput value={null} onChange={jest.fn()} label="Fecha" />)
    expect(screen.getByText('Fecha')).toBeInTheDocument()
  })

  it('renders date picker', () => {
    render(<DateTimeInput value={null} onChange={jest.fn()} />)
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('shows clear button when value provided', () => {
    render(<DateTimeInput value={new Date()} onChange={jest.fn()} />)
    expect(screen.getByTitle('Limpiar')).toBeInTheDocument()
  })

  it('calls onChange(null) when clear is clicked', () => {
    const onChange = jest.fn()
    render(<DateTimeInput value={new Date()} onChange={onChange} />)
    fireEvent.click(screen.getByTitle('Limpiar'))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
