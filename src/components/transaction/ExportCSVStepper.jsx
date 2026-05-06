/**
 * ExportCSVStepper Component
 * Stepper específico para exportar CSV
 * Usa FormStepper base como componente genérico
 * Incluye Job tracking automatico
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import useTransaction from '@hooks/domain/useTransaction'
import useJobPolling from '@hooks/domain/useJobPolling'
import FormStepper from './FormStepper'
import FilterForm from './content/FilterForm'
import PreviewResults from './content/PreviewResults'
import ProgressBar from '@components/jobs/ProgressBar'

function ExportCSVStepper({ onComplete }) {
  const [_stepData, setStepData] = useState({})
  const [_jobId, setJobId] = useState(null)
  const {
    transaction: _tx,
    step: _step,
    isLoading: _isLoading,
    error: _error,
    startTx,
    nextStep,
    confirmTx,
    cancelTx
  } = useTransaction('export_csv')

  const { job, progress, downloadResult, stopPolling } = useJobPolling(_jobId)

  // Iniciar transacción al montar
  React.useEffect(() => {
    if (!_tx.id) {
      startTx({})
    }
  }, [_tx.id, startTx])

  // Steps definition
  const _steps = [
    {
      title: 'Filters',
      content: (
        <FilterForm
          data={_stepData}
          onChange={(data) => setStepData(data)}
        />
      )
    },
    {
      title: 'Export',
      content: _jobId ? (
        <div>
          <p>Exporting CSV...</p>
          <ProgressBar
            progress={progress}
            etaSeconds={job?.eta}
            showPercent
            showEta
          />
          <button onClick={downloadResult} disabled={job?.status !== 'completed'}>
            Download
          </button>
        </div>
      ) : (
        <PreviewResults data={_stepData} />
      )
    }
  ]

  const handleNext = async () => {
    const _result = await nextStep(_stepData)
    if (_result.success) {
      // Inicia job asincrono
      // El backend retorna jobId que se almacena en transacción
      setJobId(_tx.id) // Usar transaction ID como job ID (simplificado)
    }
  }

  const _handleConfirm = async () => {
    const _result = await confirmTx(_stepData)
    if (_result.success) {
      stopPolling()
      onComplete?.(_result.result)
    }
  }

  const _handleCancel = async () => {
    stopPolling()
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

ExportCSVStepper.propTypes = {
  onComplete: PropTypes.func
}

export default ExportCSVStepper
