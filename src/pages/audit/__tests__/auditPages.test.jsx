import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/audit', () => ({
  fetchAuditLogs: jest.fn(() => ({ type: 'audit/fetchAuditLogs' })),
  searchAuditLogs: jest.fn(() => ({ type: 'audit/searchAuditLogs' })),
  fetchComplianceReport: jest.fn(() => ({ type: 'audit/fetchComplianceReport' })),
  setFilters: jest.fn(() => ({ type: 'audit/setFilters' })),
  selectLogs: (s) => s.audit.logs,
  selectSearchResults: (s) => s.audit.searchResults,
  selectComplianceReport: (s) => s.audit.complianceReport,
  selectLoading: (s) => s.audit.loading,
  selectError: (s) => s.audit.error,
}))

jest.mock('../../../services/auditService', () => ({
  __esModule: true,
  default: { exportLogs: jest.fn().mockResolvedValue({ url: '/download/audit.csv' }) },
}))

const auditReducer = (state = {
  logs: [], searchResults: [], complianceReport: null, loading: false, error: null,
}) => state

function buildStore(extra = {}) {
  return configureStore({ reducer: { audit: auditReducer, ...extra } })
}

function wrap(ui, store = buildStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

// ── AuditPage ────────────────────────────────────────────────────────────────

import Audit from '../Audit'

describe('Audit', () => {
  it('renders page title', () => {
    wrap(<Audit />)
    expect(screen.getByText('Auditoria del Sistema')).toBeInTheDocument()
  })

  it('dispatches fetchAuditLogs on mount', () => {
    const { fetchAuditLogs } = require('../../../redux/slices/audit')
    wrap(<Audit />)
    expect(fetchAuditLogs).toHaveBeenCalled()
  })
})

// ── AuditSearchPage ───────────────────────────────────────────────────────────

import AuditSearch from '../AuditSearch'

describe('AuditSearch', () => {
  it('renders page title', () => {
    wrap(<AuditSearch />)
    expect(screen.getByText('Búsqueda de Auditoria')).toBeInTheDocument()
  })

  it('renders search input', () => {
    wrap(<AuditSearch />)
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })
})

// ── ComplianceReportPage ──────────────────────────────────────────────────────

import ComplianceReport from '../ComplianceReport'

describe('ComplianceReport', () => {
  it('renders page title', () => {
    wrap(<ComplianceReport />)
    expect(screen.getByText('Reporte de Compliance')).toBeInTheDocument()
  })
})

// ── ExportPage ────────────────────────────────────────────────────────────────

import Export from '../Export'

describe('Export', () => {
  it('renders page title', () => {
    wrap(<Export />)
    expect(screen.getByText('Exportar Logs')).toBeInTheDocument()
  })
})
