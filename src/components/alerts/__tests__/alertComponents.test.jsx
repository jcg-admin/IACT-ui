import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AlertItem from '../AlertItem'
import AlertList from '../AlertList'

jest.mock('@store/slices/session', () => ({
  selectAlerts: (state) => state.session.alerts,
}))

function buildStore(alerts = []) {
  return configureStore({
    reducer: { session: (state = { alerts }) => state },
  })
}

const MOCK_ALERT = {
  id: 'a1',
  title: 'Test Alert',
  message: 'Something happened',
  severity: 'warning',
  isRead: false,
  timestamp: new Date('2024-01-01T10:00:00').toISOString(),
}

describe('AlertItem', () => {
  it('renders title and message', () => {
    render(<AlertItem alert={MOCK_ALERT} />)
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('shows Mark Read button when unread', () => {
    render(<AlertItem alert={MOCK_ALERT} />)
    expect(screen.getByText('Mark Read')).toBeInTheDocument()
  })

  it('hides Mark Read when already read', () => {
    render(<AlertItem alert={{ ...MOCK_ALERT, isRead: true }} />)
    expect(screen.queryByText('Mark Read')).not.toBeInTheDocument()
  })

  it('calls onMarkRead when clicked', () => {
    const onMarkRead = jest.fn()
    render(<AlertItem alert={MOCK_ALERT} onMarkRead={onMarkRead} />)
    fireEvent.click(screen.getByText('Mark Read'))
    expect(onMarkRead).toHaveBeenCalledWith('a1')
  })

  it('calls onDismiss when clicked', () => {
    const onDismiss = jest.fn()
    render(<AlertItem alert={MOCK_ALERT} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByText('Dismiss'))
    expect(onDismiss).toHaveBeenCalledWith('a1')
  })
})

describe('AlertList', () => {
  it('shows "No alerts" when empty', () => {
    render(
      <Provider store={buildStore([])}>
        <AlertList />
      </Provider>
    )
    expect(screen.getByText('No alerts')).toBeInTheDocument()
  })

  it('renders alerts when present', () => {
    render(
      <Provider store={buildStore([MOCK_ALERT])}>
        <AlertList />
      </Provider>
    )
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
    expect(screen.getByText('Alerts (1)')).toBeInTheDocument()
  })
})
