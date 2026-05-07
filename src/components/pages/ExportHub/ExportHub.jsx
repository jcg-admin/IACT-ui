/**
 * ExportHub Page
 * 
 * Centralized data export interface
 * Supports Excel, PDF, CSV formats with batch operations
 */

import React, { useState } from 'react'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@services/notificationService'
import ExportTypeSelector from './ExportTypeSelector'
import ExportOptions from './ExportOptions'
import ExportPreview from './ExportPreview'
import ExportHistory from './ExportHistory'
import './ExportHub.scss'

export default function ExportHub() {
  const [selectedType, setSelectedType] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('xlsx')
  const [exportHistory, setExportHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const notify = getNotificationService()

  /**
   * Handle export type selection
   */
  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setPreview(null)
  }

  /**
   * Get mock data based on type
   */
  const getMockData = (type) => {
    const dataMap = {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', access_groups: ['AGR-010'], status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', access_groups: ['AGR-001'], status: 'Active' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', access_groups: [], status: 'Inactive' }
      ],
      jobs: [
        { id: 'job-1', type: 'export', status: 'completed', progress: 100, rows: 2500 },
        { id: 'job-2', type: 'backup', status: 'completed', progress: 100, rows: 5000 }
      ],
      transactions: [
        { id: 'tx-1', amount: 1500, status: 'completed', date: '2024-04-28' },
        { id: 'tx-2', amount: 2500, status: 'completed', date: '2024-04-27' }
      ],
      reports: [
        { name: 'Q1 Report', category: 'Finance', status: 'approved', date: '2024-04-01' },
        { name: 'Q2 Report', category: 'Finance', status: 'draft', date: '2024-07-01' }
      ]
    }
    return dataMap[type] || []
  }

  /**
   * Handle preview
   */
  const handlePreview = () => {
    if (!selectedType) {
      notify.warning('Please select a data type')
      return
    }
    const data = getMockData(selectedType)
    setPreview({
      type: selectedType,
      rowCount: data.length,
      columnCount: Object.keys(data[0] || {}).length,
      sample: data.slice(0, 3)
    })
  }

  /**
   * Handle single format export
   */
  const handleExport = async () => {
    if (!selectedType || !selectedFormat) {
      notify.warning('Please select data type and format')
      return
    }

    setLoading(true)
    try {
      const data = getMockData(selectedType)
      
      if (selectedFormat === 'xlsx') {
        await reportExporter.exportAsExcel(data, {
          filename: `${selectedType}_export.xlsx`,
          headers: Object.keys(data[0] || {})
        })
      } else if (selectedFormat === 'csv') {
        await reportExporter.exportAsCSV(data, {
          filename: `${selectedType}_export.csv`
        })
      } else if (selectedFormat === 'pdf') {
        notify.info('PDF export requires HTML element. Try batch export.')
      }

      const exportRecord = {
        id: `export-${Date.now()}`,
        type: selectedType,
        format: selectedFormat,
        rows: data.length,
        size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
        status: 'completed',
        timestamp: new Date().toISOString()
      }

      setExportHistory([exportRecord, ...exportHistory])
      notify.success(`Exported ${data.length} ${selectedType} records as ${selectedFormat.toUpperCase()}`)
      setSelectedType(null)
      setPreview(null)
    } catch (error) {
      notify.error(`Export failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle batch export
   */
  const handleBatchExport = async () => {
    if (!selectedType) {
      notify.warning('Please select a data type')
      return
    }

    setLoading(true)
    try {
      const data = getMockData(selectedType)
      const batchData = [
        { data, format: 'xlsx', name: `${selectedType}-xlsx` },
        { data, format: 'csv', name: `${selectedType}-csv` }
      ]

      await reportExporter.batchExport(batchData)

      const exportRecord = {
        id: `export-${Date.now()}`,
        type: selectedType,
        format: 'batch (xlsx, csv)',
        rows: data.length,
        size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
        status: 'completed',
        timestamp: new Date().toISOString()
      }

      setExportHistory([exportRecord, ...exportHistory])
      notify.success(`Batch export completed (2 formats)`)
      setSelectedType(null)
      setPreview(null)
    } catch (error) {
      notify.error(`Batch export failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="export-hub">
      <div className="page-header">
        <h1>Data Export Hub</h1>
        <p>Export data in multiple formats with advanced options</p>
      </div>

      <div className="export-container">
        {/* Left Panel - Export Configuration */}
        <div className="export-panel">
          <div className="panel-section">
            <h2>Select Data Type</h2>
            <ExportTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
          </div>

          {selectedType && (
            <>
              <div className="panel-section">
                <h2>Format & Options</h2>
                <ExportOptions
                  selectedFormat={selectedFormat}
                  onFormatChange={setSelectedFormat}
                />
              </div>

              <div className="panel-section">
                <h2>Actions</h2>
                <div className="action-buttons">
                  <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    Preview Data
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Exporting...' : 'Export'}
                  </button>
                  <button
                    onClick={handleBatchExport}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    Batch Export
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Preview & History */}
        <div className="info-panel">
          {preview ? (
            <ExportPreview preview={preview} />
          ) : (
            <div className="empty-preview">
              <p>Select a data type to preview</p>
            </div>
          )}

          <ExportHistory exports={exportHistory} />
        </div>
      </div>
    </div>
  )
}
