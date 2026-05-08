/**
 * AnalyticsDashboard Page
 *
 * Panel de análisis y reportes del sistema.
 * Métricas en tiempo real vía Redux + WebSocket.
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@services/notificationGateway'
import { getWebSocketService } from '@services/websocketGateway'
import {
  fetchDashboardMetrics,
  fetchReportHistory,
  updateMetrics,
  selectMetrics,
  selectReportHistory,
  selectReportsLoading,
} from '../../../redux/slices/reports'
import MetricsCard from './MetricsCard'
import ChartComponent from './ChartComponent'
import CustomReportForm from './CustomReportForm'
import ScheduledReports from './ScheduledReports'
import './Analytics.scss'

export default function AnalyticsDashboard() {
  const dispatch = useDispatch()
  const metrics = useSelector(selectMetrics)
  const reportHistory = useSelector(selectReportHistory)
  const loading = useSelector(selectReportsLoading)

  const [activeTab, setActiveTab] = useState('overview')
  const [reportData, setReportData] = useState(null)

  const notify = getNotificationService()

  useEffect(() => {
    dispatch(fetchDashboardMetrics()).catch((err) => {
      notify.error(`Error al cargar métricas: ${err.message}`)
    })
    dispatch(fetchReportHistory())
  }, [dispatch])

  // T-023: WebSocket — suscribir al canal "metrics" en mount, desuscribir en unmount
  useEffect(() => {
    const ws = getWebSocketService(process.env.REACT_APP_WS_URL)
    const unsubscribe = ws.on('metrics', (data) => {
      dispatch(updateMetrics(data))
    })
    return () => {
      unsubscribe()
    }
  }, [dispatch])

  const handleExportReport = async (format) => {
    try {
      const data = metrics
        ? [
            { metric: 'Total Users', value: metrics.totalUsers },
            { metric: 'Active Users', value: metrics.activeUsers },
            { metric: 'Jobs Completed', value: metrics.jobsCompleted },
            { metric: 'Data Exported', value: metrics.dataExported },
          ]
        : []

      if (format === 'xlsx') {
        await reportExporter.exportAsExcel(data, {
          filename: 'analytics_report.xlsx',
        })
      } else if (format === 'pdf') {
        notify.info('Exportación PDF con gráficos — implementar con html2pdf')
      }

      notify.success(`Reporte exportado como ${format.toUpperCase()}`)
    } catch (error) {
      notify.error(`Error al exportar: ${error.message}`)
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
        <button
          role="tab"
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {loading && <div className="loading-overlay">Cargando métricas...</div>}

          {/* Metrics Grid */}
          <div className="metrics-grid">
            <MetricsCard
              title="Total Users"
              value={metrics?.totalUsers}
              icon="👥"
              trend="+12%"
              trendType="positive"
            />
            <MetricsCard
              title="Active Users"
              value={metrics?.activeUsers}
              icon="🟢"
              trend="+8%"
              trendType="positive"
            />
            <MetricsCard
              title="Jobs Completed"
              value={metrics?.jobsCompleted}
              icon="✓"
              trend="+25%"
              trendType="positive"
            />
            <MetricsCard
              title="Data Exported"
              value={metrics?.dataExported}
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
                values: [1200, 1400, 1350, 1500, 1700, metrics?.activeUsers ?? 0],
              }}
            />
            <ChartComponent
              title="Job Status Distribution"
              type="pie"
              data={{
                labels: ['Completed', 'Running', 'Failed'],
                values: [metrics?.jobsCompleted ?? 0, metrics?.jobsRunning ?? 0, 145],
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
          <CustomReportForm onGenerateReport={setReportData} />
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="tab-content">
          <ScheduledReports />
        </div>
      )}

      {/* Historial Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          <h2>Historial de reportes</h2>
          {reportHistory.length === 0 ? (
            <p>No hay reportes generados aún.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Formato</th>
                  <th>Generado</th>
                </tr>
              </thead>
              <tbody>
                {reportHistory.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.format}</td>
                    <td>{r.generated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
