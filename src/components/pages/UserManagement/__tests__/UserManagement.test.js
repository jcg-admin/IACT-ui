/**
 * UserManagement Tests
 * 
 * Simple tests for user management functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserManagement from '../UserManagement'

// Mock façades before importing component
jest.mock('@facades/UserAuth', () => ({
  default: {
    startSession: jest.fn().mockResolvedValue({ user_id: 'test' }),
    createAccount: jest.fn().mockResolvedValue({ user_id: 'new', username: 'newuser' }),
    loadProfile: jest.fn().mockResolvedValue({ user_id: 'test', username: 'testuser' }),
    endSession: jest.fn().mockResolvedValue(true),
    refreshSession: jest.fn().mockResolvedValue({ is_valid: true })
  }
}))

jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    exportAsPDF: jest.fn().mockResolvedValue({ success: true }),
    exportAsCSV: jest.fn().mockResolvedValue({ success: true }),
    batchExport: jest.fn().mockResolvedValue({ success: true })
  }
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }))
}))

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    render(<UserManagement />)
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('should render create button', () => {
    render(<UserManagement />)
    expect(screen.getByText('Create User')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<UserManagement />)
    expect(screen.getByPlaceholderText(/Search by username/)).toBeInTheDocument()
  })

  it('should load users on mount', async () => {
    render(<UserManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })
  })

  it('should filter users on search', async () => {
    render(<UserManagement />)
    
    const searchInput = screen.getByPlaceholderText(/Search by username/)
    fireEvent.change(searchInput, { target: { value: 'john' } })
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })
  })

  it('should show form when Create User clicked', () => {
    render(<UserManagement />)
    
    const createButton = screen.getByText('Create User')
    fireEvent.click(createButton)
    
    expect(screen.getByText('Create New User')).toBeInTheDocument()
  })

  it('should display results counter', async () => {
    render(<UserManagement />)
    
    await waitFor(() => {
      expect(screen.getByText(/Showing.*users/)).toBeInTheDocument()
    })
  })
})
