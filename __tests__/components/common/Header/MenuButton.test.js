import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuButton from '../../../../src/components/common/Header/MenuButton'

describe('MenuButton Component', () => {
  it('should render menu button', () => {
    render(<MenuButton />)
    expect(screen.getByLabelText('Toggle sidebar menu')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<MenuButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should reflect isOpen state in aria-expanded', () => {
    const { rerender } = render(<MenuButton isOpen={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    
    rerender(<MenuButton isOpen={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })
})
