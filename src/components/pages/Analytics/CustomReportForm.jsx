/**
 * CustomReportForm Component
 * 
 * Create custom reports with filters
 */

import React, { useState } from 'react'
import { getNotificationService } from '@api/notificationGateway'
import PropTypes from 'prop-types'

export default function CustomReportForm({ onGenerateReport }) {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    type: 'summary',
    dateRange: 'last30days',
    metrics: ['users', 'jobs']
  })

  const notify = getNotificationService()

  const handleGenerateReport = async () => {
    if (!reportConfig.name) {
      notify.warning('Please enter report name')
      return
    }

    const report = {
      id: `report-${Date.now()}`,
      name: reportConfig.name,
      type: reportConfig.type,
      createdAt: new Date().toISOString(),
      metrics: reportConfig.metrics
    }

    onGenerateReport(report)
    notify.success(`Report "${reportConfig.name}" generated`)
  }

  return (
    <div className="report-builder">
      <h2>Create Custom Report</h2>

      <div className="form-group">
        <label>Report Name</label>
        <input
          type="text"
          value={reportConfig.name}
          onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
          placeholder="E.g., Monthly Performance Report"
        />
      </div>

      <div className="form-group">
        <label>Report Type</label>
        <select
          value={reportConfig.type}
          onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
        >
          <option value="summary">Summary</option>
          <option value="detailed">Detailed</option>
          <option value="comparative">Comparative</option>
          <option value="trend">Trend Analysis</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date Range</label>
        <select
          value={reportConfig.dateRange}
          onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="lastquarter">Last Quarter</option>
          <option value="lastyear">Last Year</option>
        </select>
      </div>

      <div className="form-group">
        <label>Metrics to Include</label>
        <div className="checkboxes">
          {['users', 'jobs', 'exports', 'performance'].map(metric => (
            <label key={metric}>
              <input
                type="checkbox"
                checked={reportConfig.metrics.includes(metric)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setReportConfig({
                      ...reportConfig,
                      metrics: [...reportConfig.metrics, metric]
                    })
                  } else {
                    setReportConfig({
                      ...reportConfig,
                      metrics: reportConfig.metrics.filter(m => m !== metric)
                    })
                  }
                }}
              />
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleGenerateReport} className="btn btn-primary">
        Generate Report
      </button>
    </div>
  )
}
CustomReportForm.propTypes = {
  onGenerateReport: PropTypes.func.isRequired,
}
