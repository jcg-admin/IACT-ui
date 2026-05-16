/**
 * useLocalTransaction — sustituto de useTransaction (T5.2)
 *
 * El sistema de transacciones multi-paso (/api/transaction/...) no existe en IACT-api.
 * Este hook gestiona el estado multi-paso localmente (UI state puro).
 * Las operaciones reales se despachan via Redux thunks desde el componente padre.
 */
import { useState, useRef, useEffect } from 'react'

export function useLocalTransaction(txType) {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transaction, setTransaction] = useState({
    id: null, type: txType, conflicts: [], data: {}, status: 'idle'
  })
  const isMounted = useRef(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup al desmontar, sin dependencias intencional
  useEffect(() => {
    return () => { isMounted.current = false }
  }, [])

  const startTx = async (initialData = {}) => {
    setTransaction(tx => ({
      ...tx, id: `local-${Date.now()}`, initialData, status: 'started'
    }))
    return { success: true }
  }

  const nextStep = async (stepData = {}) => {
    setTransaction(tx => ({ ...tx, data: { ...tx.data, ...stepData } }))
    setStep(s => s + 1)
    return { success: true, step: step + 1 }
  }

  const prevStep = () => setStep(s => Math.max(0, s - 1))

  const confirmTx = async (finalData = {}) => {
    try {
      setIsLoading(true)
      setTransaction(tx => ({ ...tx, data: { ...tx.data, ...finalData }, status: 'confirmed' }))
      return { success: true, result: { ...transaction.data, ...finalData } }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      if (isMounted.current) setIsLoading(false)
    }
  }

  const cancelTx = async () => {
    setTransaction({ id: null, type: txType, conflicts: [], data: {}, status: 'cancelled' })
    setStep(0)
    setError(null)
    return { success: true }
  }

  const resolveConflict = async (conflictId) => {
    setTransaction(tx => ({
      ...tx, conflicts: tx.conflicts.filter(c => c.id !== conflictId)
    }))
    return { success: true }
  }

  return { transaction, step, isLoading, error, startTx, nextStep, prevStep, confirmTx, cancelTx, resolveConflict }
}

export default useLocalTransaction
