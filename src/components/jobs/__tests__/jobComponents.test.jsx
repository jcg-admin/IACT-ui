import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import JobTracker from '../JobTracker'
import ProgressBar from '../ProgressBar'

jest.mock('@redux/slices/session', () => ({
  selectAllJobs: (state) => state.session.jobs,
}))

function buildStore(jobs = []) {
  return configureStore({
    reducer: { session: (state = { jobs }) => state },
  })
}

describe('JobTracker', () => {
  it('shows "No active jobs" when empty', () => {
    render(
      <Provider store={buildStore([])}>
        <JobTracker />
      </Provider>
    )
    expect(screen.getByText('No active jobs')).toBeInTheDocument()
  })

  it('renders jobs when present', () => {
    const jobs = [
      { id: 'job-1', type: 'ETL', status: 'running', progress: 50, eta: 120 },
    ]
    render(
      <Provider store={buildStore(jobs)}>
        <JobTracker />
      </Provider>
    )
    expect(screen.getByText('ETL')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
  })
})

describe('ProgressBar', () => {
  it('shows percentage', () => {
    render(<ProgressBar progress={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows "Completed" at 100%', () => {
    render(<ProgressBar progress={100} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows "Queued" at 0%', () => {
    render(<ProgressBar progress={0} />)
    expect(screen.getByText('Queued')).toBeInTheDocument()
  })

  it('shows "Processing" between 1-99', () => {
    render(<ProgressBar progress={50} />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('shows ETA when provided', () => {
    render(<ProgressBar progress={50} etaSeconds={90} />)
    expect(screen.getByText('1m 30s')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<ProgressBar progress={50} label="Upload task" />)
    expect(screen.getByText('Upload task')).toBeInTheDocument()
  })

  it('shows total progress when total provided', () => {
    render(<ProgressBar progress={50} total={200} />)
    expect(screen.getByText('100 / 200')).toBeInTheDocument()
  })
})
