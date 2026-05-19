import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MainLayout from './MainLayout';
import { PermissionsService } from '@api/permissions/Permissions';

jest.mock('@api/permissions/Permissions', () => ({
  PermissionsService: {
    getNormalizedPermissions: jest.fn(),
  },
}));

jest.mock('@ui/navigation/Header/Header', () => ({
  __esModule: true,
  default: ({ onLogout, userInfo }) => (
    <header data-testid="app-header">
      <span>{userInfo?.name}</span>
      <button onClick={onLogout} data-testid="logout-btn">Logout</button>
    </header>
  ),
}));

jest.mock('@store/slices/auth', () => ({
  logoutUser: jest.fn(() => ({ type: 'auth/logoutUser' })),
}));

jest.mock('@store/selectors', () => ({
  selectUser: (s) => s.auth?.user ?? null,
}));

function buildStore(auth = {}) {
  return configureStore({
    reducer: {
      auth: (state = { user: null, ...auth }) => state,
    },
  });
}

function renderLayout(children, storeState = {}) {
  return render(
    <Provider store={buildStore(storeState)}>
      <MainLayout>
        {children}
      </MainLayout>
    </Provider>
  );
}

describe('MainLayout', () => {
  beforeEach(() => {
    PermissionsService.getNormalizedPermissions.mockResolvedValue({
      data: {
        user: {},
        capabilities: [],
        menuEntries: [
          { id: 1, code: 'dashboards', label: 'Dashboards', fullName: '', domain: '', icon: '', order: 10 },
          { id: 2, code: 'llamadas', label: 'Llamadas', fullName: '', domain: '', icon: '', order: 20 },
        ],
      },
      source: 'mock',
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Header component with logout button', () => {
    renderLayout(<div>Contenido</div>);
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
  });

  it('passes user info to Header', () => {
    renderLayout(<div />, { user: { first_name: 'Ana', email: 'ana@test.com' } });
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('dispatches logoutUser when logout button is clicked', () => {
    const { logoutUser } = require('@store/slices/auth');
    renderLayout(<div />);
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(logoutUser).toHaveBeenCalled();
  });

  it('renders navigation items based on permissions service', async () => {
    renderLayout(<div>Contenido</div>);

    await waitFor(() => {
      expect(screen.getByText(/Dashboards/)).toBeInTheDocument();
      expect(screen.getByText(/Llamadas/)).toBeInTheDocument();
    });

    expect(PermissionsService.getNormalizedPermissions).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when service fails', async () => {
    PermissionsService.getNormalizedPermissions.mockRejectedValueOnce(
      new Error('sin permisos')
    );

    renderLayout(<div>Contenido</div>);

    await waitFor(() => {
      expect(screen.getByTestId('menu-placeholder')).toHaveTextContent(/Menu no disponible/);
    });
  });

  it('renders children content', () => {
    renderLayout(<div>Contenido principal</div>);
    expect(screen.getByText(/Contenido principal/)).toBeInTheDocument();
  });
});
