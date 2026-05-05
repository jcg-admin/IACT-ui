import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemporaryPermissionsPage from '../TemporaryPermissionsPage';

const FUNCTIONS = [
    { id: 5, code: 'view_pipeline_status', name: 'View Pipeline', category: 'PIPELINE' },
];

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        access: { loading: false, error: null, success: false, functions: FUNCTIONS },
    }),
}));

jest.mock('../../../redux/slices/accessSlice', () => ({
    fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
    assignFunction: jest.fn(args => ({ type: 'access/assignFunction', payload: args })),
    selectLoading: (s) => s.access.loading,
    selectError: (s) => s.access.error,
    selectSuccess: (s) => s.access.success,
}));

import { assignFunction } from '../../../redux/slices/accessSlice';

function renderPage() {
    return render(
        <MemoryRouter>
            <TemporaryPermissionsPage />
        </MemoryRouter>
    );
}

function getFutureDate(daysAhead = 7) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
}

describe('TemporaryPermissionsPage — catalogId dispatch invariant', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        assignFunction.mockClear();
    });

    it('dispatches assignFunction with catalogId = parseInt(selectedFunction)', async () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        fireEvent.change(selects[1], { target: { value: '5' } });

        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: getFutureDate() } });

        fireEvent.click(screen.getByRole('button', { name: /asignar permiso temporal/i }));

        await waitFor(() => {
            expect(assignFunction).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 1, catalogId: 5 })
            );
        });
        const { catalogId } = assignFunction.mock.calls[0][0];
        expect(typeof catalogId).toBe('number');
        expect(catalogId).toBe(5);
    });

    it('does not dispatch when expiresAt is missing', () => {
        renderPage();
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '1' } });
        fireEvent.change(selects[1], { target: { value: '5' } });
        fireEvent.click(screen.getByRole('button', { name: /asignar permiso temporal/i }));
        expect(assignFunction).not.toHaveBeenCalled();
    });

    it('includes expiresAt with the date in dispatch payload', async () => {
        renderPage();
        const futureDate = getFutureDate(10);
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: '2' } });
        fireEvent.change(selects[1], { target: { value: '5' } });

        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: futureDate } });

        fireEvent.click(screen.getByRole('button', { name: /asignar permiso temporal/i }));

        await waitFor(() => {
            expect(assignFunction).toHaveBeenCalledWith(
                expect.objectContaining({ expiresAt: expect.stringContaining(futureDate) })
            );
        });
    });
});
