import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FunctionSelector from '../FunctionSelector';

const makeFunc = (id, code, category, name = code) => ({ id, code, category, name, description: '' });

const PIPELINE_FUNCS = [
    makeFunc(1, 'view_pipeline_status', 'PIPELINE'),
    makeFunc(2, 'request_pipeline_exec', 'PIPELINE'),
];
const AUDIT_FUNCS = [
    makeFunc(3, 'view_audit_logs', 'AUDIT'),
    makeFunc(4, 'search_audit_records', 'AUDIT'),
];
const USER_FUNCS = [
    makeFunc(5, 'manage_users_list', 'USERS'),
];
const ACCESS_FUNCS = [
    makeFunc(6, 'manage_access_roles', 'ACCESS'),
];
const ALL_FUNCTIONS = [...PIPELINE_FUNCS, ...AUDIT_FUNCS, ...USER_FUNCS, ...ACCESS_FUNCS];

describe('FunctionSelector — separation rule predicates', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('SR-001: pipeline ∩ audit → conflict banner appears', () => {
        render(
            <FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[1, 3]} />
        );
        expect(screen.getByText(/Conflictos de Separación detectados/)).toBeInTheDocument();
    });

    it('SR-001: pipeline ∩ pipeline → no conflict banner', () => {
        render(
            <FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[1, 2]} />
        );
        expect(screen.queryByText(/Conflictos de Separación detectados/)).not.toBeInTheDocument();
    });

    it('SR-002: users ∩ audit → conflict banner appears', () => {
        render(
            <FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[5, 3]} />
        );
        expect(screen.getByText(/Conflictos de Separación detectados/)).toBeInTheDocument();
    });

    it('SR-003: access ∩ audit → conflict banner appears', () => {
        render(
            <FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[6, 3]} />
        );
        expect(screen.getByText(/Conflictos de Separación detectados/)).toBeInTheDocument();
    });

    it('codename with unknown prefix causes no false positive', () => {
        const unknownFunc = makeFunc(99, 'unknown_operation_xyz', 'DASHBOARD');
        render(
            <FunctionSelector allFunctions={[unknownFunc]} selectedFunctionIds={[99]} />
        );
        expect(screen.queryByText(/Conflictos de Separación detectados/)).not.toBeInTheDocument();
    });
});

describe('FunctionSelector — toggle behavior', () => {
    it('adds function to selection on click', () => {
        const onSelectionChange = jest.fn();
        render(
            <FunctionSelector
                allFunctions={PIPELINE_FUNCS}
                selectedFunctionIds={[]}
                onSelectionChange={onSelectionChange}
            />
        );
        fireEvent.click(screen.getByText(/view_pipeline_status/));
        expect(onSelectionChange).toHaveBeenCalledWith([1], false);
    });

    it('removes function from selection on second click', () => {
        const onSelectionChange = jest.fn();
        render(
            <FunctionSelector
                allFunctions={PIPELINE_FUNCS}
                selectedFunctionIds={[1]}
                onSelectionChange={onSelectionChange}
            />
        );
        fireEvent.click(screen.getByText(/view_pipeline_status/));
        const [newSelection] = onSelectionChange.mock.calls[0];
        expect(newSelection).not.toContain(1);
    });

    it('does nothing when readOnly is true', () => {
        const onSelectionChange = jest.fn();
        render(
            <FunctionSelector
                allFunctions={PIPELINE_FUNCS}
                selectedFunctionIds={[]}
                onSelectionChange={onSelectionChange}
                readOnly
            />
        );
        fireEvent.click(screen.getByText(/view_pipeline_status/));
        expect(onSelectionChange).not.toHaveBeenCalled();
    });
});

describe('FunctionSelector — category filtering', () => {
    it('renders functions grouped by category', () => {
        render(<FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[]} />);
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
        expect(screen.getByText('Audit')).toBeInTheDocument();
    });

    it('shows function count per category', () => {
        render(<FunctionSelector allFunctions={ALL_FUNCTIONS} selectedFunctionIds={[]} />);
        const countBadges = screen.getAllByText(/\(\d+\)/);
        expect(countBadges.length).toBeGreaterThan(0);
        const texts = countBadges.map(el => el.textContent);
        expect(texts).toContain('(2)');
    });
});

describe('FunctionSelector — conflict status in UI', () => {
    it('shows conflict banner when separation rules are violated', () => {
        render(
            <FunctionSelector
                allFunctions={ALL_FUNCTIONS}
                selectedFunctionIds={[1, 3]}
            />
        );
        expect(screen.getByText(/Conflictos de Separación detectados/)).toBeInTheDocument();
    });

    it('shows no conflict banner when selection is valid', () => {
        render(
            <FunctionSelector
                allFunctions={ALL_FUNCTIONS}
                selectedFunctionIds={[1, 2]}
            />
        );
        expect(screen.queryByText(/Conflictos de Separación detectados/)).not.toBeInTheDocument();
    });
});
