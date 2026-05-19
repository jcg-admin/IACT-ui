import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SidebarNav from './SidebarNav'

const leafLink = { id: 1, label: 'Dashboard', icon: 'grid', path: '/dashboard' }

const groupLinkA = {
  id: 3,
  label: 'Reportes',
  icon: 'chart-bar',
  path: '/reports',
  children: [
    { label: 'Históricos', path: '/reports/historical', permission: 'reports:view' },
    { label: 'Tiempo real', path: '/reports/realtime', permission: 'reports:metrics' },
  ],
}

const groupLinkB = {
  id: 7,
  label: 'Logs',
  icon: 'terminal',
  path: '/logs',
  children: [
    { label: 'App logs', path: '/logs', permission: 'logs:view_app' },
    { label: 'ETL logs', path: '/logs/etl', permission: 'logs:view_etl' },
  ],
}

const navigate = jest.fn()

beforeEach(() => navigate.mockClear())

describe('SidebarNav — leaf link (no children)', () => {
  it('renders as a simple button without chevron', () => {
    render(<SidebarNav navLinks={[leafLink]} currentPath="/dashboard" onNavigate={navigate} />)
    const btn = screen.getByRole('button', { name: /Dashboard/i })
    expect(btn).toBeInTheDocument()
    expect(screen.queryByTestId('chevron')).not.toBeInTheDocument()
  })

  it('calls onNavigate with the link when clicked', () => {
    render(<SidebarNav navLinks={[leafLink]} currentPath="/" onNavigate={navigate} />)
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }))
    expect(navigate).toHaveBeenCalledWith(leafLink)
  })
})

describe('SidebarNav — group link (with children)', () => {
  it('renders group header with expandable indicator', () => {
    render(<SidebarNav navLinks={[groupLinkA]} currentPath="/" onNavigate={navigate} />)
    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-3')).toBeInTheDocument()
  })

  it('children are hidden when group is collapsed', () => {
    render(<SidebarNav navLinks={[groupLinkA]} currentPath="/" onNavigate={navigate} />)
    expect(screen.queryByText('Históricos')).not.toBeVisible()
  })

  it('clicking parent header toggles children visibility', () => {
    render(<SidebarNav navLinks={[groupLinkA]} currentPath="/" onNavigate={navigate} />)
    const header = screen.getByRole('button', { name: /Reportes/i })
    fireEvent.click(header)
    expect(screen.getByText('Históricos')).toBeVisible()
    fireEvent.click(header)
    expect(screen.queryByText('Históricos')).not.toBeVisible()
  })

  it('clicking a child calls onNavigate with child link, not parent', () => {
    render(<SidebarNav navLinks={[groupLinkA]} currentPath="/" onNavigate={navigate} />)
    fireEvent.click(screen.getByRole('button', { name: /Reportes/i }))
    fireEvent.click(screen.getByRole('button', { name: /Históricos/i }))
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(groupLinkA.children[0])
    expect(navigate).not.toHaveBeenCalledWith(groupLinkA)
  })
})

describe('SidebarNav — auto-expand active group', () => {
  it('auto-expands group whose child path matches currentPath', () => {
    render(
      <SidebarNav navLinks={[groupLinkA, groupLinkB]} currentPath="/reports/historical" onNavigate={navigate} />
    )
    expect(screen.getByText('Históricos')).toBeVisible()
    expect(screen.queryByText('App logs')).not.toBeVisible()
  })
})

describe('SidebarNav — accordion exclusivity', () => {
  it('expanding group B collapses group A', () => {
    render(
      <SidebarNav navLinks={[groupLinkA, groupLinkB]} currentPath="/" onNavigate={navigate} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Reportes/i }))
    expect(screen.getByText('Históricos')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: /Logs/i }))
    expect(screen.queryByText('Históricos')).not.toBeVisible()
    expect(screen.getByText('App logs')).toBeVisible()
  })
})
