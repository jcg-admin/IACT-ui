import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MenuItemCatalog from '../MenuItemCatalog'

const ITEMS = [
  { id: 1, label: 'Dashboard',   icon: 'grid-alt', route_path: '/dashboard', display_order: 1, function_codename: 'reports:view', parent: null, status: 'ACTIVE',     is_critical: false },
  { id: 2, label: 'Beta Feature',icon: 'flask',    route_path: '/beta',       display_order: 9, function_codename: 'reports:view', parent: null, status: 'DRAFT',      is_critical: false },
  { id: 3, label: 'Legacy View', icon: 'archive',  route_path: '/legacy',     display_order: 10,function_codename: 'reports:view', parent: null, status: 'DEPRECATED', is_critical: false },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      admin: { loading: false, error: null, menuItems: ITEMS, functions: [], agrs: [], separationRules: [] },
    }),
}))

jest.mock('../../../redux/slices/admin', () => ({
  __esModule: true,
  fetchMenuItems: () => ({ type: 'admin/fetchMenuItems' }),
  createMenuItem: jest.fn((data) => ({ type: 'admin/createMenuItem', payload: data })),
  updateMenuItem: jest.fn((args) => ({ type: 'admin/updateMenuItem', payload: args })),
  transitionMenuItemStatus: jest.fn((args) => ({ type: 'admin/transitionMenuItemStatus', payload: args })),
  selectMenuItems: (s) => s.admin.menuItems,
  selectAdminLoading: (s) => s.admin.loading,
}))

const mockAdmin = jest.requireMock('../../../redux/slices/admin')

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MenuItemCatalog', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ payload: {} })
    mockAdmin.createMenuItem.mockClear()
    mockAdmin.transitionMenuItemStatus.mockClear()
  })

  it('renders page heading', () => {
    wrapper(<MenuItemCatalog />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders catalog tab with items', () => {
    wrapper(<MenuItemCatalog />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Beta Feature')).toBeInTheDocument()
  })

  it('dispatches fetchMenuItems on mount', () => {
    wrapper(<MenuItemCatalog />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows create form on Nuevo item click', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByText('Nuevo item'))
    expect(screen.getByLabelText('Formulario MenuItem')).toBeInTheDocument()
  })

  it('switches to lifecycle tab on click', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    expect(screen.getByLabelText('Lifecycle de menú items')).toBeInTheDocument()
  })

  it('shows lifecycle transitions for DRAFT item', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    expect(screen.getByLabelText('Transicionar Beta Feature a Activo')).toBeInTheDocument()
  })

  it('dispatches transitionMenuItemStatus on transition click', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    const btn = screen.getByLabelText('Transicionar Beta Feature a Activo')
    fireEvent.click(btn)
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(2))
  })

  it('shows guard-free edit button for catalog items', () => {
    wrapper(<MenuItemCatalog />)
    expect(screen.getByLabelText('Editar Dashboard')).toBeInTheDocument()
  })
})
