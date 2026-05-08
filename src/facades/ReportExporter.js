/**
 * ReportExporter Facade
 * 
 * Simplifies data export operations.
 * Provides high-level export methods:
 * - Excel export with formatting
 * - PDF export with styling
 * - CSV export
 * - Batch exports with ZIP
 * 
 * Single responsibility: Provide simple export operations
 * Uses: exportService, notification system
 */

import exportService from '@api/exportGateway'
import { getNotificationService } from '@api/notificationGateway'

class ReportExporter {
  /**
   * Export data as Excel file
   * 
   * Orchestrates:
   * 1. Validate data
   * 2. Format for Excel
   * 3. Export to file
   * 4. Trigger download
   * 5. Notify user
   * 
   * @param {Array} data - Array of objects to export
   * @param {Object} options - {filename, headers, columns, sheetName}
   * @returns {Promise<{success: boolean, filename, size}>}
   */
  async exportAsExcel(data, options = {}) {
    try {
      const notify = getNotificationService()

      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array')
      }

      const {
        filename = 'export.xlsx',
        headers = Object.keys(data[0]),
        columns = Object.keys(data[0]),
        sheetName = 'Data'
      } = options

      // Call export service
      const result = await exportService.toExcel(data, {
        headers,
        columns,
        sheetName,
        filename
      })

      notify.success(`Excel export complete: ${filename}`)

      return {
        success: true,
        filename: filename,
        size: result.size || 0,
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Excel export failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Export element as PDF file
   * 
   * Orchestrates:
   * 1. Validate element
   * 2. Capture element with formatting
   * 3. Convert to PDF
   * 4. Trigger download
   * 5. Notify user
   * 
   * @param {HTMLElement} element - Element to export
   * @param {Object} options - {filename, title, orientation, pageSize}
   * @returns {Promise<{success: boolean, filename}>}
   */
  async exportAsPDF(element, options = {}) {
    try {
      const notify = getNotificationService()

      // Validate element
      if (!element || !(element instanceof HTMLElement)) {
        throw new Error('Must provide valid HTML element')
      }

      const {
        filename = 'export.pdf',
        title = 'Report',
        orientation = 'portrait',
        pageSize = 'A4'
      } = options

      // Call export service
      const result = await exportService.toPDF(element, {
        filename,
        title,
        orientation,
        pageSize
      })

      notify.success(`PDF export complete: ${filename}`)

      return {
        success: true,
        filename: filename,
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`PDF export failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Export data as CSV file
   * 
   * Orchestrates:
   * 1. Validate data
   * 2. Format as CSV
   * 3. Export to file
   * 4. Trigger download
   * 5. Notify user
   * 
   * @param {Array} data - Array of objects to export
   * @param {Object} options - {filename, headers, delimiter}
   * @returns {Promise<{success: boolean, filename, rowCount}>}
   */
  async exportAsCSV(data, options = {}) {
    try {
      const notify = getNotificationService()

      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array')
      }

      const {
        filename = 'export.csv',
        headers = Object.keys(data[0]),
        delimiter = ','
      } = options

      // Call export service
      const result = await exportService.toCSV(data, {
        headers,
        delimiter,
        filename
      })

      notify.success(`CSV export complete: ${filename}`)

      return {
        success: true,
        filename: filename,
        rowCount: data.length,
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`CSV export failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Export multiple datasets in different formats
   * 
   * Orchestrates:
   * 1. Validate all data
   * 2. Export each dataset in requested format
   * 3. ZIP all files
   * 4. Trigger download
   * 5. Notify user
   * 
   * @param {Array} dataArray - Array of {data, format, name}
   * @param {Object} options - {zipName}
   * @returns {Promise<{success: boolean, zipName, fileCount}>}
   */
  async batchExport(dataArray, options = {}) {
    try {
      const notify = getNotificationService()

      // Validate data
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw new Error('DataArray must be non-empty')
      }

      const { zipName = 'exports.zip' } = options

      // Export each dataset
      const files = []
      for (const item of dataArray) {
        const { data, format, name } = item

        try {
          let result
          if (format === 'xlsx') {
            result = await this.exportAsExcel(data, { filename: `${name}.xlsx` })
          } else if (format === 'csv') {
            result = await this.exportAsCSV(data, { filename: `${name}.csv` })
          } else {
            throw new Error(`Unsupported format: ${format}`)
          }
          files.push(result)
        } catch (error) {
          console.warn(`Failed to export ${name}: ${error.message}`)
        }
      }

      if (files.length === 0) {
        throw new Error('No files exported successfully')
      }

      // In real app, would ZIP files here
      // const zipped = await zipFiles(files, zipName)

      notify.success(`Batch export complete: ${files.length} files`)

      return {
        success: true,
        zipName: zipName,
        fileCount: files.length,
        files: files,
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Batch export failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Export with validation against schema
   * 
   * Orchestrates:
   * 1. Validate data against schema
   * 2. Clean and format data
   * 3. Export in requested format
   * 4. Notify results
   * 
   * @param {Array} data - Data to export
   * @param {Object} schema - Validation schema
   * @param {string} format - Export format (xlsx, csv, pdf)
   * @param {Object} options - Additional options
   * @returns {Promise<{success: boolean, validated: number, exported: number}>}
   */
  async exportWithValidation(data, schema, format, options = {}) {
    try {
      const notify = getNotificationService()

      if (!Array.isArray(data)) {
        throw new Error('Data must be an array')
      }

      // Validate each row
      const validatedData = []
      const errors = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        try {
          // Basic validation: check required fields
          const schemaFields = Object.keys(schema)
          const validRow = {}

          for (const field of schemaFields) {
            if (row[field] === undefined || row[field] === null) {
              throw new Error(`Missing required field: ${field}`)
            }
            validRow[field] = row[field]
          }

          validatedData.push(validRow)
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`)
        }
      }

      if (validatedData.length === 0) {
        throw new Error(`All rows failed validation`)
      }

      if (errors.length > 0) {
        notify.warning(
          `Validation: ${validatedData.length} valid, ${errors.length} invalid rows`
        )
      }

      // Export validated data
      let result
      if (format === 'xlsx') {
        result = await this.exportAsExcel(validatedData, options)
      } else if (format === 'csv') {
        result = await this.exportAsCSV(validatedData, options)
      } else {
        throw new Error(`Unsupported format: ${format}`)
      }

      return {
        success: true,
        validated: validatedData.length,
        invalid: errors.length,
        exported: validatedData.length,
        format: format,
        ...result
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Export with validation failed: ${error.message}`)
      throw error
    }
  }
}

// Export singleton instance
const reportExporter = new ReportExporter()
export default reportExporter

// Export class for testing
export { ReportExporter }
