/**
 * AssignFunctionStepper Component
 * Stepper específico para asignar funciones a usuario
 * Usa FormStepper base como componente genérico
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import useTransaction from '@hooks/useTransaction'
import FormStepper from './FormStepper'
import SeparationRulesValidation from './content/SeparationRulesValidation'
import ConflictResolver from './content/ConflictResolver'
import ConfirmAssignment from './content/ConfirmAssignment'

function AssignFunctionStepper({ userId, onComplete }) {
  const [_stepData, setStepData] = useState({})
  const {
    transaction: _tx,
    step: _step,
    isLoading: _isLoading,
    error: _error,
    startTx,
    nextStep,
    confirmTx,
    cancelTx,
    resolveConflict
  } = useTransaction('assign_function')

  // Iniciar transacción al montar
  React.useEffect(() => {
    if (!_tx.id) {
      startTx({ userId })
    }
  }, [_tx.id, userId, startTx])

  // Steps definition
  const _steps = [
    {
      title: 'Validate Separation Rules',
      content: (
        <SeparationRulesValidation
          conflicts={_tx.conflicts}
          onNext={() => handleNext()}
        />
      )
    },
    {
      title: 'Resolve',
      content: (
        <ConflictResolver
          conflicts={_tx.conflicts}
          onResolve={_handleResolveConflict}
        />
      )
    },
    {
      title: 'Confirm',
      content: (
        <ConfirmAssignment
          data={_tx.data}
        />
      )
    }
  ]

  const handleNext = async () => {
    const _result = await nextStep(_stepData)
    if (_result.success) {
      setStepData({})
    }
  }

  const _handleResolveConflict = async (_conflictId, _resolution) => {
    await resolveConflict(_conflictId, _resolution)
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

AssignFunctionStepper.propTypes = {
  userId: PropTypes.number.isRequired,
  onComplete: PropTypes.func
}

export default AssignFunctionStepper
