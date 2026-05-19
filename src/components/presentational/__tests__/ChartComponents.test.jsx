import React from 'react'
import { render, screen } from '@testing-library/react'

// recharts uses ResizeObserver / SVG sizing that jsdom doesn't support
jest.mock('recharts', () => {
  const React = require('react')
  return {
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  }
})

import Chart from '../Chart'
import ChartsSection from '../ChartsSection'

describe('Chart', () => {
  it('renders chart when data is provided', () => {
    const data = [{ name: 'Jan', value: 100 }, { name: 'Feb', value: 120 }]
    render(<Chart data={data} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows empty message when data is empty', () => {
    render(<Chart data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows empty message when data is null', () => {
    render(<Chart data={null} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

describe('ChartsSection', () => {
  const charts = {
    sales: [{ name: 'Jan', value: 100 }],
    users: [{ name: 'Jan', value: 50 }],
  }

  it('renders Sales Trend heading', () => {
    render(<ChartsSection charts={charts} />)
    expect(screen.getByText('Sales Trend')).toBeInTheDocument()
  })

  it('renders User Growth heading', () => {
    render(<ChartsSection charts={charts} />)
    expect(screen.getByText('User Growth')).toBeInTheDocument()
  })
})
