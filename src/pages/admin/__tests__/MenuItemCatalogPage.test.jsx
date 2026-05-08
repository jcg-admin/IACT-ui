import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MenuItemCatalog from '../MenuItemCatalog'

const ITEMS = [
  { id: 1, label: 'Dashboard',    icon: 'grid-alt', route_path: '/dashboard', display_order: 1,  function_codename: 'reports:view', parent: null, status: 'ACTIVE',     is_critical: false },
  { id: 2, label: 'Beta Feature', icon: 'flask',    route_path: '/beta',       display_order: 9,  function_codename: 'reports:view', parent: null, status: 'DRAFT',      is_critical: false },
  { id: 3, label: 'Legacy View',  icon: 'archive',  route_path: '/legacy',     display_order: 10, function_codename: 'reports:view', parent: null, status: 'DEPRECATED', is_critical: false },
  { id: 4, label: 'Old Module',   icon: 'box',      route_path: '/old',        display_order: 20, function_codename: 'reports:view', parent: null, status: 'ARCHIVED',   is_critical: false },
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
  publishMenuItem: jest.fn((id) => ({ type: 'admin/publishMenuItem', payload: id })),
  deprecateMenuItem: jest.fn((id) => ({ type: 'admin/deprecateMenuItem', payload: id })),
  reactivateMenuItem: jest.fn((id) => ({ type: 'admin/reactivateMenuItem', payload: id })),
  archiveMenuItem: jest.fn((id) => ({ type: 'admin/archiveMenuItem', payload: id })),
  bulkReorderMenuItems: jest.fn((items) => ({ type: 'admin/bulkReorderMenuItems', payload: items })),
  blockAutoArchive: jest.fn((args) => ({ type: 'admin/blockAutoArchive', payload: args })),
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
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ payload: {} }),
    }))
    mockAdmin.createMenuItem.mockClear()
    mockAdmin.publishMenuItem.mockClear()
    mockAdmin.deprecateMenuItem.mockClear()
    mockAdmin.reactivateMenuItem.mockClear()
    mockAdmin.archiveMenuItem.mockClear()
    mockAdmin.bulkReorderMenuItems.mockClear()
    mockAdmin.blockAutoArchive.mockClear()
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

describe('MenuItemCatalog — bulk reorder (UC-ADM-04 CA-08)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ items: [] }),
    }))
    mockAdmin.bulkReorderMenuItems.mockClear()
  })

  it('shows order inputs when Reordenar is clicked', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByText('Reordenar'))
    expect(screen.getByLabelText('Orden de Dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Orden de Beta Feature')).toBeInTheDocument()
  })

  it('hides order inputs and shows display_order when Cancelar reorden is clicked', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByText('Reordenar'))
    fireEvent.click(screen.getByText('Cancelar reorden'))
    expect(screen.queryByLabelText('Orden de Dashboard')).not.toBeInTheDocument()
  })

  it('dispatches bulkReorderMenuItems with all items on Guardar orden', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByText('Reordenar'))
    fireEvent.click(screen.getByText('Guardar orden'))
    await waitFor(() => {
      expect(mockAdmin.bulkReorderMenuItems).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ])
      )
    })
  })

  it('shows role=alert when bulkReorderMenuItems rejects with 422', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'IDs inválidos en el batch' }),
    }))
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByText('Reordenar'))
    fireEvent.click(screen.getByText('Guardar orden'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/IDs inválidos/i)
    })
  })
})

describe('MenuItemCatalog — edit guards (UC-ADM-04)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({}),
    }))
  })

  it('edit button is disabled for ARCHIVED items', () => {
    wrapper(<MenuItemCatalog />)
    const btn = screen.getByLabelText('Editar Old Module')
    expect(btn).toBeDisabled()
  })

  it('edit button is enabled for ACTIVE items', () => {
    wrapper(<MenuItemCatalog />)
    const btn = screen.getByLabelText('Editar Dashboard')
    expect(btn).not.toBeDisabled()
  })

  it('shows role=alert per row when transition fails', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'La función asociada está inactiva' }),
    }))
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Beta Feature a Activo'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/función asociada está inactiva/i)
    })
  })

  it('shows feedback when transition succeeds', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Beta Feature a Activo'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Beta Feature/i)
    })
  })
})

