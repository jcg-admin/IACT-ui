import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LogoBrand from '../../../../src/components/common/Header/LogoBrand'

describe('LogoBrand Component', () => {
  it('should render logo and app name', () => {
    render(<LogoBrand appName="IACT Dashboard" />)
    expect(screen.getByText('IACT Dashboard')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<LogoBrand onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should call onClick on Enter key', () => {
    const onClick = jest.fn()
    render(<LogoBrand onClick={onClick} />)
    const button = screen.getByRole('button')
    fireEvent.keyPress(button, { key: 'Enter', charCode: 13 })
    expect(onClick).toHaveBeenCalled()
  })
})
