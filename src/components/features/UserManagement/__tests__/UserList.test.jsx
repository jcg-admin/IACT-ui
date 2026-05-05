/**
 * UserList Component Tests
 * Testing User Management CRUD functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from '../UserList';

// Mock dependencies
jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn()
  })
}));

describe('UserList Component', () => {
  test('renders user list with title', () => {
    render(<UserList />);
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
  });

  test('displays user count', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 5 usuarios/)).toBeInTheDocument();
    });
  });

  test('renders table with users', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('María')).toBeInTheDocument();
    });
  });

  test('search functionality works', async () => {
    render(<UserList />);
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
    
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
    
    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument();
    });
  });

  test('new user button exists and is clickable', async () => {
    render(<UserList />);
    const newUserBtn = screen.getByText('+ Nuevo Usuario');
    
    expect(newUserBtn).toBeInTheDocument();
    fireEvent.click(newUserBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    });
  });

  test('shows role badges', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getAllByText('User')[0]).toBeInTheDocument();
    });
  });

  test('shows active/inactive status', async () => {
    render(<UserList />);
    await waitFor(() => {
      expect(screen.getAllByText('Activo')[0]).toBeInTheDocument();
    });
  });
});
