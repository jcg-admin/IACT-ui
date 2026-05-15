/**
 * exportUtils.js — IACT v2 (T5.4: movido de services/exportGateway.js)
 *
 * Utilidad client-side para exportación a Excel y PDF.
 * NO es un gateway de API — usa ExcelJS y jsPDF en el navegador.
 *
 * Proporciona:
 *   exportToExcel(data, options)     → XLSX via ExcelJS
 *   exportTableToPDF(element, opts)  → PDF via jsPDF + html2canvas
 *   exportToCSV(data, options)       → CSV (texto plano)
 *   validateExportData(data, columns)→ validación previa
 *   getFileNameWithTimestamp(name, ext) → nombre con timestamp
 *
 * Importar desde: @utils/exportUtils (no desde @api/exportGateway)
 */

import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Excel Export Service
 * Exports data to professional Excel files with styling
 */
export const exportToExcel = async (data, options = {}) => {
  try {
    const {
      fileName = 'export.xlsx',
      sheetName = 'Sheet1',
      headers = [],
      columns = [],
      title = '',
      timestamp = true,
    } = options

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // Add title if provided
    if (title) {
      worksheet.mergeCells('A1:Z1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value = title
      titleCell.font = {
        name: 'Arial',
        size: 14,
        bold: true,
        color: { argb: 'FF0EA5E9' }, // Cyan
      }
      titleCell.alignment = { horizontal: 'center', vertical: 'center' }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }, // Dark gray
      }
      worksheet.insertRows(1, 1)
    }

    // Add headers
    if (headers.length > 0) {
      const headerRow = worksheet.addRow(headers)
      headerRow.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }, // White
      }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0EA5E9' }, // Cyan
      }
      headerRow.alignment = { horizontal: 'center', vertical: 'center' }
      headerRow.height = 25
    }

    // Add data rows
    data.forEach((row) => {
      const values = columns.map((col) => {
        const value = row[col]
        // Format dates
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        // Format booleans
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No'
        }
        return value
      })
      const dataRow = worksheet.addRow(values)
      dataRow.font = { name: 'Arial', size: 10 }
      dataRow.alignment = { horizontal: 'left', vertical: 'center' }
      dataRow.height = 20
    })

    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0
        maxLength = Math.max(maxLength, cellLength)
      })
      column.width = Math.min(maxLength + 2, 50) // Cap at 50
    })

    // Add borders to all cells
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        }
      })
    })

    // Add timestamp if requested
    if (timestamp) {
      const lastRow = worksheet.lastRow.number + 2
      const timestampCell = worksheet.getCell(`A${lastRow}`)
      timestampCell.value = `Generated: ${new Date().toLocaleString()}`
      timestampCell.font = {
        name: 'Arial',
        size: 9,
        italic: true,
        color: { argb: 'FF6B7280' }, // Gray
      }
    }

    // Save file
    await workbook.xlsx.writeFile(fileName)

    return {
      success: true,
      message: `Excel file "${fileName}" downloaded successfully`,
      fileName,
    }
  } catch (error) {
    console.error('Excel export error:', error)
    return {
      success: false,
      message: `Error exporting to Excel: ${error.message}`,
      error,
    }
  }
}

/**
 * PDF Export Service
 * Exports table HTML to professional PDF
 */
export const exportTableToPDF = async (htmlElement, options = {}) => {
  try {
    const {
      fileName = 'export.pdf',
      title = '',
      orientation = 'portrait', // portrait | landscape
      format = 'a4', // a4, letter, etc.
    } = options

    // Capture HTML as canvas
    const canvas = await html2canvas(htmlElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = orientation === 'landscape' ? 297 : 210 // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = orientation === 'landscape' ? 210 : 297 // mm

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    })

    // Add title if provided
    if (title) {
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.text(title, 15, 15)
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(10)
    }

    // Add image to PDF
    const yOffset = title ? 25 : 10
    pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth - 20, imgHeight)

    // Add footer
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'italic')
      pdf.setTextColor(150)
      pdf.text(
        `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        10,
        pdf.internal.pageSize.getHeight() - 10
      )
    }

    // Save file
    pdf.save(fileName)

    return {
      success: true,
      message: `PDF file "${fileName}" downloaded successfully`,
      fileName,
    }
  } catch (error) {
    console.error('PDF export error:', error)
    return {
      success: false,
      message: `Error exporting to PDF: ${error.message}`,
      error,
    }
  }
}

/**
 * CSV Export Service
 * Simple CSV export (alternative to Excel)
 */
export const exportToCSV = (data, options = {}) => {
  try {
    const {
      fileName = 'export.csv',
      headers = [],
      columns = [],
    } = options

    // Create CSV content
    let csv = ''

    // Add headers
    if (headers.length > 0) {
      csv += headers.map((h) => `"${h}"`).join(',') + '\n'
    }

    // Add data rows
    data.forEach((row) => {
      const values = columns.map((col) => {
        let value = row[col]
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value === null || value === undefined) {
          return ''
        }
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""')
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value}"`
          }
          return value
        }
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return String(value)
      })
      csv += values.join(',') + '\n'
    })

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return {
      success: true,
      message: `CSV file "${fileName}" downloaded successfully`,
      fileName,
    }
  } catch (error) {
    console.error('CSV export error:', error)
    return {
      success: false,
      message: `Error exporting to CSV: ${error.message}`,
      error,
    }
  }
}

/**
 * Utility: Get file name with timestamp
 */
export const getFileNameWithTimestamp = (baseName, extension) => {
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${baseName}_${timestamp}${extension}`
}

/**
 * Utility: Validate data before export
 */
export const validateExportData = (data, columns) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      message: 'No data to export',
    }
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    return {
      valid: false,
      message: 'No columns specified',
    }
  }

  return { valid: true }
}
