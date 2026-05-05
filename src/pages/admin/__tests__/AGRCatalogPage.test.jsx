import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AGRCatalogPage from '../AGRCatalogPage'

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

describe('AGRCatalogPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<AGRCatalogPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders AGR list', () => {
    wrapper(<AGRCatalogPage />)
    expect(screen.getByText('AGR Auditores')).toBeInTheDocument()
    expect(screen.getByText('AGR Supervisores')).toBeInTheDocument()
  })

  it('dispatches fetchAGRCatalog on mount', () => {
    wrapper(<AGRCatalogPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})
