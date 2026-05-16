/**
 * alertsPages.test.jsx — v3
 *
 * CORRECCIÓN T4.2:
 *   AlertConfig: validateCondition → dryRunAlertRule thunk
 *   Templates:   fetchTemplates eliminado (endpoint inexistente)
 *
 * CORRECCIÓN H-F1-003:
 *   Mock actualizado al estado actual del slice (FASE 1):
 *   - selectSuccess eliminado (AlertConfig ya no lo importa)
 *   - clearDryRunResult añadido (nuevo reducer de FASE 1)
 *   - stub del reducer actualizado con dryRunResult
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../../../redux/slices/alerts', () => ({
  fetchAlerts:          jest.fn(() => ({ type: 'alerts/fetchAlerts' })),
  createAlert:          jest.fn(() => ({ type: 'alerts/createAlert' })),
  updateAlert:          jest.fn((p) => ({ type: 'alerts/updateAlert', payload: p })),
  fetchAlertHistory:    jest.fn(() => ({ type: 'alerts/fetchAlertHistory' })),
  fetchMySubscriptions: jest.fn(() => ({ type: 'alerts/fetchMySubscriptions' })),
  unsubscribeFromAlert: jest.fn(() => ({ type: 'alerts/unsubscribeFromAlert' })),
  dryRunAlertRule:      jest.fn(() => ({ type: 'alerts/dryRunAlertRule' })),
  // fetchTemplates y selectTemplates NO existen en v2
  // selectSuccess eliminado: AlertConfig usa createAlert.fulfilled.match() — FASE 1
  clearDryRunResult:    jest.fn(() => ({ type: 'alerts/clearDryRunResult' })),
  selectAlerts:         (s) => s.alerts.alerts,
  selectHistory:        (s) => s.alerts.history,
  selectSubscriptions:  (s) => s.alerts.subscriptions,
  selectLoading:        (s) => s.alerts.loading,
  selectError:          (s) => s.alerts.error,
  selectDryRunResult:   (s) => s.alerts.dryRunResult ?? null,
}))

const alertsReducer = (state = {
  alerts: [], history: [], subscriptions: [],
  loading: false, error: null, dryRunResult: null,
}) => state

function buildStore() {
  return configureStore({ reducer: { alerts: alertsReducer } })
}

function wrap(ui) {
  return render(
    <Provider store={buildStore()}><MemoryRouter>{ui}</MemoryRouter></Provider>
  )
}

import AlertsOverview from '../Alerts'
import AlertHistory from '../AlertHistory'
import AlertConfig from '../AlertConfig'
import Templates from '../Templates'
import Subscriptions from '../Subscriptions'

describe('AlertsOverview', () => {
  it('renderiza el título de la página', () => {
    wrap(<AlertsOverview />)
    expect(screen.getByText('Centro de alertas')).toBeInTheDocument()
  })
})

describe('AlertHistory', () => {
  it('renderiza el título de la página', () => {
    wrap(<AlertHistory />)
    expect(screen.getByText('Historial de alertas')).toBeInTheDocument()
  })
})

describe('AlertConfig — dryRunAlertRule (T4.2)', () => {
  it('renderiza el título de la página', () => {
    wrap(<AlertConfig />)
    expect(screen.getByText('Configurar regla de alerta')).toBeInTheDocument()
  })

  it('NO importa alertsGateway directamente', () => {
    // El componente no debe tener import de alertsGateway
    const src = require('fs').readFileSync(
      'src/pages/alerts/AlertConfig.jsx', 'utf8'
    )
    expect(src).not.toContain("from '../../services/alertsGateway'")
    expect(src).not.toContain("validateCondition")
  })

  it('usa dryRunAlertRule del slice (no alertsGateway.validateCondition)', () => {
    const src = require('fs').readFileSync('src/pages/alerts/AlertConfig.jsx', 'utf8')
    // Verifica que el thunk dryRunAlertRule está importado
    expect(src).toContain('dryRunAlertRule')
    // Verifica que validateCondition NO está
    expect(src).not.toContain('validateCondition')
  })

  it('usa clearDryRunResult y NO importa selectSuccess (H-F1-003)', () => {
    const src = require('fs').readFileSync('src/pages/alerts/AlertConfig.jsx', 'utf8')
    // clearDryRunResult debe estar importado (añadido en FASE 1)
    expect(src).toContain('clearDryRunResult')
    // selectSuccess fue eliminado — AlertConfig usa createAlert.fulfilled.match()
    expect(src).not.toContain('selectSuccess')
    // setDryRunResult nunca existió — confirmar ausencia
    expect(src).not.toContain('setDryRunResult')
  })
})

describe('Templates — sin fetchTemplates (T4.2)', () => {
  it('renderiza el título de la página', () => {
    wrap(<Templates />)
    expect(screen.getByText('Plantillas de Alertas')).toBeInTheDocument()
  })

  it('NO importa fetchTemplates ni selectTemplates (eliminados)', () => {
    const src = require('fs').readFileSync(
      'src/pages/alerts/Templates.jsx', 'utf8'
    )
    expect(src).not.toContain('fetchTemplates')
    expect(src).not.toContain('selectTemplates')
  })

  it('muestra las plantillas estáticas (datos locales)', () => {
    wrap(<Templates />)
    // Templates.jsx muestra datos hardcodeados — no requiere API
    const items = screen.getAllByText(/SISTEMA|NEGOCIO|SEGURIDAD/i)
    expect(items.length).toBeGreaterThan(0)
  })
})

describe('Subscriptions', () => {
  it('renderiza el título de la página', () => {
    wrap(<Subscriptions />)
    expect(screen.getByText('Mis suscripciones')).toBeInTheDocument()
  })
})
