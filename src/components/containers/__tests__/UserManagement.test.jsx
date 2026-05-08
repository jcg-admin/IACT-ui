import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@components/shared/ExportButtons', () => () => <div data-testid="export-buttons" />);
jest.mock('@components/animations', () => ({
    AnimatedButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

import UserManagement from '../UserManagement';

const mockDispatch = jest.fn();

const MOCK_USERS = [
    { id: 1, username: 'admin', email: 'admin@example.com', first_name: 'Admin', last_name: 'Sistema', state: 'ACTIVE', date_joined: '2025-01-01T00:00:00Z' },
    { id: 2, username: 'maria.garcia', email: 'maria@example.com', first_name: 'Maria', last_name: 'Garcia', state: 'ACTIVE', date_joined: '2025-02-15T00:00:00Z' },
    { id: 3, username: 'ana.martinez', email: 'ana@example.com', first_name: 'Ana', last_name: 'Martinez', state: 'INACTIVE', date_joined: '2025-04-20T00:00:00Z' },
];

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        user: { users: MOCK_USERS, loading: false, error: null, total: 3 },
    }),
}));

jest.mock('../../../redux/slices/user', () => ({
    fetchUsers: jest.fn(() => ({ type: 'user/fetchUsers' })),
    deactivateUser: jest.fn(id => ({ type: 'user/deactivateUser', payload: id })),
    selectUsers: (s) => s.user.users,
    selectUsersLoading: (s) => s.user.loading,
    selectUsersError: (s) => s.user.error,
    selectUsersTotal: (s) => s.user.total,
}));

import { fetchUsers } from '../../../redux/slices/user';

function renderComponent() {
    return render(
        <MemoryRouter>
            <UserManagement />
        </MemoryRouter>
    );
}

describe('UserManagement — Redux wiring', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        fetchUsers.mockClear();
    });

    it('despacha fetchUsers al montar', () => {
        renderComponent();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'user/fetchUsers' });
    });

    it('muestra usuarios del store en la tabla', () => {
        renderComponent();
        expect(screen.getByText('@admin')).toBeInTheDocument();
        expect(screen.getByText('@maria.garcia')).toBeInTheDocument();
    });

    it('muestra el total del store, no el length del array local', () => {
        renderComponent();
        expect(screen.getByText(/3/)).toBeInTheDocument();
    });
});

describe('UserManagement — estado de carga', () => {
    afterEach(() => jest.restoreAllMocks());

    it('muestra spinner o texto de carga cuando loading=true', () => {
        jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
            selector({ user: { users: [], loading: true, error: null, total: 0 } })
        );
        renderComponent();
        expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('muestra error cuando error != null', () => {
        jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
            selector({ user: { users: [], loading: false, error: 'Error de red', total: 0 } })
        );
        renderComponent();
        expect(screen.getByText(/error de red/i)).toBeInTheDocument();
    });
});

describe('UserManagement — state badge (UC-USR-01)', () => {
    it('muestra badge ACTIVE para usuarios activos', () => {
        renderComponent();
        const activeBadges = screen.getAllByText('ACTIVE');
        expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('muestra badge INACTIVE para usuarios inactivos', () => {
        renderComponent();
        expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    });
});
