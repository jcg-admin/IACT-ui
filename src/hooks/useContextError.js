import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectContextError, clearContextError } from '@store/slices/error'

export default function useContextError(context) {
  const error = useSelector(selectContextError(context))
  const dispatch = useDispatch()
  const clearError = useCallback(
    () => dispatch(clearContextError(context)),
    [dispatch, context]
  )
  return { error, clearError }
}
