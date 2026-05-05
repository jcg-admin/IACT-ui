/**
 * JobList Component Tests
 * Testing Job/Task management and polling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobList from '../JobList';

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn()
  })
}));

describe('JobList Component', () => {
  test('renders jobs and tasks title', () => {
    render(<JobList />);
    expect(screen.getByText('Trabajos y Tareas')).toBeInTheDocument();
  });

  test('displays job counter', async () => {
    render(<JobList />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 6 tareas/)).toBeInTheDocument();
    });
  });

  test('renders job table with data', async () => {
    render(<JobList />);
    await waitFor(() => {
      expect(screen.getByText('Backup Database')).toBeInTheDocument();
    });
  });

  test('displays job status badges', async () => {
    render(<JobList />);
    await waitFor(() => {
      expect(screen.getByText('Completado')).toBeInTheDocument();
      expect(screen.getByText('En progreso')).toBeInTheDocument();
    });
  });

  test('shows progress bars', async () => {
    render(<JobList />);
    await waitFor(() => {
      const progressElements = document.querySelectorAll('[class*="progress"]');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  test('opens modal on row action click', async () => {
    render(<JobList />);
    await waitFor(() => {
      const actionButtons = screen.getAllByText('⋮');
      fireEvent.click(actionButtons[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Detalles:/)).toBeInTheDocument();
    });
  });

  test('displays different job statuses', async () => {
    render(<JobList />);
    await waitFor(() => {
      expect(screen.getByText('En cola')).toBeInTheDocument();
      expect(screen.getByText('Fallido')).toBeInTheDocument();
    });
  });
});
