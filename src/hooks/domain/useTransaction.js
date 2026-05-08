/**
 * useTransaction Hook
 * Gestiona transacciones multi-paso con estado en Redux
 * Maneja: creación, pasos, validación, conflictos, confirmación
 */

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectTx,
  selectTxStep,
  createTx,
  updateTxStep,
  addTxConflict,
  resolveTxConflict,
  confirmTx,
  cancelTx
} from '@store/slices/session'
import transactionService from '@api/transactionGateway'

export function useTransaction(_txType) {
  // Refs
  const _dispatch = useDispatch()
  const _txType_ref = useRef(_txType)
  const _isMounted = useRef(true)
  const _activeRequest = useRef(null)

  // State
  const [_isLoading, setIsLoading] = useState(false)
  const [_error, setError] = useState(null)

  // Redux selectors
  const _tx = useSelector(selectTx)
  const _step = useSelector(selectTxStep)

  // ====== HANDLERS ======

  /**
   * Iniciar transacción
   * @param {Object} _txData datos iniciales
   */
  const startTx = async (_txData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Llamar backend
      const _response = await transactionService.start(
        _txType_ref.current,
        _txData
      )

      if (!_isMounted.current) return

      // Guardar en Redux
      _dispatch(
        createTx({
          txId: _response.txId,
          type: _txType_ref.current,
          totalSteps: _response.totalSteps || 3,
          initialData: _txData
        })
      )

      // Si hay conflictos, agregarlos
      if (_response.conflicts && _response.conflicts.length > 0) {
        _response.conflicts.forEach(_conflict => {
          _dispatch(addTxConflict(_conflict))
        })
      }

      setIsLoading(false)
      return { success: true, txId: _response.txId }
    } catch (_err) {
      if (!_isMounted.current) return
      _handleError(_err)
      return { success: false, error: _err.message }
    }
  }

  /**
   * Avanzar al siguiente paso
   * @param {Object} _stepData datos del paso actual
   */
  const nextStep = async (_stepData) => {
    try {
      if (!_tx.id) {
        throw new Error('No active transaction')
      }

      setIsLoading(true)
      setError(null)

      // Llamar backend
      const _response = await transactionService.step(
        _tx.id,
        _step,
        _stepData
      )

      if (!_isMounted.current) return

      // Actualizar en Redux
      _dispatch(
        updateTxStep({
          step: _response.step,
          data: _stepData,
          conflicts: _response.conflicts || [],
          errors: _response.errors || null
        })
      )

      // Si hay nuevos conflictos, agregarlos
      if (_response.conflicts && _response.conflicts.length > 0) {
        _response.conflicts.forEach(_conflict => {
          _dispatch(addTxConflict(_conflict))
        })
      }

      setIsLoading(false)
      return { success: true, step: _response.step }
    } catch (_err) {
      if (!_isMounted.current) return
      _handleError(_err)
      return { success: false, error: _err.message }
    }
  }

  /**
   * Retroceder un paso (solo UI, sin backend)
   */
  const prevStep = () => {
    if (_step > 0) {
      _dispatch(
        updateTxStep({
          step: _step - 1,
          data: _tx.data
        })
      )
    }
  }

  /**
   * Confirmar y ejecutar transacción
   * @param {Object} _finalData datos finales
   */
  const confirmTx_handler = async (_finalData) => {
    try {
      if (!_tx.id) {
        throw new Error('No active transaction')
      }

      setIsLoading(true)
      setError(null)

      // Validar que no hay conflictos sin resolver
      if (_tx.conflicts && _tx.conflicts.length > 0) {
        throw new Error('Cannot confirm with unresolved conflicts')
      }

      // Llamar backend
      const _response = await transactionService.confirm(
        _tx.id,
        _finalData
      )

      if (!_isMounted.current) return

      // Marcar como completada
      _dispatch(confirmTx({ result: _response.result }))

      setIsLoading(false)
      return { success: true, result: _response.result }
    } catch (_err) {
      if (!_isMounted.current) return
      _handleError(_err)
      return { success: false, error: _err.message }
    }
  }

  /**
   * Cancelar transacción
   */
  const cancelTx_handler = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (_tx.id) {
        // Intentar cancelar en backend (no throw si falla)
        try {
          await transactionService.cancel(_tx.id)
        } catch (_e) {
          console.warn('Error canceling on backend:', _e)
        }
      }

      if (!_isMounted.current) return

      // Limpiar en Redux
      _dispatch(cancelTx())

      setIsLoading(false)
      return { success: true }
    } catch (_err) {
      if (!_isMounted.current) return
      _handleError(_err)
      return { success: false, error: _err.message }
    }
  }

  /**
   * Resolver conflicto
   * @param {string} _conflictId id del conflicto
   * @param {Object} _resolution datos de resolución
   */
  const resolveConflict = async (_conflictId, _resolution) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!_tx.id) {
        throw new Error('No active transaction')
      }

      // Validar resolución en backend
      const _response = await transactionService.resolveConflict(
        _tx.id,
        _conflictId,
        _resolution
      )

      if (!_isMounted.current) return

      // Remover conflicto de Redux
      _dispatch(resolveTxConflict(_conflictId))

      // Si hay nuevos conflictos, agregarlos
      if (_response.newConflicts && _response.newConflicts.length > 0) {
        _response.newConflicts.forEach(_conflict => {
          _dispatch(addTxConflict(_conflict))
        })
      }

      setIsLoading(false)
      return { success: true }
    } catch (_err) {
      if (!_isMounted.current) return
      _handleError(_err)
      return { success: false, error: _err.message }
    }
  }

  /**
   * Manejo centralizado de errores
   */
  const _handleError = (_err) => {
    console.error('[useTransaction] Error:', _err)

    let _errorMsg = 'Unknown error'

    if (_err.response?.data?.detail) {
      _errorMsg = _err.response.data.detail
    } else if (_err.message) {
      _errorMsg = _err.message
    }

    setError(_errorMsg)
    setIsLoading(false)
  }

  /**
   * Cleanup en unmount
   */
  useEffect(() => {
    return () => {
      _isMounted.current = false
      if (_activeRequest.current) {
        _activeRequest.current.abort?.()
      }
    }
  }, [])

  // ====== RETURN ======

  return {
    // Estado
    transaction: _tx,
    step: _step,
    isLoading: _isLoading,
    error: _error,

    // Métodos
    startTx,
    nextStep,
    prevStep,
    confirmTx: confirmTx_handler,
    cancelTx: cancelTx_handler,
    resolveConflict
  }
}

export default useTransaction