describe('MenuItemCatalog — transition thunk routing (UC-ADM-05 GAP-01)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ id: action.payload, status: 'ACTIVE' }),
    }))
    mockAdmin.publishMenuItem.mockClear()
    mockAdmin.deprecateMenuItem.mockClear()
    mockAdmin.reactivateMenuItem.mockClear()
    mockAdmin.archiveMenuItem.mockClear()
  })

  it('DRAFT → ACTIVE dispatches publishMenuItem', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Beta Feature a Activo'))
    await waitFor(() => {
      expect(mockAdmin.publishMenuItem).toHaveBeenCalledWith(2)
    })
  })

  it('ACTIVE → DEPRECATED dispatches deprecateMenuItem', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Dashboard a Deprecado'))
    await waitFor(() => {
      expect(mockAdmin.deprecateMenuItem).toHaveBeenCalledWith(1)
    })
  })

  it('DEPRECATED → ACTIVE dispatches reactivateMenuItem', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Legacy View a Activo'))
    await waitFor(() => {
      expect(mockAdmin.reactivateMenuItem).toHaveBeenCalledWith(3)
    })
  })

  it('DEPRECATED → ARCHIVED dispatches archiveMenuItem', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Transicionar Legacy View a Archivado'))
    await waitFor(() => {
      expect(mockAdmin.archiveMenuItem).toHaveBeenCalledWith(3)
    })
  })
})

describe('MenuItemCatalog — block-archive (UC-ADM-05 CA-07)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({}),
    }))
    mockAdmin.blockAutoArchive.mockClear()
  })

  it('shows Bloquear archivado button only for DEPRECATED items', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    expect(screen.getByLabelText('Bloquear archivado de Legacy View')).toBeInTheDocument()
    expect(screen.queryByLabelText('Bloquear archivado de Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Bloquear archivado de Beta Feature')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Bloquear archivado de Old Module')).not.toBeInTheDocument()
  })

  it('opens modal when Bloquear archivado is clicked', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    expect(screen.getByRole('dialog', { name: 'Bloquear archivado automático' })).toBeInTheDocument()
  })

  it('Confirmar bloqueo button is disabled when reason < 20 chars', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    fireEvent.change(screen.getByLabelText('Razón para bloquear el archivado'), {
      target: { value: 'corto' },
    })
    expect(screen.getByText('Confirmar bloqueo')).toBeDisabled()
  })

  it('Confirmar bloqueo button is enabled when reason >= 20 chars', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    fireEvent.change(screen.getByLabelText('Razón para bloquear el archivado'), {
      target: { value: 'Esta es la razon suficientemente larga' },
    })
    expect(screen.getByText('Confirmar bloqueo')).not.toBeDisabled()
  })

  it('dispatches blockAutoArchive on Confirmar bloqueo', async () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    fireEvent.change(screen.getByLabelText('Razón para bloquear el archivado'), {
      target: { value: 'Bloquear porque hay dependencias' },
    })
    fireEvent.click(screen.getByText('Confirmar bloqueo'))
    await waitFor(() => {
      expect(mockAdmin.blockAutoArchive).toHaveBeenCalledWith({
        id: 3,
        blockReason: 'Bloquear porque hay dependencias',
      })
    })
  })

  it('shows role=alert inside modal when unwrap rejects', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'La razón debe tener al menos 20 caracteres' }),
    }))
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    const textarea = screen.getByLabelText('Razón para bloquear el archivado')
    fireEvent.change(textarea, { target: { value: 'Esta es la razon suficiente ya' } })
    fireEvent.click(screen.getByText('Confirmar bloqueo'))
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Bloquear archivado automático' })).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/al menos 20 caracteres/i)
    })
  })

  it('closes modal on Cancelar without dispatching', () => {
    wrapper(<MenuItemCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Lifecycle' }))
    fireEvent.click(screen.getByLabelText('Bloquear archivado de Legacy View'))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog', { name: 'Bloquear archivado automático' })).not.toBeInTheDocument()
    expect(mockAdmin.blockAutoArchive).not.toHaveBeenCalled()
  })
})
