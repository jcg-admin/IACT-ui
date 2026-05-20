import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecoverPassword from '../RecoverPassword'

// UC_AUTH_03 — flujo de 3 pasos con preguntas de seguridad (CNST-001 SIN email).
// El test mockea los 3 thunks: fetchSecurityQuestions, verifyAnswers, recoverPassword.

const mockDispatch = jest.fn()
const mockFetchSecurityQuestions = jest.fn()
const mockVerifyAnswers = jest.fn()
const mockRecoverPassword = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@store/slices/auth', () => ({
  fetchSecurityQuestions: (...args) => mockFetchSecurityQuestions(...args),
  verifyAnswers: (...args) => mockVerifyAnswers(...args),
  recoverPassword: (...args) => mockRecoverPassword(...args),
}))

const SAMPLE_QUESTIONS = [
  { id: 1, question: 'Tu mascota?' },
  { id: 2, question: 'Tu ciudad natal?' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <RecoverPassword />
    </MemoryRouter>
  )
}

function unwrapResolved(value) {
  return { unwrap: () => Promise.resolve(value) }
}
function unwrapRejected(error) {
  return { unwrap: () => Promise.reject(error) }
}

describe('RecoverPassword (UC_AUTH_03 — flujo preguntas seguridad)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockFetchSecurityQuestions.mockClear()
    mockVerifyAnswers.mockClear()
    mockRecoverPassword.mockClear()
    mockFetchSecurityQuestions.mockReturnValue({ type: 'auth/fetchSecurityQuestions' })
    mockVerifyAnswers.mockReturnValue({ type: 'auth/verifyAnswers' })
    mockRecoverPassword.mockReturnValue({ type: 'auth/recoverPassword' })
  })

  it('renders sin crash en el paso 1 (username)', () => {
    mockDispatch.mockImplementation(() => unwrapResolved({}))
    renderPage()
    expect(screen.getByText('Recuperar contrasena')).toBeInTheDocument()
    expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
  })

  it('paso 1: submit dispatcha fetchSecurityQuestions y avanza al paso 2', async () => {
    mockDispatch.mockImplementation(() => unwrapResolved(SAMPLE_QUESTIONS))
    renderPage()
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => {
      expect(mockFetchSecurityQuestions).toHaveBeenCalled()
      expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument()
    })
    // Renderiza inputs por cada pregunta
    expect(screen.getByLabelText('Tu mascota?')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu ciudad natal?')).toBeInTheDocument()
  })

  it('paso 2: con respuestas validas dispatcha verifyAnswers y avanza al paso 3', async () => {
    mockDispatch
      .mockImplementationOnce(() => unwrapResolved(SAMPLE_QUESTIONS))
      .mockImplementationOnce(() => unwrapResolved({ verified: true }))
    renderPage()
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => screen.getByLabelText('Tu mascota?'))

    fireEvent.change(screen.getByLabelText('Tu mascota?'), { target: { value: 'firulais' } })
    fireEvent.change(screen.getByLabelText('Tu ciudad natal?'), { target: { value: 'puebla' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar respuestas/i }))

    await waitFor(() => {
      expect(mockVerifyAnswers).toHaveBeenCalledWith({
        username: 'testuser',
        answers: [
          { question_id: 1, answer: 'firulais' },
          { question_id: 2, answer: 'puebla' },
        ],
      })
      expect(screen.getByText(/Paso 3 de 3/)).toBeInTheDocument()
    })
  })

  it('paso 3: nueva password coincidente dispatcha recoverPassword y muestra confirmacion', async () => {
    mockDispatch
      .mockImplementationOnce(() => unwrapResolved(SAMPLE_QUESTIONS))
      .mockImplementationOnce(() => unwrapResolved({ verified: true }))
      .mockImplementationOnce(() => unwrapResolved({ success: true }))
    renderPage()

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => screen.getByLabelText('Tu mascota?'))

    fireEvent.change(screen.getByLabelText('Tu mascota?'), { target: { value: 'firulais' } })
    fireEvent.change(screen.getByLabelText('Tu ciudad natal?'), { target: { value: 'puebla' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar respuestas/i }))
    await waitFor(() => screen.getByLabelText('Nueva contrasena'))

    fireEvent.change(screen.getByLabelText('Nueva contrasena'), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contrasena'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Cambiar contrasena/i }))

    await waitFor(() => {
      expect(mockRecoverPassword).toHaveBeenCalledWith({
        username: 'testuser',
        answers: [
          { question_id: 1, answer: 'firulais' },
          { question_id: 2, answer: 'puebla' },
        ],
        new_password: 'Password123',
        confirm_password: 'Password123',
      })
      expect(screen.getByRole('status')).toHaveTextContent(/Contrasena cambiada/i)
    })
  })

  it('muestra error si verifyAnswers falla (respuestas incorrectas)', async () => {
    mockDispatch
      .mockImplementationOnce(() => unwrapResolved(SAMPLE_QUESTIONS))
      .mockImplementationOnce(() => unwrapRejected(new Error('Respuestas invalidas')))
    renderPage()
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => screen.getByLabelText('Tu mascota?'))
    fireEvent.change(screen.getByLabelText('Tu mascota?'), { target: { value: 'mal' } })
    fireEvent.change(screen.getByLabelText('Tu ciudad natal?'), { target: { value: 'mal' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar respuestas/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('valida que las contrasenas coincidan antes de submit del paso 3', async () => {
    mockDispatch
      .mockImplementationOnce(() => unwrapResolved(SAMPLE_QUESTIONS))
      .mockImplementationOnce(() => unwrapResolved({ verified: true }))
    renderPage()
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => screen.getByLabelText('Tu mascota?'))
    fireEvent.change(screen.getByLabelText('Tu mascota?'), { target: { value: 'firulais' } })
    fireEvent.change(screen.getByLabelText('Tu ciudad natal?'), { target: { value: 'puebla' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar respuestas/i }))
    await waitFor(() => screen.getByLabelText('Nueva contrasena'))

    fireEvent.change(screen.getByLabelText('Nueva contrasena'), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contrasena'), { target: { value: 'NoCoincide' } })
    fireEvent.click(screen.getByRole('button', { name: /Cambiar contrasena/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/i)
      expect(mockRecoverPassword).not.toHaveBeenCalled()
    })
  })

  it('muestra link a /login en todos los pasos', () => {
    mockDispatch.mockImplementation(() => unwrapResolved({}))
    renderPage()
    const loginLink = screen.getByRole('link', { name: /Volver al inicio de sesion/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })
})
