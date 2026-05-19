import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FormStepper from '../FormStepper'

const STEPS = [
  { title: 'Paso 1', content: <div>Contenido paso 1</div> },
  { title: 'Paso 2', content: <div>Contenido paso 2</div> },
  { title: 'Paso 3', content: <div>Contenido paso 3</div> },
]

describe('FormStepper', () => {
  it('renders current step content', () => {
    render(<FormStepper steps={STEPS} currentStep={0} />)
    expect(screen.getByText('Contenido paso 1')).toBeInTheDocument()
  })

  it('renders step indicator', () => {
    render(<FormStepper steps={STEPS} currentStep={1} />)
    expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument()
  })

  it('shows LoadingSpinner when isLoading', () => {
    const { container } = render(<FormStepper steps={STEPS} currentStep={0} isLoading={true} />)
    expect(container.querySelector('.spinner')).toBeInTheDocument()
  })

  it('hides content when isLoading', () => {
    render(<FormStepper steps={STEPS} currentStep={0} isLoading={true} />)
    expect(screen.queryByText('Contenido paso 1')).not.toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<FormStepper steps={STEPS} currentStep={0} error="Ocurrió un error" />)
    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument()
  })

  it('calls onNext when Next button clicked', () => {
    const onNext = jest.fn()
    render(<FormStepper steps={STEPS} currentStep={0} onNext={onNext} />)
    const nextBtn = screen.getByText(/siguiente|next/i)
    fireEvent.click(nextBtn)
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onPrevious when Previous button clicked on non-first step', () => {
    const onPrevious = jest.fn()
    render(<FormStepper steps={STEPS} currentStep={1} onPrevious={onPrevious} />)
    const prevBtn = screen.getByText(/anterior|previous/i)
    fireEvent.click(prevBtn)
    expect(onPrevious).toHaveBeenCalled()
  })

  it('calls onConfirm on last step', () => {
    const onConfirm = jest.fn()
    render(<FormStepper steps={STEPS} currentStep={2} onConfirm={onConfirm} />)
    const confirmBtn = screen.getByText(/confirmar|confirm/i)
    fireEvent.click(confirmBtn)
    expect(onConfirm).toHaveBeenCalled()
  })

  it('uses LoadingSpinner not AnimatedLoadingSpinner', () => {
    const { container } = render(<FormStepper steps={STEPS} currentStep={0} isLoading={true} />)
    // LoadingSpinner renders a .spinner element; AnimatedLoadingSpinner renders differently
    expect(container.querySelector('.spinner')).toBeInTheDocument()
    expect(container.querySelector('.animated-spinner, .animation-container')).toBeNull()
  })
})
