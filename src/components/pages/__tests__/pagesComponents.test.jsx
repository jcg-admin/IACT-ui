import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

jest.mock('@services/notificationService', () => ({
  getNotificationService: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn() }),
}))

jest.mock('@services/websocketService', () => ({
  getWebSocketService: () => ({ on: jest.fn().mockReturnValue(jest.fn()), off: jest.fn(), emit: jest.fn() }),
}))

jest.mock('../../../facades/ReportExporter', () => ({
  __esModule: true,
  default: { exportReport: jest.fn().mockResolvedValue({ url: '/file.xlsx' }) },
}))

jest.mock('../../../facades/JobOrchestrator', () => ({
  __esModule: true,
  default: {
    loadAllJobs: jest.fn().mockResolvedValue([]),
    startJob: jest.fn().mockResolvedValue({ id: 'j1' }),
    cancelJob: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('../../../redux/slices/reports', () => ({
  fetchDashboardMetrics: jest.fn(() => (dispatch) => Promise.resolve({ type: 'reports/fetchDashboardMetrics' })),
  fetchReportHistory: jest.fn(() => ({ type: 'reports/fetchReportHistory' })),
  fetchScheduledReports: jest.fn(() => ({ type: 'reports/fetchScheduledReports' })),
  createScheduledReport: jest.fn(() => ({ type: 'reports/createScheduledReport' })),
  pauseSchedule: jest.fn(() => ({ type: 'reports/pauseSchedule' })),
  resumeSchedule: jest.fn(() => ({ type: 'reports/resumeSchedule' })),
  deleteSchedule: jest.fn(() => ({ type: 'reports/deleteSchedule' })),
  runScheduleNow: jest.fn(() => ({ type: 'reports/runScheduleNow' })),
  fetchScheduleHistory: jest.fn(() => ({ type: 'reports/fetchScheduleHistory' })),
  updateMetrics: jest.fn(() => ({ type: 'reports/updateMetrics' })),
  selectMetrics: (s) => s.reports?.metrics ?? { totalPipelines: 0, activeAlerts: 0 },
  selectReportsLoading: (s) => s.reports?.loading ?? false,
  selectScheduleActionLoading: (s) => s.reports?.scheduleActionLoading ?? false,
  selectReportHistory: (s) => s.reports?.reportHistory ?? [],
  selectScheduledReports: (s) => s.reports?.scheduledReports ?? [],
  selectScheduleHistory: (s) => s.reports?.scheduleHistory ?? [],
  selectReportsError: (s) => s.reports?.error ?? null,
  selectSavedFilters: (s) => s.reports?.savedFilters ?? [],
  selectFilters: (s) => s.reports?.filters ?? {},
  selectFilteredData: (s) => s.reports?.filteredData ?? [],
  selectCurrentPage: (s) => s.reports?.currentPage ?? 1,
  selectTotalPages: (s) => s.reports?.totalPages ?? 1,
}))

jest.mock('../Analytics/MetricsCard', () => ({ __esModule: true, default: () => <div data-testid="metrics-card" /> }))
jest.mock('../Analytics/ChartComponent', () => ({ __esModule: true, default: () => <div data-testid="chart-component" /> }))
jest.mock('../Analytics/CustomReportForm', () => ({ __esModule: true, default: () => <div data-testid="report-builder" /> }))
jest.mock('../Analytics/ScheduledReports', () => ({ __esModule: true, default: () => <div data-testid="scheduled-reports" /> }))

jest.mock('../ExportHub/ExportTypeSelector', () => ({ __esModule: true, default: () => <div data-testid="export-type-selector" /> }))
jest.mock('../ExportHub/ExportOptions', () => ({ __esModule: true, default: () => <div data-testid="export-options" /> }))
jest.mock('../ExportHub/ExportPreview', () => ({ __esModule: true, default: () => <div data-testid="export-preview" /> }))
jest.mock('../ExportHub/ExportHistory', () => ({ __esModule: true, default: () => <div data-testid="export-history" /> }))

jest.mock('../JobMonitoring/JobList', () => ({ __esModule: true, default: () => <div data-testid="job-list" /> }))
jest.mock('../JobMonitoring/JobProgressBar', () => ({ __esModule: true, default: () => <div data-testid="job-progress-bar" /> }))
jest.mock('../JobMonitoring/JobStartForm', () => ({ __esModule: true, default: () => <div data-testid="job-start-form" /> }))
jest.mock('../JobMonitoring/JobActions', () => ({ __esModule: true, default: () => <div data-testid="job-actions" /> }))

function buildStore(extra = {}) {
  return configureStore({
    reducer: {
      reports: (state = { metrics: { totalPipelines: 5, activeAlerts: 2 }, loading: false, ...extra }) => state,
    },
  })
}

function wrap(ui, store = buildStore()) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('AnalyticsDashboard', () => {
  it('renders without crashing', () => {
    const AnalyticsDashboard = require('../Analytics/AnalyticsDashboard').default
    const { container } = wrap(<AnalyticsDashboard />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('ExportHub', () => {
  it('renders export type selector', () => {
    const ExportHub = require('../ExportHub/ExportHub').default
    const { container } = render(<ExportHub />)
    expect(screen.getByTestId('export-type-selector')).toBeInTheDocument()
  })
})

describe('JobMonitoring', () => {
  it('renders job list', () => {
    const JobMonitoring = require('../JobMonitoring/JobMonitoring').default
    const { container } = render(<JobMonitoring />)
    expect(screen.getByTestId('job-list')).toBeInTheDocument()
  })
})
