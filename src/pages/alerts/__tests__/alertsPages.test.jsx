import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/alerts', () => ({
  fetchAlerts: jest.fn(() => ({ type: 'alerts/fetchAlerts' })),
  createAlert: jest.fn(() => ({ type: 'alerts/createAlert' })),
  updateAlert: jest.fn((payload) => ({ type: 'alerts/updateAlert', payload })),
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

import AlertsOverview from '../Alerts'
import AlertHistory from '../AlertHistory'
import AlertsHub from '../../../components/pages/Alerts/Alerts'
import AlertConfig from '../AlertConfig'
import Templates from '../Templates'
import Subscriptions from '../Subscriptions'

describe('AlertsOverview', () => {
  it('renders page title', () => {
    wrap(<AlertsOverview />)
    expect(screen.getByText('Centro de alertas')).toBeInTheDocument()
  })
})

describe('AlertHistory', () => {
  it('renders page title', () => {
    wrap(<AlertHistory />)
    expect(screen.getByText('Historial de alertas')).toBeInTheDocument()
  })
})

describe('AlertConfig', () => {
  it('renders page title', () => {
    wrap(<AlertConfig />)
    expect(screen.getByText('Configurar regla de alerta')).toBeInTheDocument()
  })
})

describe('Templates', () => {
  it('renders page title', () => {
    wrap(<Templates />)
    expect(screen.getByText('Plantillas de Alertas')).toBeInTheDocument()
  })
})

describe('Subscriptions', () => {
  it('renders page title', () => {
    wrap(<Subscriptions />)
    expect(screen.getByText('Mis suscripciones')).toBeInTheDocument()
  })
})

// uc-alr-03: Reconocer alerta con confirmación
describe('AlertsHub — uc-alr-03', () => {
  const ACTIVE_ALERT = {
    id: 'alr-1',
    title: 'CPU crítica',
    message: 'CPU al 99%',
    severity: 'critical',
    status: 'active',
    created_at: new Date().toISOString(),
  }

  function buildAlertsStore(alerts = []) {
    return configureStore({
      reducer: {
        alerts: (state = { alerts, subscriptions: [], loading: false, error: null }) => state,
      },
    })
  }

  function wrapAlerts(ui, alerts = []) {
    return render(
      <Provider store={buildAlertsStore(alerts)}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    )
  }

  it('renders Confirmar button for active alerts', () => {
    wrapAlerts(<AlertsHub />, [ACTIVE_ALERT])
    expect(screen.getByRole('button', { name: /confirmar alerta/i })).toBeInTheDocument()
  })

  it('does NOT dispatch updateAlert immediately when Confirmar is clicked', () => {
    const { updateAlert } = require('../../../redux/slices/alerts')
    updateAlert.mockClear()
    wrapAlerts(<AlertsHub />, [ACTIVE_ALERT])
    fireEvent.click(screen.getByRole('button', { name: /confirmar alerta/i }))
    expect(updateAlert).not.toHaveBeenCalled()
  })

  it('opens ConfirmModal when Confirmar is clicked', () => {
    wrapAlerts(<AlertsHub />, [ACTIVE_ALERT])
    fireEvent.click(screen.getByRole('button', { name: /confirmar alerta/i }))
    expect(screen.getByRole('heading', { name: /reconocer alerta/i })).toBeInTheDocument()
  })

  it('dispatches updateAlert with acknowledged status on confirm', () => {
    const { updateAlert } = require('../../../redux/slices/alerts')
    updateAlert.mockClear()
    wrapAlerts(<AlertsHub />, [ACTIVE_ALERT])
    fireEvent.click(screen.getByRole('button', { name: /confirmar alerta/i }))
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    expect(updateAlert).toHaveBeenCalledWith({ id: 'alr-1', status: 'acknowledged' })
  })

  it('closes modal without dispatching when cancel is clicked', () => {
    const { updateAlert } = require('../../../redux/slices/alerts')
    updateAlert.mockClear()
    wrapAlerts(<AlertsHub />, [ACTIVE_ALERT])
    fireEvent.click(screen.getByRole('button', { name: /confirmar alerta/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(updateAlert).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: /reconocer alerta/i })).not.toBeInTheDocument()
  })
})
