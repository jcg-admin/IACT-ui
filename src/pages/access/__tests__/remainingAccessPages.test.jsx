import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/accessSlice', () => ({
  fetchAllFunctions: jest.fn(() => ({ type: 'access/fetchAllFunctions' })),
  fetchAccessAudit: jest.fn(() => ({ type: 'access/fetchAccessAudit' })),
  fetchSodRules: jest.fn(() => ({ type: 'access/fetchSodRules' })),
  updateSodRule: jest.fn((r) => ({ type: 'access/updateSodRule', payload: r })),
  deleteSodRule: jest.fn((id) => ({ type: 'access/deleteSodRule', payload: id })),
  selectFunctions: (s) => s.access.functions,
  selectAuditLog: (s) => s.access.auditLog,
  selectSeparationRules: (s) => s.access.separationRules,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
}))

const accessReducer = (state = {
  functions: [], auditLog: [], separationRules: [], loading: false, error: null,
}) => state

function wrap(ui) {
  return render(
    <Provider store={configureStore({ reducer: { access: accessReducer } })}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

import AccessAuditPage from '../AccessAuditPage'
import SeparationRulesPage from '../SeparationRulesPage'
import SegmentsPage from '../SegmentsPage'
import GroupersPage from '../GroupersPage'

describe('AccessAuditPage', () => {
  it('renders page title', () => {
    wrap(<AccessAuditPage />)
    expect(screen.getByText('Auditoria de Acceso')).toBeInTheDocument()
  })
})

describe('SeparationRulesPage', () => {
  it('renders page title', () => {
    wrap(<SeparationRulesPage />)
    expect(screen.getByText('Gestión de Reglas de Separación')).toBeInTheDocument()
  })
})

describe('SegmentsPage', () => {
  it('renders page title', () => {
    wrap(<SegmentsPage />)
    expect(screen.getByText('Segmentos de Datos')).toBeInTheDocument()
  })
})

describe('GroupersPage', () => {
  it('renders page title', () => {
    wrap(<GroupersPage />)
    expect(screen.getByText('Agrupadores de Funciones')).toBeInTheDocument()
  })
})
