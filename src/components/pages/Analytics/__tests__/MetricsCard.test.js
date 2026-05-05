/**
 * MetricsCard Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import MetricsCard from '../MetricsCard'

describe('MetricsCard Component', () => {
  it('should render metric title and value', () => {
    render(
      <MetricsCard
        title="Total Users"
        value={2547}
        icon="👥"
        trend="+12%"
        trendType="positive"
      />
    )

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('2547')).toBeInTheDocument()
  })

  it('should display trend information', () => {
    render(
      <MetricsCard
        title="Active Users"
        value={1832}
        icon="🟢"
        trend="+8%"
        trendType="positive"
      />
    )

    expect(screen.getByText('+8%')).toBeInTheDocument()
  })

  it('should display icon', () => {
    const { container } = render(
      <MetricsCard
        title="Jobs"
        value={12453}
        icon="✓"
        trend="+25%"
        trendType="positive"
      />
    )

    expect(container.textContent).toContain('✓')
  })
})
