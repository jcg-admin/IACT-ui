import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AssignFunctions from '../AssignFunctions';

// Mock Redux hooks — avoids store/slice interop issues in page-level tests
const mockDispatch = jest.fn();
const MOCK_FUNCTIONS = [
    { id: 7, code: 'view_pipeline_status', name: 'View Pipeline', category: 'PIPELINE', description: '' },
];
const MOCK_USER_FUNCTIONS = [
    { id: 7, code: 'view_pipeline_status', name: 'View Pipeline', category: 'PIPELINE' },
    { id: 9, code: 'edit_users', name: 'Edit Users', category: 'USR' },
];

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        access: {
            loading: false, error: null, success: false,
            functions: MOCK_FUNCTIONS,
            userAssignedFunctions: MOCK_USER_FUNCTIONS,
        },
    }),
}));

jest.mock('../../../redux/slices/accessSlice', () => ({
    fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
    fetchUserAssignedFunctions: jest.fn(userId => ({ type: 'access/fetchUserAssignedFunctions', payload: userId })),
    assignFunction: jest.fn(args => ({ type: 'access/assignFunction', payload: args })),
    revokeFunction: jest.fn(args => ({ type: 'access/revokeFunction', payload: args })),
    validateSeparationRules: () => ({ type: 'access/validateSeparationRules' }),
    clearSuccess: () => ({ type: 'access/clearSuccess' }),
    selectLoading: (s) => s.access.loading,
    selectError: (s) => s.access.error,
    selectSuccess: (s) => s.access.success,
    selectUserAssignedFunctions: (s) => s.access.userAssignedFunctions,
}));

jest.mock('../../../components/access/FunctionSelector', () => {
    return function MockFunctionSelector({ onSelectionChange }) {
        return (
            <button
                type="button"
                data-testid="select-func-7"
                onClick={() => onSelectionChange([7], false)}
            >
                Select function 7
            </button>
        );
    };
});

import { assignFunction, revokeFunction, fetchUserAssignedFunctions } from '../../../redux/slices/accessSlice';

function renderPage() {
    return render(
        <MemoryRouter>
            <AssignFunctions />
        </MemoryRouter>
    );
}

describe('AssignFunctions — catalogId dispatch invariant', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        assignFunction.mockClear();
        revokeFunction.mockClear();
        fetchUserAssignedFunctions.mockClear();
    });

    it('dispatches assignFunction with catalogId when user and functions are selected', async () => {
        renderPage();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        fireEvent.click(screen.getByTestId('select-func-7'));
        fireEvent.click(screen.getByRole('button', { name: /asignar/i }));

        await waitFor(() => {
            expect(assignFunction).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 1, catalogId: 7 })
            );
        });
        const { catalogId } = assignFunction.mock.calls[0][0];
        expect(catalogId).toBeDefined();
        expect(catalogId).toBe(7);
    });

    it('does not dispatch when no user is selected', () => {
        renderPage();
        fireEvent.click(screen.getByTestId('select-func-7'));
        fireEvent.click(screen.getByRole('button', { name: /asignar/i }));
        expect(assignFunction).not.toHaveBeenCalled();
    });

    it('does not dispatch when no functions are selected', () => {
        renderPage();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: /asignar/i }));
        expect(assignFunction).not.toHaveBeenCalled();
    });
});

// uc-acc-02: Revocar funciones de usuario
describe('AssignFunctions — Revocar tab (uc-acc-02)', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        revokeFunction.mockClear();
        fetchUserAssignedFunctions.mockClear();
    });

    function switchToRevokeTab() {
        renderPage();
        fireEvent.click(screen.getByRole('tab', { name: /revocar/i }));
    }

    it('renders Revocar tab button', () => {
        renderPage();
        expect(screen.getByRole('tab', { name: /revocar/i })).toBeInTheDocument();
    });

    it('shows assigned functions list when user is selected on Revocar tab', () => {
        switchToRevokeTab();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        expect(screen.getByText('View Pipeline')).toBeInTheDocument();
        expect(screen.getByText('Edit Users')).toBeInTheDocument();
    });

    it('dispatches fetchUserAssignedFunctions when user changes on Revocar tab', () => {
        switchToRevokeTab();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
        expect(fetchUserAssignedFunctions).toHaveBeenCalledWith(2);
    });

    it('dispatches revokeFunction with userId and catalogId when Revocar is clicked', async () => {
        switchToRevokeTab();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        fireEvent.click(screen.getAllByRole('button', { name: /revocar/i })[0]);
        await waitFor(() => {
            expect(revokeFunction).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 1, catalogId: expect.any(Number) })
            );
        });
    });
});
