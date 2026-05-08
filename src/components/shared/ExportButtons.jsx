/**
 * ExportButtons Component - DRY Reusable Export UI
 * 
 * Provides Excel, PDF, and CSV export buttons with minimal configuration
 * 
 * Usage:
 *   <ExportButtons
 *     data={users}
 *     exportName="users"
 *     headers={['ID', 'Name', 'Email']}
 *     columns={['id', 'name', 'email']}
 *     tableRef={tableRef}
 *     title="User Report"
 *   />
 */

import React from 'react'
import { AnimatedButton } from '@ui/animations'
import { useExport } from '@hooks/domain/useExport'

/**
 * ExportButtons Component
 * 
 * @param {Object} props
 * @param {Array} props.data - Data to export
 * @param {string} props.exportName - Base name for exported files
 * @param {Array<string>} props.headers - Column headers
 * @param {Array<string>} props.columns - Data column names
 * @param {React.RefObject} props.tableRef - Reference to table element (for PDF)
 * @param {string} props.title - Report title (optional)
 * @param {string} props.variant - Button variant (default: 'secondary')
 * @param {boolean} props.showExcel - Show Excel button (default: true)
 * @param {boolean} props.showPDF - Show PDF button (default: true)
 * @param {boolean} props.showCSV - Show CSV button (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gap - Gap between buttons (default: 'gap-md')
 * 
 * @returns {React.ReactElement} Export button group
 * 
 * Example:
 *   const tableRef = useRef(null)
 *   return (
 *     <div>
 *       <ExportButtons
 *         data={userData}
 *         exportName="users"
 *         headers={['ID', 'Username', 'Email']}
 *         columns={['id', 'username', 'email']}
 *         tableRef={tableRef}
 *         title="User Management Report"
 *       />
 *       <table ref={tableRef}>
 *         {(table content)}
 *       </table>
 *     </div>
 *   )
 */
export default function ExportButtons({
  data,
  exportName,
  headers,
  columns,
  tableRef,
  title = '',
  variant = 'secondary',
  showExcel = true,
  showPDF = true,
  showCSV = true,
  className = '',
  gap = 'gap-md',
}) {
  const {
    handleExportExcel,
    handleExportPDF,
    handleExportCSV,
    exporting,
  } = useExport(data, {
    exportName,
    headers,
    columns,
    title,
  })

  // Override tableRef in the hook's return (not ideal but works)
  // Better approach: pass tableRef to useExport
  // For now, we'll use the tableRef passed as prop for PDF
  const handleExportPDFWithTable = async () => {
    if (!tableRef?.current) {
      return
    }
    return handleExportPDF()
  }

  return (
    <div className={`flex ${gap} ${className}`}>
      {showExcel && (
        <AnimatedButton
          variant={variant}
          onClick={handleExportExcel}
          disabled={exporting}
          title="Download as Excel spreadsheet"
        >
          {exporting ? 'Exporting...' : 'Excel'}
        </AnimatedButton>
      )}

      {showPDF && (
        <AnimatedButton
          variant={variant}
          onClick={handleExportPDFWithTable}
          disabled={exporting}
          title="Download as PDF document"
        >
          {exporting ? 'Exporting...' : 'PDF'}
        </AnimatedButton>
      )}

      {showCSV && (
        <AnimatedButton
          variant={variant}
          onClick={handleExportCSV}
          disabled={exporting}
          title="Download as CSV file"
        >
          {exporting ? 'Exporting...' : 'CSV'}
        </AnimatedButton>
      )}
    </div>
  )
}

/**
 * Minimal Version - Just Excel + PDF
 * 
 * Usage:
 *   <ExportButtons
 *     data={data}
 *     exportName="report"
 *     headers={headers}
 *     columns={columns}
 *     tableRef={tableRef}
 *     showCSV={false}
 *   />
 */

/**
 * Single Format Version - Just Excel
 * 
 * Usage:
 *   <ExportButtons
 *     data={data}
 *     exportName="report"
 *     headers={headers}
 *     columns={columns}
 *     showPDF={false}
 *     showCSV={false}
 *   />
 */
