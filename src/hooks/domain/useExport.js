/**
 * useExport Hook - DRY Export Logic
 * 
 * Abstracts all export functionality into a single reusable hook
 * Handles: validation, export, notifications, loading state, error handling
 * 
 * Usage:
 *   const { 
 *     handleExportExcel, 
 *     handleExportPDF, 
 *     handleExportCSV,
 *     exporting 
 *   } = useExport(data, {
 *     exportName: 'users',
 *     headers: ['ID', 'Name'],
 *     columns: ['id', 'name'],
 *     title: 'User Report'
 *   })
 */

import { useState, useRef, useCallback } from 'react'
import { 
  exportToExcel, 
  exportToCSV, 
  exportTableToPDF,
  getFileNameWithTimestamp,
  validateExportData 
} from '@api/exportGateway'
import { useNotification } from '@api/notificationGateway'

/**
 * useExport Hook
 * 
 * @param {Array} data - Data to export
 * @param {Object} config - Export configuration
 *   @param {string} config.exportName - Base name for files (e.g., 'users')
 *   @param {Array<string>} config.headers - Column headers
 *   @param {Array<string>} config.columns - Data keys to export
 *   @param {string} config.title - Report title (optional)
 *   @param {string} config.sheetName - Excel sheet name (default: 'Sheet1')
 * 
 * @returns {Object} Export handlers and state
 *   @returns {Function} handleExportExcel - Export to Excel
 *   @returns {Function} handleExportPDF - Export to PDF
 *   @returns {Function} handleExportCSV - Export to CSV
 *   @returns {boolean} exporting - Loading state
 *   @returns {React.RefObject} tableRef - For PDF table capture
 */
export const useExport = (data, config = {}) => {
  const {
    exportName = 'export',
    headers = [],
    columns = [],
    title = '',
    sheetName = 'Sheet1',
  } = config

  const [exporting, setExporting] = useState(false)
  const tableRef = useRef(null)
  const notify = useNotification()

  // Validate export configuration
  const validateConfig = useCallback(() => {
    if (!exportName) {
      notify.warning('Export name not specified')
      return false
    }

    const dataValidation = validateExportData(data, columns)
    if (!dataValidation.valid) {
      notify.warning(dataValidation.message)
      return false
    }

    return true
  }, [data, columns, exportName, notify])

  // Export to Excel
  const handleExportExcel = useCallback(async () => {
    if (!validateConfig()) return

    try {
      setExporting(true)

      const fileName = getFileNameWithTimestamp(exportName, '.xlsx')
      const result = await exportToExcel(data, {
        fileName,
        sheetName,
        headers,
        columns,
        title,
        timestamp: true,
      })

      if (result.success) {
        notify.success(`${exportName} exported to Excel successfully`)
      } else {
        notify.error(result.message)
      }

      return result
    } catch (error) {
      console.error('Excel export error:', error)
      notify.error('Error exporting to Excel')
      return { success: false, error }
    } finally {
      setExporting(false)
    }
  }, [validateConfig, data, exportName, sheetName, headers, columns, title, notify])

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    if (!validateConfig()) return

    try {
      setExporting(true)

      if (!tableRef.current) {
        notify.warning('Table not found for PDF export')
        return { success: false }
      }

      const fileName = getFileNameWithTimestamp(exportName, '.pdf')
      const result = await exportTableToPDF(tableRef.current, {
        fileName,
        title,
        orientation: 'landscape',
      })

      if (result.success) {
        notify.success(`${exportName} exported to PDF successfully`)
      } else {
        notify.error(result.message)
      }

      return result
    } catch (error) {
      console.error('PDF export error:', error)
      notify.error('Error exporting to PDF')
      return { success: false, error }
    } finally {
      setExporting(false)
    }
  }, [validateConfig, exportName, title, notify])

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (!validateConfig()) return

    try {
      setExporting(true)

      const fileName = getFileNameWithTimestamp(exportName, '.csv')
      const result = exportToCSV(data, {
        fileName,
        headers,
        columns,
      })

      if (result.success) {
        notify.success(`${exportName} exported to CSV successfully`)
      } else {
        notify.error(result.message)
      }

      setExporting(false)
      return result
    } catch (error) {
      console.error('CSV export error:', error)
      notify.error('Error exporting to CSV')
      setExporting(false)
      return { success: false, error }
    }
  }, [validateConfig, data, exportName, headers, columns, notify])

  return {
    handleExportExcel,
    handleExportPDF,
    handleExportCSV,
    exporting,
    tableRef,
  }
}

export default useExport
