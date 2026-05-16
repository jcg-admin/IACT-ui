/**
 * AlertConfig.test.jsx
 *
 * Cobertura de UC_ALR_01: crear reglas de alerta.
 *
 * Corrige DT-UI-001 (dos bugs):
 *   Bug 1 — ReferenceError: setDryRunResult no existia
 *   Bug 2 — Stale closure: handleCreate leia success del closure anterior al dispatch
 *
 * Tests (13):
 *   Render:         2
 *   Toggle:         2
 *   handleDryRun:   4
 *   handleCreate:   3
 *   Limpiar:        1
 *   Error display:  1
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AlertConfig from '../AlertConfig'
import alertsReducer from '../../../redux/slices/alerts'

// ── Mock del gateway ──────────────────────────────────────────────────────────
jest.mock('../../../services/alertsGateway', () => ({
  __esModule: true,
  default: {
    createAlert:     jest.fn(),
    dryRunAlertRule: jest.fn(),
  },
}))

const gw = require('../../../services/alertsGateway').default

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStore(preloaded = {}) {
  return configureStore({
    reducer: { alerts: alertsReducer },
    preloadedState: preloaded,
    middleware: (g) => g({ serializableCheck: false }),
  })
}

function renderWithStore(preloaded = {}) {
  const store = makeStore(preloaded)
  const utils = render(
    <Provider store={store}><AlertConfig /></Provider>
  )
  return { ...utils, store }
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Render ────────────────────────────────────────────────────────────────────

describe('AlertConfig — render', () => {
  it('renderiza el formulario vacío con los campos principales', () => {
    renderWithStore()
    expect(screen.getByPlaceholderText(/Ej: SL crítico/i)).toBeInTheDocument()
    expect(screen.getByText('Crear regla')).toBeInTheDocument()
    expect(screen.getByText('Limpiar')).toBeInTheDocument()
    expect(screen.getByText(/Probar condición/i)).toBeInTheDocument()
  })

  it('el botón Crear está deshabilitado con el formulario vacío', () => {
    renderWithStore()
    expect(screen.getByText('Crear regla')).toBeDisabled()
  })
})

// ── Toggle de acciones ────────────────────────────────────────────────────────

describe('AlertConfig — toggle de acciones', () => {
  it('añade una acción al marcar su checkbox', async () => {
    renderWithStore()
    const checkbox = screen.getByLabelText(/Notificar usuario/i)
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('elimina la acción al desmarcar su checkbox', async () => {
    renderWithStore()
    const checkbox = screen.getByLabelText(/Notificar usuario/i)
    await userEvent.click(checkbox) // marcar
    await userEvent.click(checkbox) // desmarcar
    expect(checkbox).not.toBeChecked()
  })
})

// ── handleDryRun ──────────────────────────────────────────────────────────────

describe('AlertConfig — handleDryRun', () => {
  it('despacha dryRunAlertRule con metric, scope, threshold y window', async () => {
    gw.dryRunAlertRule.mockResolvedValue({ ok: true, status: 'ok' })
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '85')
    await userEvent.click(screen.getByText(/Probar condición/i))

    await waitFor(() =>
      expect(gw.dryRunAlertRule).toHaveBeenCalledWith(
        expect.objectContaining({
          metric:    'SL',
          scope:     'segment',
          threshold: '85',
          window:    5,
        })
      )
    )
  })

  it('muestra el resultado del dry-run cuando ok=true', async () => {
    gw.dryRunAlertRule.mockResolvedValue({ ok: true, status: 'ok' })
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '85')
    await userEvent.click(screen.getByText(/Probar condición/i))

    await waitFor(() =>
      expect(screen.getByRole('status')).toBeInTheDocument()
    )
  })

  it('muestra el resultado del dry-run cuando ok=false (error de condición)', async () => {
    gw.dryRunAlertRule.mockResolvedValue({ ok: false, status: 'error', message: 'Umbral inválido' })
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '-1')
    await userEvent.click(screen.getByText(/Probar condición/i))

    await waitFor(() =>
      expect(screen.getByRole('status')).toBeInTheDocument()
    )
  })

  it('el botón muestra "Probando…" durante la ejecución del dry-run', async () => {
    // Simular latencia: la promesa no resuelve inmediatamente
    let resolveGw
    gw.dryRunAlertRule.mockReturnValue(new Promise(res => { resolveGw = res }))
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '85')
    await userEvent.click(screen.getByText(/Probar condición/i))

    // Mientras la promesa no resuelve, el botón debe mostrar "Probando…"
    expect(screen.getByText('Probando…')).toBeInTheDocument()

    // Resolver para limpiar el estado
    resolveGw({ ok: true })
  })
})

// ── handleCreate ──────────────────────────────────────────────────────────────

describe('AlertConfig — handleCreate', () => {
  it('despacha createAlert con la configuración del formulario', async () => {
    gw.createAlert.mockResolvedValue({ id: 42, name: 'Mi alerta' })
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: SL crítico/i), 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))

    await userEvent.click(screen.getByText('Crear regla'))

    await waitFor(() =>
      expect(gw.createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          name:      'Mi alerta',
          threshold: '80',
          actions:   expect.arrayContaining(['mailbox_notify_user']),
        })
      )
    )
  })

  it('resetea el formulario tras crear exitosamente (corrige Bug 2 — stale closure)', async () => {
    gw.createAlert.mockResolvedValue({ id: 42, name: 'Mi alerta' })
    renderWithStore()

    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))

    await userEvent.click(screen.getByText('Crear regla'))

    await waitFor(() => expect(nameInput).toHaveValue(''))
  })

  it('no resetea el formulario si createAlert falla', async () => {
    gw.createAlert.mockRejectedValue(new Error('Error de red'))
    renderWithStore()

    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))

    await userEvent.click(screen.getByText('Crear regla'))

    // El formulario no debe resetearse al fallar — el nombre permanece
    await waitFor(() => expect(nameInput).toHaveValue('Mi alerta'))
  })
})

// ── Botón Limpiar ─────────────────────────────────────────────────────────────

describe('AlertConfig — botón Limpiar', () => {
  it('resetea el formulario al pulsar Limpiar (corrige Bug 1 — ReferenceError)', async () => {
    renderWithStore()

    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')

    // Este click lanzaba ReferenceError antes de la corrección
    await userEvent.click(screen.getByText('Limpiar'))

    expect(nameInput).toHaveValue('')
  })
})

// ── Error display ─────────────────────────────────────────────────────────────

describe('AlertConfig — error display', () => {
  it('muestra el error banner cuando el store tiene un error', () => {
    renderWithStore({
      alerts: {
        alerts: [], activeAlerts: [], alertRules: [], alertRuleDetail: null,
        dryRunResult: null, subscriptions: [], history: [],
        loading: false, ruleLoading: false,
        error: { message: 'Error de servidor', statusCode: 500 },
        success: false,
      },
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
