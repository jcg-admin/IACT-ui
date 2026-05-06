import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MetricCard from '../MetricCard'
import MetricsGrid from '../MetricsGrid'
import DashboardHeader from '../DashboardHeader'

// recharts uses SVG and ResizeObserver which jsdom doesn't fully support
jest.mock('../Chart', () => ({ __esModule: true, default: () => <div data-testid="chart" /> }))

// ── MetricCard ──────────────────────────────────────────────────────────────

describe('MetricCard', () => {
  const metric = { label: 'Llamadas', value: '1,200', change: '+5%', trend: 'up' }

  it('renders the metric label', () => {
    render(<MetricCard metric={metric} />)
    expect(screen.getByText('Llamadas')).toBeInTheDocument()
  })

  it('renders the metric value', () => {
    render(<MetricCard metric={metric} />)
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  it('applies badge-success class for up trend', () => {
    const { container } = render(<MetricCard metric={metric} />)
    expect(container.querySelector('.badge-success')).toBeInTheDocument()
  })

  it('applies badge-error class for down trend', () => {
    const { container } = render(<MetricCard metric={{ ...metric, trend: 'down' }} />)
    expect(container.querySelector('.badge-error')).toBeInTheDocument()
  })
})

// ── MetricsGrid ─────────────────────────────────────────────────────────────

describe('MetricsGrid', () => {
  const metrics = {
    calls: { label: 'Llamadas', value: '100', change: '+2%', trend: 'up' },
    agents: { label: 'Agentes', value: '10', change: '-1%', trend: 'down' },
  }

  it('renders a MetricCard for each metric entry', () => {
    render(<MetricsGrid metrics={metrics} />)
    expect(screen.getByText('Llamadas')).toBeInTheDocument()
    expect(screen.getByText('Agentes')).toBeInTheDocument()
  })
})

// ── DashboardHeader ──────────────────────────────────────────────────────────

describe('DashboardHeader', () => {
  it('renders dashboard heading', () => {
    render(<DashboardHeader user={{ name: 'Alice' }} onLogout={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('shows welcome message with user name', () => {
    render(<DashboardHeader user={{ name: 'Alice' }} onLogout={() => {}} />)
    expect(screen.getByText(/Welcome, Alice/)).toBeInTheDocument()
  })

  it('calls onLogout when Logout button is clicked', () => {
    const onLogout = jest.fn()
    render(<DashboardHeader user={{ name: 'Alice' }} onLogout={onLogout} />)
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(onLogout).toHaveBeenCalled()
  })
})
