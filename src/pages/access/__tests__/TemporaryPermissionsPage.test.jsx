import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemporaryPermissions from '../TemporaryPermissions';

const FUNCTIONS = [
    { id: 5, code: 'PIP-005', name: 'Ejecutar pipeline', category: 'PIPELINE' },
];

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        access: {
            loading: false, error: null, success: false,
            functions: FUNCTIONS,
            exceptionalPermissions: [],
        },
        auth: { user: { id: 99, username: 'admin' } },
    }),
}));

jest.mock('../../../redux/slices/access', () => ({
    fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
    grantExceptionalPermission: jest.fn(args => ({ type: 'access/grantExceptionalPermission', payload: args })),
    fetchExceptionalPermissions: jest.fn(userId => ({ type: 'access/fetchExceptionalPermissions', payload: userId })),
    revokeExceptionalPermission: jest.fn(args => ({ type: 'access/revokeExceptionalPermission', payload: args })),
    selectLoading: (s) => s.access.loading,
    selectError: (s) => s.access.error,
    selectSuccess: (s) => s.access.success,
    selectExceptionalPermissions: (s) => s.access.exceptionalPermissions,
    clearSuccess: () => ({ type: 'access/clearSuccess' }),
}));

jest.mock('../../../redux/selectors', () => ({
    selectUser: (s) => s.auth.user,
}));

import { grantExceptionalPermission } from '../../../redux/slices/access';

function renderPage() {
    return render(
        <MemoryRouter>
            <TemporaryPermissions />
        </MemoryRouter>
    );
}

function getFutureDate(daysAhead = 7) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
}

describe('TemporaryPermissions — UC_ACC_08 ExceptionalPermission dispatch', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        grantExceptionalPermission.mockClear();
    });

    it('dispatches grantExceptionalPermission with function_codename when form is valid', async () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        // selectedUser (id=1 != currentUser.id=99, so no anti-self)
        fireEvent.change(selects[0], { target: { value: '1' } });
        // selectedFunction (code-based: PIP-005)
        fireEvent.change(selects[1], { target: { value: 'PIP-005' } });

        const textarea = screen.getByPlaceholderText(/justificación|razón/i);
        fireEvent.change(textarea, { target: { value: 'Esta es la justificacion minima valida' } });

        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: getFutureDate() } });

        fireEvent.click(screen.getByRole('button', { name: /otorgar permiso excepcional/i }));

        await waitFor(() => {
            expect(grantExceptionalPermission).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 1,
                    payload: expect.objectContaining({
                        function_codename: 'PIP-005',
                        justification: expect.stringMatching(/.{20,}/),
                    }),
                })
            );
        });
    });

    it('does not dispatch when justification is shorter than 20 chars', () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        fireEvent.change(selects[1], { target: { value: 'PIP-005' } });

        const textarea = screen.getByPlaceholderText(/justificación|razón/i);
        fireEvent.change(textarea, { target: { value: 'corto' } });

        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: getFutureDate() } });

        const submitBtn = screen.getByRole('button', { name: /otorgar permiso excepcional/i });
        expect(submitBtn).toBeDisabled();
        expect(grantExceptionalPermission).not.toHaveBeenCalled();
    });

    it('does not dispatch when expiryDate is missing', () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        fireEvent.change(selects[1], { target: { value: 'PIP-005' } });

        const textarea = screen.getByPlaceholderText(/justificación|razón/i);
        fireEvent.change(textarea, { target: { value: 'Esta es la justificacion minima valida' } });

        const submitBtn = screen.getByRole('button', { name: /otorgar permiso excepcional/i });
        expect(submitBtn).toBeDisabled();
        expect(grantExceptionalPermission).not.toHaveBeenCalled();
    });

    it('includes expires_at with date and time in dispatch payload', async () => {
        renderPage();
        const futureDate = getFutureDate(10);
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '2' } });
        fireEvent.change(selects[1], { target: { value: 'PIP-005' } });

        const textarea = screen.getByPlaceholderText(/justificación|razón/i);
        fireEvent.change(textarea, { target: { value: 'Esta es la justificacion minima valida' } });

        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: futureDate } });

        fireEvent.click(screen.getByRole('button', { name: /otorgar permiso excepcional/i }));

        await waitFor(() => {
            expect(grantExceptionalPermission).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        expires_at: expect.stringContaining(futureDate),
                    }),
                })
            );
        });
    });
});
