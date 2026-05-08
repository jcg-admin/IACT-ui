import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import MockDataNotice from '../MockDataNotice'

jest.mock('@store/slices/auth', () => ({
  logout: jest.fn(() => ({ type: 'auth/logout' })),
}))

function buildStore(auth = {}) {
  return configureStore({
    reducer: { auth: (state = { user: null, ...auth }) => state },
  })
}

describe('MockDataNotice', () => {
  it('renders nothing when isVisible=false', () => {
    const { container } = render(<MockDataNotice isVisible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders notice when isVisible=true', () => {
    render(<MockDataNotice isVisible={true} />)
    expect(screen.getByText(/Datos simulados/i)).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<MockDataNotice isVisible={true} message="Custom mock message" />)
    expect(screen.getByText('Custom mock message')).toBeInTheDocument()
  })
})

describe('Layout', () => {
  it('renders children', () => {
    const Layout = require('../Layout').default
    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <Layout><p>page content</p></Layout>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('renders IACT brand', () => {
    const Layout = require('../Layout').default
    render(
      <Provider store={buildStore()}>
        <MemoryRouter>
          <Layout><p>test</p></Layout>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('IACT')).toBeInTheDocument()
  })
})
