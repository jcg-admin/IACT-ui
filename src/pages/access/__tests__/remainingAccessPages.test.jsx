import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/access', () => ({
  fetchAllFunctions: jest.fn(() => ({ type: 'access/fetchAllFunctions' })),
  fetchAccessAudit: jest.fn(() => ({ type: 'access/fetchAccessAudit' })),
  fetchSeparationRules: jest.fn(() => ({ type: 'access/fetchSeparationRules' })),
  updateSeparationRule: jest.fn((r) => ({ type: 'access/updateSeparationRule', payload: r })),
  deleteSeparationRule: jest.fn((id) => ({ type: 'access/deleteSeparationRule', payload: id })),
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

import AccessAudit from '../AccessAudit'
import SeparationRules from '../SeparationRules'
import Segments from '../Segments'
import Groupers from '../Groupers'

describe('AccessAudit', () => {
  it('renders page title', () => {
    wrap(<AccessAudit />)
    expect(screen.getByText('Auditoria de Acceso')).toBeInTheDocument()
  })
})

describe('SeparationRules', () => {
  it('renders page title', () => {
    wrap(<SeparationRules />)
    expect(screen.getByText('Gestión de Reglas de Separación')).toBeInTheDocument()
  })
})

describe('Segments', () => {
  it('renders page title', () => {
    wrap(<Segments />)
    expect(screen.getByText('Segmentos de Datos')).toBeInTheDocument()
  })
})

describe('Groupers', () => {
  it('renders page title', () => {
    wrap(<Groupers />)
    expect(screen.getByText('Agrupadores de Funciones')).toBeInTheDocument()
  })
})
