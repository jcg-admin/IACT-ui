import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AGRCatalog from '../AGRCatalog'

const AGRS = [
  { id: 1, name: 'AGR Auditores', description: 'Grupo auditores del sistema', active: true },
  { id: 2, name: 'AGR Supervisores', description: 'Grupo supervisores IVR', active: true },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      admin: { loading: false, error: null, agrs: AGRS, functions: [] },
    }),
}))

jest.mock('../../../redux/slices/adminSlice', () => ({
  fetchAGRCatalog: () => ({ type: 'admin/fetchAGRCatalog' }),
  createAGR: jest.fn((data) => ({ type: 'admin/createAGR', payload: data })),
  updateAGR: jest.fn((args) => ({ type: 'admin/updateAGR', payload: args })),
  deactivateAGR: jest.fn((id) => ({ type: 'admin/deactivateAGR', payload: id })),
  selectAGRs: (s) => s.admin.agrs,
  selectAdminLoading: (s) => s.admin.loading,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AGRCatalog', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<AGRCatalog />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders AGR list', () => {
    wrapper(<AGRCatalog />)
    expect(screen.getByText('AGR Auditores')).toBeInTheDocument()
    expect(screen.getByText('AGR Supervisores')).toBeInTheDocument()
  })

  it('dispatches fetchAGRCatalog on mount', () => {
    wrapper(<AGRCatalog />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})

describe('AGRCatalog — codename snake_case validation (G-B2)', () => {
  const { createAGR } = require('../../../redux/slices/adminSlice')

  beforeEach(() => {
    mockDispatch.mockClear()
    createAGR.mockClear()
  })

  function openCreateForm() {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('button', { name: /nuevo agr/i }))
  }

  function fillAndSubmit(codename, name = 'Test AGR') {
    const codenameInput = document.querySelector('[name="codename"]')
    const nameInput = document.querySelector('[name="name"]')
    fireEvent.change(codenameInput, { target: { value: codename } })
    fireEvent.change(nameInput, { target: { value: name } })
    fireEvent.click(screen.getByRole('button', { name: /crear agr/i }))
  }

  it('accepts valid snake_case codename', () => {
    openCreateForm()
    fillAndSubmit('basic_operator_group')
    expect(screen.queryByText(/formato.*snake_case/i)).not.toBeInTheDocument()
    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })

  it('rejects codename with uppercase letters', () => {
    openCreateForm()
    fillAndSubmit('BasicOperatorGroup')
    expect(screen.getByText(/formato.*snake_case/i)).toBeInTheDocument()
    expect(createAGR).not.toHaveBeenCalled()
  })

  it('rejects codename with hyphens', () => {
    openCreateForm()
    fillAndSubmit('basic-operator-group')
    expect(screen.getByText(/formato.*snake_case/i)).toBeInTheDocument()
  })

  it('rejects codename starting with a number', () => {
    openCreateForm()
    fillAndSubmit('1_invalid')
    expect(screen.getByText(/formato.*snake_case/i)).toBeInTheDocument()
  })

  it('accepts codename with numbers after first char', () => {
    openCreateForm()
    fillAndSubmit('group_v2')
    expect(screen.queryByText(/formato.*snake_case/i)).not.toBeInTheDocument()
    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })
})
