import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserInfoForm from '../UserInfoForm'
import ConfirmAssignment from '../ConfirmAssignment'
import ConfirmUser from '../ConfirmUser'
import FilterForm from '../FilterForm'
import PermissionsSelector from '../PermissionsSelector'
import PreviewUser from '../PreviewUser'
import PreviewResults from '../PreviewResults'
import SeparationRulesValidation from '../SeparationRulesValidation'
import ConflictResolver from '../ConflictResolver'

describe('UserInfoForm', () => {
  it('renders form fields', () => {
    render(<UserInfoForm data={{}} onChange={jest.fn()} />)
    expect(screen.getByText('Información del Usuario')).toBeInTheDocument()
  })

  it('calls onChange when field changes', () => {
    const onChange = jest.fn()
    render(<UserInfoForm data={{ firstName: '' }} onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { name: 'firstName', value: 'Ana' } })
    expect(onChange).toHaveBeenCalled()
  })
})

describe('ConfirmAssignment', () => {
  it('renders confirmation heading', () => {
    render(<ConfirmAssignment data={{ userId: 1 }} />)
    expect(screen.getByText('Confirmar Cambios')).toBeInTheDocument()
  })

  it('shows data as JSON', () => {
    render(<ConfirmAssignment data={{ userId: 1 }} />)
    expect(screen.getByText(/"userId": 1/)).toBeInTheDocument()
  })
})
