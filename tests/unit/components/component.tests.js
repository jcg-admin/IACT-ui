/**
 * Tests unitarios para componentes presentacionales
 * Ubicación: tests/unit/components/
 */

// ============================================================================
// tests/unit/components/LoginForm.test.js
// ============================================================================

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../../src/components/presentational/LoginForm';

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders email and password inputs', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={false} />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={false} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('calls onSubmit with form data', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={false} />);
    
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('displays loading state', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  test('displays error message', () => {
    const errorMessage = 'Invalid credentials';
    render(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        loading={false}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={false} />);
    
    await userEvent.type(
      screen.getByPlaceholderText(/email/i), 
      'invalid-email'
    );
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Should not call onSubmit for invalid email
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('validates password length', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={false} />);
    
    await userEvent.type(
      screen.getByPlaceholderText(/email/i),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/password/i),
      'short'
    );
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Should not call onSubmit for short password
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears error when user starts typing', async () => {
    const { rerender } = render(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        loading={false}
        error="Error message"
      />
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'new@email.com');
    
    rerender(
      <LoginForm 
        onSubmit={mockOnSubmit} 
        loading={false}
        error={null}
      />
    );
    
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });
});

// ============================================================================
// tests/unit/components/MetricCard.test.js
// ============================================================================

import MetricCard from '../../../src/components/presentational/MetricCard';

describe('MetricCard Component', () => {
  const mockMetric = {
    id: '1',
    name: 'Users',
    value: 1234,
    change: 5.2
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders metric name and value', () => {
    render(<MetricCard metric={mockMetric} />);
    
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  test('renders change percentage', () => {
    render(<MetricCard metric={mockMetric} />);
    
    expect(screen.getByText(/5.2%/)).toBeInTheDocument();
  });

  test('shows up arrow for positive change', () => {
    render(<MetricCard metric={mockMetric} />);
    
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  test('shows down arrow for negative change', () => {
    const negativeMetric = { ...mockMetric, change: -3.1 };
    render(<MetricCard metric={negativeMetric} />);
    
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    render(<MetricCard metric={mockMetric} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByText('Users').closest('div'));
    
    expect(mockOnClick).toHaveBeenCalled();
  });

  test('applies hover styles on interaction', () => {
    const { container } = render(<MetricCard metric={mockMetric} />);
    const card = container.firstChild;
    
    expect(card).toHaveClass('hover:shadow-lg');
  });
});

// ============================================================================
// tests/unit/components/Chart.test.js
// ============================================================================

import Chart from '../../../src/components/presentational/Chart';

describe('Chart Component', () => {
  const mockData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 }
  ];

  test('renders without crashing', () => {
    const { container } = render(<Chart data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  test('renders with data prop', () => {
    const { container } = render(<Chart data={mockData} />);
    
    // Recharts renders SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('displays message when no data provided', () => {
    render(<Chart data={[]} />);
    
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  test('displays message when data is null', () => {
    render(<Chart data={null} />);
    
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  test('renders correct number of data points', () => {
    const { container } = render(<Chart data={mockData} />);
    
    const circles = container.querySelectorAll('circle');
    // Recharts renders points as circles
    expect(circles.length).toBeGreaterThan(0);
  });

  test('renders responsive container', () => {
    const { container } = render(<Chart data={mockData} />);
    
    const responsiveContainer = container.querySelector('[class*="recharts"]');
    expect(responsiveContainer).toBeInTheDocument();
  });
});

// ============================================================================
// tests/unit/components/DashboardHeader.test.js
// ============================================================================

import DashboardHeader from '../../../src/components/presentational/DashboardHeader';

describe('DashboardHeader Component', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    mockOnLogout.mockClear();
  });

  test('renders header title', () => {
    render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
      />
    );
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test('displays user name', () => {
    render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders logout button', () => {
    render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
      />
    );
    
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('calls onLogout when logout button clicked', () => {
    render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('renders connection status indicator', () => {
    const { rerender } = render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
        connected={true}
      />
    );
    
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    
    rerender(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
        connected={false}
      />
    );
    
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  test('shows different styling for connected/disconnected', () => {
    const { container, rerender } = render(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
        connected={true}
      />
    );
    
    const statusElement = container.querySelector('[class*="status"]');
    expect(statusElement).toHaveClass('bg-green');
    
    rerender(
      <DashboardHeader 
        userName="John Doe"
        onLogout={mockOnLogout}
        connected={false}
      />
    );
    
    expect(statusElement).toHaveClass('bg-red');
  });
});
