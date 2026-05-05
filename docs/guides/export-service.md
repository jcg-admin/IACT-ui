/**
 * EXPORT SERVICE - USER GUIDE
 * 
 * Professional data export to Excel, PDF, and CSV formats
 * 
 * This guide shows how to implement data exports in any component
 */

// ═══════════════════════════════════════════════════════════════════════════
// QUICK START - Excel Export
// ═══════════════════════════════════════════════════════════════════════════

import { exportToExcel } from '@services/exportService'

// Simple Excel export
const handleExportExcel = async () => {
  const result = await exportToExcel(userData, {
    fileName: 'report.xlsx',
    sheetName: 'Sheet1',
    headers: ['ID', 'Name', 'Email'],
    columns: ['id', 'name', 'email'],
    title: 'User Report',
  })

  if (result.success) {
    console.log('File downloaded:', result.fileName)
  } else {
    console.error('Export failed:', result.message)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ═══════════════════════════════════════════════════════════════════════════

// 1. EXCEL EXPORT (Professional)
// ───────────────────────────────────────────────────────────────────────────

import { 
  exportToExcel, 
  getFileNameWithTimestamp,
  validateExportData 
} from '@services/exportService'

const handleExportExcel = async (data) => {
  // Validate before export
  const validation = validateExportData(data, ['id', 'name', 'email'])
  if (!validation.valid) {
    showError(validation.message)
    return
  }

  // Export with timestamp in filename
  const fileName = getFileNameWithTimestamp('users', '.xlsx')
  
  const result = await exportToExcel(data, {
    fileName,                    // Auto-generated: users_2024-01-15.xlsx
    sheetName: 'Users',          // Excel sheet name
    headers: [
      'ID',
      'Username',
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Date Joined',
    ],
    columns: [
      'id',
      'username',
      'email',
      'first_name',
      'last_name',
      'role',
      'date_joined',
    ],
    title: 'User Management Report', // Title in first row
    timestamp: true,             // Add timestamp in footer
  })

  if (result.success) {
    notify.success('Excel file downloaded successfully')
  }
}

// Result structure:
// {
//   success: true,
//   message: 'Excel file "users_2024-01-15.xlsx" downloaded successfully',
//   fileName: 'users_2024-01-15.xlsx'
// }

// 2. PDF EXPORT
// ───────────────────────────────────────────────────────────────────────────

import { exportTableToPDF } from '@services/exportService'

const handleExportPDF = async () => {
  // Need a reference to the table element
  const tableElement = document.querySelector('table')
  
  if (!tableElement) {
    showError('No table found to export')
    return
  }

  const fileName = getFileNameWithTimestamp('report', '.pdf')
  
  const result = await exportTableToPDF(tableElement, {
    fileName,
    title: 'User Management Report',
    orientation: 'landscape', // portrait | landscape
    format: 'a4',             // a4, letter, etc.
  })

  if (result.success) {
    notify.success('PDF file downloaded successfully')
  }
}

// Or with useRef (recommended):
const MyComponent = () => {
  const tableRef = useRef(null)

  const handleExportPDF = async () => {
    const result = await exportTableToPDF(tableRef.current, {
      fileName: 'report.pdf',
      title: 'My Report',
      orientation: 'landscape',
    })

    if (result.success) {
      notify.success('PDF downloaded')
    }
  }

  return (
    <div>
      <button onClick={handleExportPDF}>Export to PDF</button>
      <table ref={tableRef}>
        {/* table content */}
      </table>
    </div>
  )
}

// 3. CSV EXPORT (Simple)
// ───────────────────────────────────────────────────────────────────────────

import { exportToCSV } from '@services/exportService'

const handleExportCSV = () => {
  const fileName = getFileNameWithTimestamp('users', '.csv')
  
  const result = exportToCSV(data, {
    fileName,
    headers: ['ID', 'Name', 'Email'],
    columns: ['id', 'name', 'email'],
  })

  if (result.success) {
    notify.success('CSV file downloaded successfully')
  }
}

// CSV Features:
// ✅ Auto-escapes quotes ("text" becomes ""text"")
// ✅ Handles commas in data
// ✅ Formats dates
// ✅ Lightweight (no extra dependencies)

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE EXAMPLE - UserManagement Component
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react'
import { 
  exportToExcel, 
  exportToCSV, 
  exportTableToPDF,
  getFileNameWithTimestamp,
  validateExportData 
} from '@services/exportService'
import { useNotification } from '@services/notificationService'
import { AnimatedButton } from '@components/animations'

export default function UserManagement() {
  const [userData, setUserData] = useState([
    { id: 1, username: 'john_doe', email: 'john@example.com' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com' },
  ])
  const [exporting, setExporting] = useState(false)
  const tableRef = useRef(null)
  const notify = useNotification()

  const exportColumns = ['id', 'username', 'email']
  const exportHeaders = ['ID', 'Username', 'Email']

  const handleExportExcel = async () => {
    try {
      setExporting(true)

      // Validate
      const validation = validateExportData(userData, exportColumns)
      if (!validation.valid) {
        notify.warning(validation.message)
        return
      }

      // Export
      const fileName = getFileNameWithTimestamp('users', '.xlsx')
      const result = await exportToExcel(userData, {
        fileName,
        sheetName: 'Users',
        headers: exportHeaders,
        columns: exportColumns,
        title: 'User Report',
      })

      if (result.success) {
        notify.success('Excel exported successfully')
      } else {
        notify.error(result.message)
      }
    } catch (error) {
      notify.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true)

      const validation = validateExportData(userData, exportColumns)
      if (!validation.valid) {
        notify.warning(validation.message)
        return
      }

      if (tableRef.current) {
        const fileName = getFileNameWithTimestamp('users', '.pdf')
        const result = await exportTableToPDF(tableRef.current, {
          fileName,
          title: 'User Report',
          orientation: 'landscape',
        })

        if (result.success) {
          notify.success('PDF exported successfully')
        } else {
          notify.error(result.message)
        }
      }
    } catch (error) {
      notify.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = () => {
    try {
      setExporting(true)

      const validation = validateExportData(userData, exportColumns)
      if (!validation.valid) {
        notify.warning(validation.message)
        return
      }

      const fileName = getFileNameWithTimestamp('users', '.csv')
      const result = exportToCSV(userData, {
        fileName,
        headers: exportHeaders,
        columns: exportColumns,
      })

      if (result.success) {
        notify.success('CSV exported successfully')
      } else {
        notify.error(result.message)
      }
    } catch (error) {
      notify.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex gap-md mb-lg">
        <AnimatedButton 
          onClick={handleExportExcel}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Download Excel'}
        </AnimatedButton>
        <AnimatedButton 
          onClick={handleExportPDF}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Download PDF'}
        </AnimatedButton>
        <AnimatedButton 
          onClick={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Download CSV'}
        </AnimatedButton>
      </div>

      <table ref={tableRef}>
        <thead>
          <tr>
            {exportHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {userData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════

// 1. Always validate before export
const validation = validateExportData(data, columns)
if (!validation.valid) {
  showError(validation.message)
  return
}

// 2. Use getFileNameWithTimestamp for auto-timestamped names
const fileName = getFileNameWithTimestamp('report', '.xlsx')
// Result: report_2024-01-15.xlsx

// 3. Integrate with NotificationService
import { useNotification } from '@services/notificationService'

const notify = useNotification()

if (result.success) {
  notify.success('File downloaded')
} else {
  notify.error(result.message)
}

// 4. Show loading state during export
const [exporting, setExporting] = useState(false)

const handleExport = async () => {
  try {
    setExporting(true)
    // ... export code
  } finally {
    setExporting(false)
  }
}

// 5. Format data before export
const formatDataForExport = (rawData) => {
  return rawData.map((item) => ({
    ...item,
    date_joined: new Date(item.date_joined).toLocaleDateString(),
    is_active: item.is_active ? 'Yes' : 'No',
  }))
}

// 6. Use useRef for PDF export
const tableRef = useRef(null)
// ... 
<table ref={tableRef}>{/* content */}</table>
// ...
const result = await exportTableToPDF(tableRef.current, options)

// ═══════════════════════════════════════════════════════════════════════════
// STYLING & CUSTOMIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Excel styling is built-in:
// - Headers: cyan background (#0EA5E9), white text, bold
// - Borders: light gray (#D1D5DB)
// - Auto-sized columns
// - Date formatting
// - Timestamp in footer

// To customize Excel appearance, modify exportToExcel() in exportService.js:
// - Colors: Change headerRow.fill.fgColor
// - Fonts: Change headerRow.font
// - Cell formatting: Modify dataRow styling

// ═══════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ═══════════════════════════════════════════════════════════════════════════

// Issue: Excel file is corrupted
// Solution: Ensure all data is serializable (no functions, circular refs)

// Issue: PDF is blank
// Solution: Make sure table element exists and tableRef is properly set

// Issue: Columns are too wide
// Solution: Column width is auto-sized; max is 50 characters

// Issue: Performance is slow with large datasets (>10,000 rows)
// Solution: Consider paginating data or using server-side export

// ═══════════════════════════════════════════════════════════════════════════
// API REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * exportToExcel(data, options)
 * 
 * @param {Array} data - Array of objects to export
 * @param {Object} options - Configuration
 *   @param {string} fileName - Output file name (default: 'export.xlsx')
 *   @param {string} sheetName - Excel sheet name (default: 'Sheet1')
 *   @param {Array<string>} headers - Column headers
 *   @param {Array<string>} columns - Data keys to export
 *   @param {string} title - Report title
 *   @param {boolean} timestamp - Add timestamp (default: true)
 * 
 * @returns {Promise<Object>} { success, message, fileName, error? }
 */

/**
 * exportTableToPDF(htmlElement, options)
 * 
 * @param {HTMLElement} htmlElement - Table or div to export
 * @param {Object} options - Configuration
 *   @param {string} fileName - Output file name (default: 'export.pdf')
 *   @param {string} title - Report title
 *   @param {string} orientation - 'portrait' or 'landscape' (default: 'portrait')
 *   @param {string} format - Paper format (default: 'a4')
 * 
 * @returns {Promise<Object>} { success, message, fileName, error? }
 */

/**
 * exportToCSV(data, options)
 * 
 * @param {Array} data - Array of objects to export
 * @param {Object} options - Configuration
 *   @param {string} fileName - Output file name (default: 'export.csv')
 *   @param {Array<string>} headers - Column headers
 *   @param {Array<string>} columns - Data keys to export
 * 
 * @returns {Object} { success, message, fileName, error? }
 */

/**
 * getFileNameWithTimestamp(baseName, extension)
 * 
 * @param {string} baseName - Base file name (e.g., 'report')
 * @param {string} extension - File extension (e.g., '.xlsx')
 * 
 * @returns {string} File name with timestamp (e.g., 'report_2024-01-15.xlsx')
 */

/**
 * validateExportData(data, columns)
 * 
 * @param {Array} data - Data to validate
 * @param {Array<string>} columns - Column names to validate
 * 
 * @returns {Object} { valid, message? }
 */

// ═══════════════════════════════════════════════════════════════════════════
