/**
 * CreateUserStepper Component
 * Stepper específico para crear nuevo usuario
 * Usa FormStepper base como componente genérico
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import useTransaction from '@hooks/domain/useTransaction'
import FormStepper from './FormStepper'
import UserInfoForm from './content/UserInfoForm'
import PermissionsSelector from './content/PermissionsSelector'
import PreviewUser from './content/PreviewUser'
import ConfirmUser from './content/ConfirmUser'

function CreateUserStepper({ onComplete }) {
  const [_stepData, setStepData] = useState({})
  const {
    transaction: _tx,
    step: _step,
    isLoading: _isLoading,
    error: _error,
    startTx,
    nextStep,
    confirmTx,
    cancelTx
  } = useTransaction('create_user')

  // Iniciar transacción al montar
  React.useEffect(() => {
    if (!_tx.id) {
      startTx({})
    }
  }, [_tx.id, startTx])

  // Steps definition
  const _steps = [
    {
      title: 'User Info',
      content: (
        <UserInfoForm
          data={_stepData}
          onChange={(data) => setStepData(data)}
        />
      )
    },
    {
      title: 'Permissions',
      content: (
        <PermissionsSelector
          data={_stepData}
          onChange={(data) => setStepData(data)}
        />
      )
    },
    {
      title: 'Preview',
      content: (
        <PreviewUser
          data={_stepData}
        />
      )
    },
    {
      title: 'Confirm',
      content: (
        <ConfirmUser
          data={_stepData}
        />
      )
    }
  ]

  const handleNext = async () => {
    const _result = await nextStep(_stepData)
    if (_result.success) {
      // Keep _stepData for next step
    }
  }

  const _handleConfirm = async () => {
    const _result = await confirmTx(_stepData)
    if (_result.success) {
      onComplete?.(_result.result)
    }
  }

  const _handleCancel = async () => {
    await cancelTx()
  }

  return (
    <FormStepper
      steps={_steps}
      currentStep={_step}
      onNext={handleNext}
      onPrevious={() => {}}
      onConfirm={_handleConfirm}
      onCancel={_handleCancel}
      isLoading={_isLoading}
      error={_error}
    />
  )
}

CreateUserStepper.propTypes = {
  onComplete: PropTypes.func
}

export default CreateUserStepper
