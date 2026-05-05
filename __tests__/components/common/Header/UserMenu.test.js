import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../../../../src/components/common/Header/UserMenu'

describe('UserMenu Component', () => {
  const mockUserInfo = {
    name: 'John Doe',
    email: 'john@example.com',
  }

  it('should render user menu with name', () => {
    render(<UserMenu userInfo={mockUserInfo} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('should toggle dropdown on click', () => {
    render(<UserMenu userInfo={mockUserInfo} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    // Should show user email in dropdown
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should display user email in dropdown', () => {
    render(<UserMenu userInfo={mockUserInfo} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should call onLogout when logout is clicked', () => {
    const onLogout = jest.fn()
    render(<UserMenu userInfo={mockUserInfo} onLogout={onLogout} />)
    
    fireEvent.click(screen.getByRole('button'))
    const logoutBtn = screen.getByText('🚪 Logout')
    fireEvent.click(logoutBtn)
    
    expect(onLogout).toHaveBeenCalled()
  })

  it('should call onSettings when settings is clicked', () => {
    const onSettings = jest.fn()
    render(<UserMenu userInfo={mockUserInfo} onSettings={onSettings} />)
    
    fireEvent.click(screen.getByRole('button'))
    const settingsBtn = screen.getByText('⚙️ Settings')
    fireEvent.click(settingsBtn)
    
    expect(onSettings).toHaveBeenCalled()
  })
})
