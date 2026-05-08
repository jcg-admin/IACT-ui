/**
 * useExport Hook Tests
 * Tests for the DRY export hook
 */

import { renderHook, act } from '@testing-library/react'
import { useExport } from '../domain/useExport'

// Mock dependencies
jest.mock('@api/exportGateway', () => ({
  exportToExcel: jest.fn().mockResolvedValue({ success: true }),
  exportToCSV: jest.fn().mockReturnValue({ success: true }),
  exportTableToPDF: jest.fn().mockResolvedValue({ success: true }),
  getFileNameWithTimestamp: jest.fn().mockReturnValue('report_2024-01-15.xlsx'),
  validateExportData: jest.fn().mockReturnValue({ valid: true }),
}))

jest.mock('@api/notificationGateway', () => ({
  useNotification: jest.fn().mockReturnValue({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  }),
}))

describe('useExport Hook', () => {
  const mockData = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ]

  const mockConfig = {
    exportName: 'users',
    headers: ['ID', 'Name', 'Email'],
    columns: ['id', 'name', 'email'],
    title: 'User Report',
  }

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useExport(mockData, mockConfig))

    expect(result.current.exporting).toBe(false)
    expect(result.current.tableRef).toBeDefined()
    expect(typeof result.current.handleExportExcel).toBe('function')
    expect(typeof result.current.handleExportPDF).toBe('function')
    expect(typeof result.current.handleExportCSV).toBe('function')
  })

  it('should export to Excel', async () => {
    const { result } = renderHook(() => useExport(mockData, mockConfig))

    await act(async () => {
      await result.current.handleExportExcel()
    })

    expect(result.current.exporting).toBe(false)
  })

  it('should export to CSV', async () => {
    const { result } = renderHook(() => useExport(mockData, mockConfig))

    await act(async () => {
      result.current.handleExportCSV()
    })

    expect(result.current.exporting).toBe(false)
  })

  it('should export to PDF', async () => {
    const { result } = renderHook(() => useExport(mockData, mockConfig))

    await act(async () => {
      await result.current.handleExportPDF()
    })

    expect(result.current.exporting).toBe(false)
  })

  it('should handle export with default config', () => {
    const { result } = renderHook(() => useExport(mockData))

    expect(result.current).toBeDefined()
    expect(result.current.exporting).toBe(false)
  })

  it('should validate data before export', async () => {
    const { validateExportData } = require('@api/exportGateway')
    validateExportData.mockReturnValue({ valid: false, message: 'No data' })

    const { result } = renderHook(() => useExport([], mockConfig))

    await act(async () => {
      await result.current.handleExportExcel()
    })

    expect(result.current.exporting).toBe(false)
  })

  it('should provide table ref for PDF', () => {
    const { result } = renderHook(() => useExport(mockData, mockConfig))

    expect(result.current.tableRef).toBeDefined()
    expect(result.current.tableRef.current).toBe(null)
  })
})
