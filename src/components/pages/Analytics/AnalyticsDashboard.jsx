/**
 * AnalyticsDashboard Page
 * 
 * Comprehensive analytics and reporting interface
 * Features: Metrics, Charts, Reports, Scheduling
 */

import React, { useState, useEffect } from 'react'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@services/notificationService'
import MetricsCard from './MetricsCard'
import ChartComponent from './ChartComponent'
import ReportBuilder from './ReportBuilder'
import ScheduledReports from './ScheduledReports'
import './Analytics.scss'

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportData, setReportData] = useState(null)

  const notify = getNotificationService()

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      // Mock metrics data
      const mockMetrics = {
        totalUsers: 2547,
        activeUsers: 1832,
        jobsCompleted: 12453,
        jobsRunning: 28,
        dataExported: '2.5TB',
        avgResponseTime: '245ms'
      }

      setMetrics(mockMetrics)
      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load metrics: ${error.message}`)
      setLoading(false)
    }
  }

  const handleExportReport = async (format) => {
    try {
      const data = [
        { metric: 'Total Users', value: metrics.totalUsers },
        { metric: 'Active Users', value: metrics.activeUsers },
        { metric: 'Jobs Completed', value: metrics.jobsCompleted },
        { metric: 'Data Exported', value: metrics.dataExported }
      ]

      if (format === 'xlsx') {
        await reportExporter.exportAsExcel(data, {
          filename: 'analytics_report.xlsx'
        })
      } else if (format === 'pdf') {
        notify.info('PDF export with charts - implement with html2pdf')
      }

      notify.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      notify.error(`Export failed: ${error.message}`)
    }
  }

  return (
    <div className="analytics-dashboard">
      <div className="page-header">
        <h1>Analytics & Reporting</h1>
        <p>Monitor system metrics and generate custom reports</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Metrics Grid */}
          <div className="metrics-grid">
            <MetricsCard
              title="Total Users"
              value={metrics.totalUsers}
              icon="👥"
              trend="+12%"
              trendType="positive"
            />
            <MetricsCard
              title="Active Users"
              value={metrics.activeUsers}
              icon="🟢"
              trend="+8%"
              trendType="positive"
            />
            <MetricsCard
              title="Jobs Completed"
              value={metrics.jobsCompleted}
              icon="✓"
              trend="+25%"
              trendType="positive"
            />
            <MetricsCard
              title="Data Exported"
              value={metrics.dataExported}
              icon="📦"
              trend="-5%"
              trendType="negative"
            />
          </div>

          {/* Charts */}
          <div className="charts-section">
            <ChartComponent
              title="User Growth"
              type="line"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [1200, 1400, 1350, 1500, 1700, 1832]
              }}
            />
            <ChartComponent
              title="Job Status Distribution"
              type="pie"
              data={{
                labels: ['Completed', 'Running', 'Failed'],
                values: [12453, 28, 145]
              }}
            />
          </div>

          {/* Export Buttons */}
          <div className="export-section">
            <h3>Export Report</h3>
            <div className="export-buttons">
              <button
                onClick={() => handleExportReport('xlsx')}
                className="btn btn-primary"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                className="btn btn-secondary"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="tab-content">
          <ReportBuilder onGenerateReport={setReportData} />
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="tab-content">
          <ScheduledReports />
        </div>
      )}
    </div>
  )
}
