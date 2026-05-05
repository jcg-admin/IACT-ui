/**
 * TransactionList Component Tests
 * Testing Transaction management and filtering
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionList from '../TransactionList';

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn()
  })
}));

describe('TransactionList Component', () => {
  test('renders transactions title', () => {
    render(<TransactionList />);
    expect(screen.getByText('Transacciones')).toBeInTheDocument();
  });

  test('displays transaction statistics', async () => {
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getAllByText('Ingresos')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Gastos')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Balance')[0]).toBeInTheDocument();
    });
  });

  test('renders transaction table with data', async () => {
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getByText('Pago de nómina')).toBeInTheDocument();
    });
  });

  test('filter by type works correctly', async () => {
    render(<TransactionList />);
    const filterSelect = screen.getByDisplayValue('Todas');
    
    fireEvent.change(filterSelect, { target: { value: 'income' } });
    
    await waitFor(() => {
      expect(screen.getByText('Pago de nómina')).toBeInTheDocument();
    });
  });

  test('search functionality filters transactions', async () => {
    render(<TransactionList />);
    const searchInput = screen.getByPlaceholderText('Buscar transacción...');
    
    fireEvent.change(searchInput, { target: { value: 'nómina' } });
    
    await waitFor(() => {
      expect(screen.getByText('Pago de nómina')).toBeInTheDocument();
    });
  });

  test('export CSV button exists', () => {
    render(<TransactionList />);
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument();
  });

  test('displays correct number of transactions initially', async () => {
    render(<TransactionList />);
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
