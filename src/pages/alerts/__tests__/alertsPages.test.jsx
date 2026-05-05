import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/alertsSlice', () => ({
  fetchAlerts: jest.fn(() => ({ type: 'alerts/fetchAlerts' })),
  createAlert: jest.fn(() => ({ type: 'alerts/createAlert' })),
  fetchAlertHistory: jest.fn(() => ({ type: 'alerts/fetchAlertHistory' })),
  fetchTemplates: jest.fn(() => ({ type: 'alerts/fetchTemplates' })),
  fetchMySubscriptions: jest.fn(() => ({ type: 'alerts/fetchMySubscriptions' })),
  unsubscribeFromAlert: jest.fn(() => ({ type: 'alerts/unsubscribeFromAlert' })),
  selectAlerts: (s) => s.alerts.alerts,
  selectHistory: (s) => s.alerts.history,
  selectTemplates: (s) => s.alerts.templates,
  selectSubscriptions: (s) => s.alerts.subscriptions,
  selectLoading: (s) => s.alerts.loading,
  selectError: (s) => s.alerts.error,
  selectSuccess: (s) => s.alerts.success,
}))

const alertsReducer = (state = {
  alerts: [], history: [], templates: [], subscriptions: [],
  loading: false, error: null, success: false,
}) => state

function buildStore() {
  return configureStore({ reducer: { alerts: alertsReducer } })
}

function wrap(ui) {
  return render(
    <Provider store={buildStore()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

import AlertsPage from '../AlertsPage'
import AlertHistoryPage from '../AlertHistoryPage'
import AlertConfigPage from '../AlertConfigPage'
import TemplatesPage from '../TemplatesPage'
import SubscriptionsPage from '../SubscriptionsPage'

describe('AlertsPage', () => {
  it('renders page title', () => {
    wrap(<AlertsPage />)
    expect(screen.getByText('Centro de Alertas')).toBeInTheDocument()
  })
})

describe('AlertHistoryPage', () => {
  it('renders page title', () => {
    wrap(<AlertHistoryPage />)
    expect(screen.getByText('Historial de Alertas')).toBeInTheDocument()
  })
})

describe('AlertConfigPage', () => {
  it('renders page title', () => {
    wrap(<AlertConfigPage />)
    expect(screen.getByText('Configurar Alerta')).toBeInTheDocument()
  })
})

describe('TemplatesPage', () => {
  it('renders page title', () => {
    wrap(<TemplatesPage />)
    expect(screen.getByText('Plantillas de Alertas')).toBeInTheDocument()
  })
})

describe('SubscriptionsPage', () => {
  it('renders page title', () => {
    wrap(<SubscriptionsPage />)
    expect(screen.getByText('Mis Suscripciones')).toBeInTheDocument()
  })
})
