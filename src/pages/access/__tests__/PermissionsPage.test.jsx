import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PermissionsPage from '../PermissionsPage';

const PERMISSIONS = [
    { assignment_id: 42, code: 'view_audit_logs', name: 'View Audit', description: '', category: 'AUDIT', assigned_at: '2026-01-01', expires_at: null },
];

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        access: {
            loading: false, error: null, success: false, functions: [],
            userPermissions: { functions: PERMISSIONS },
        },
    }),
}));

jest.mock('../../../redux/slices/accessSlice', () => ({
    fetchUserPermissions: () => ({ type: 'access/fetchUserPermissions' }),
    revokeFunction: jest.fn(args => ({ type: 'access/revokeFunction', payload: args })),
    selectLoading: (s) => s.access.loading,
    selectError: (s) => s.access.error,
}));

import { revokeFunction } from '../../../redux/slices/accessSlice';

function renderPage() {
    return render(
        <MemoryRouter>
            <PermissionsPage />
        </MemoryRouter>
    );
}

describe('PermissionsPage — revoke flow', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        revokeFunction.mockClear();
    });

    it('shows Revocar button after selecting user', async () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        await waitFor(() => expect(screen.getByText('Revocar')).toBeInTheDocument());
    });

    it('changes to Confirmar on first Revocar click', async () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        await waitFor(() => screen.getByText('Revocar'));
        fireEvent.click(screen.getByText('Revocar'));
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
    });

    it('dispatches revokeFunction with catalogId = assignment_id on Confirmar', async () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        await waitFor(() => screen.getByText('Revocar'));
        fireEvent.click(screen.getByText('Revocar'));
        fireEvent.click(screen.getByText('Confirmar'));

        expect(revokeFunction).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 1, catalogId: 42 })
        );
        const { catalogId } = revokeFunction.mock.calls[0][0];
        expect(catalogId).toBe(42);
        expect(catalogId).not.toBeUndefined();
    });
});
