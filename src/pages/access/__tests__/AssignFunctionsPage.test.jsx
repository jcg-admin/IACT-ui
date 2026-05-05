import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AssignFunctionsPage from '../AssignFunctionsPage';

// Mock Redux hooks — avoids store/slice interop issues in page-level tests
const mockDispatch = jest.fn();
const MOCK_FUNCTIONS = [
    { id: 7, code: 'view_pipeline_status', name: 'View Pipeline', category: 'PIPELINE', description: '' },
];

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({
        access: { loading: false, error: null, success: false, functions: MOCK_FUNCTIONS },
    }),
}));

jest.mock('../../../redux/slices/accessSlice', () => ({
    fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
    assignFunction: jest.fn(args => ({ type: 'access/assignFunction', payload: args })),
    validateSeparationRules: () => ({ type: 'access/validateSeparationRules' }),
    clearSuccess: () => ({ type: 'access/clearSuccess' }),
    selectLoading: (s) => s.access.loading,
    selectError: (s) => s.access.error,
    selectSuccess: (s) => s.access.success,
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

import { assignFunction } from '../../../redux/slices/accessSlice';

function renderPage() {
    return render(
        <MemoryRouter>
            <AssignFunctionsPage />
        </MemoryRouter>
    );
}

describe('AssignFunctionsPage — catalogId dispatch invariant', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        assignFunction.mockClear();
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
