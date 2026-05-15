import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/audit', () => ({
  fetchAuditLogs:     jest.fn(() => ({ type: 'audit/fetchAuditLogs' })),
  searchAuditLogs:    jest.fn(() => ({ type: 'audit/searchAuditLogs' })),
  fetchComplianceReport: jest.fn(() => ({ type: 'audit/fetchComplianceReport' })),
  exportAuditLogs:    jest.fn(() => ({ type: 'audit/exportAuditLogs' })),
  setFilters:         jest.fn(() => ({ type: 'audit/setFilters' })),
  selectLogs:         (s) => s.audit.logs,
  selectSearchResults:(s) => s.audit.searchResults,
  selectComplianceReport: (s) => s.audit.complianceReport,
  selectExportJobId:  (s) => s.audit.exportJobId ?? null,
  selectLoading:      (s) => s.audit.loading,
  selectError:        (s) => s.audit.error,
}))


const auditReducer = (state = {
  logs: [], searchResults: [], complianceReport: null,
  exportJobId: null, loading: false, error: null,
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

describe('Export — modelo async (T4.3)', () => {
  it('renderiza el título de la página', () => {
    wrap(<Export />)
    expect(screen.getByText('Exportar Logs')).toBeInTheDocument()
  })

  it('NO importa auditService directamente', () => {
    const src = require('fs').readFileSync('src/pages/audit/Export.jsx', 'utf8')
    expect(src).not.toContain("from '../../services/auditGateway'")
  })

  it('usa exportAuditLogs thunk del slice', () => {
    const src = require('fs').readFileSync('src/pages/audit/Export.jsx', 'utf8')
    expect(src).toContain('exportAuditLogs')
    expect(src).toContain('selectExportJobId')
  })

  it('muestra job_id cuando la exportación está en curso', () => {
    const store = configureStore({
      reducer: {
        audit: (s = { logs: [], searchResults: [], complianceReport: null, exportJobId: 'job-abc-123', loading: false, error: null }) => s,
      },
    })
    wrap(<Export />, store)
    expect(screen.getByText('job-abc-123')).toBeInTheDocument()
  })
})
