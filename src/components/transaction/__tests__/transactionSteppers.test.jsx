import React from 'react'
import { render } from '@testing-library/react'

const mockTransaction = {
  transaction: { id: null, conflicts: [], data: {} },
  step: 0,
  isLoading: false,
  error: null,
  startTx: jest.fn(),
  nextStep: jest.fn(),
  confirmTx: jest.fn(),
  cancelTx: jest.fn(),
  resolveConflict: jest.fn(),
}

jest.mock('@hooks/domain/useTransaction', () => ({
  __esModule: true,
  default: jest.fn(() => mockTransaction),
}))

jest.mock('@hooks/domain/useJobStatus', () => ({
  __esModule: true,
  default: jest.fn(() => ({ job: null, progress: 0, downloadResult: jest.fn(), stopPolling: jest.fn() })),
}))

jest.mock('../FormStepper', () => ({
  __esModule: true,
  default: ({ steps, currentStep, title }) => (
    <div data-testid="form-stepper">
      <h2>{title}</h2>
      {steps && steps[currentStep] && <div>{steps[currentStep].title}</div>}
    </div>
  ),
}))

jest.mock('../content/SeparationRulesValidation', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/ConflictResolver', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/ConfirmAssignment', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/UserInfoForm', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/PermissionsSelector', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/PreviewUser', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/ConfirmUser', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/FilterForm', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../content/PreviewResults', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('@components/jobs/ProgressBar', () => ({ __esModule: true, default: () => <div /> }))

describe('AssignFunctionStepper', () => {
  it('renders without crashing', () => {
    const AssignFunctionStepper = require('../AssignFunctionStepper').default
    const { container } = render(<AssignFunctionStepper userId={1} onComplete={jest.fn()} />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('CreateUserStepper', () => {
  it('renders without crashing', () => {
    const CreateUserStepper = require('../CreateUserStepper').default
    const { container } = render(<CreateUserStepper onComplete={jest.fn()} />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('ExportCSVStepper', () => {
  it('renders without crashing', () => {
    const ExportCSVStepper = require('../ExportCSVStepper').default
    const { container } = render(<ExportCSVStepper onComplete={jest.fn()} />)
    expect(container.firstChild).not.toBeNull()
  })
})
