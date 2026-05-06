import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectGlobalError,
  selectGlobalErrorIsRetryable,
  selectRetryAfter,
  selectIsPersistentError,
  clearGlobalError,
} from '@redux/slices/errorSlice'

const AUTO_CLOSE_MS = 6000

function severityFromError(error) {
  if (!error) return null
  const { statusCode } = error
  if (statusCode >= 500) return 'danger'
  if (statusCode === 429 || statusCode === 408 || statusCode === 413) return 'warning'
  if (statusCode >= 400) return 'danger'
  return 'danger'
}

const ICON_BY_SEVERITY = {
  info: 'info_outline',
  success: 'check',
  warning: 'warning',
  danger: 'error_outline',
}

export default function ApiErrorAlert() {
  const dispatch = useDispatch()
  const error = useSelector(selectGlobalError)
  const isRetryable = useSelector(selectGlobalErrorIsRetryable)
  const retryAfterSeconds = useSelector(selectRetryAfter)
  const isPersistent = useSelector(selectIsPersistentError)

  const [countdown, setCountdown] = useState(null)
  const autoCloseTimer = useRef(null)
  const countdownInterval = useRef(null)

  const severity = severityFromError(error)

  useEffect(() => {
    if (!error || isPersistent) return

    // Start countdown for 429 rate-limit
    if (retryAfterSeconds != null && retryAfterSeconds > 0) {
      setCountdown(retryAfterSeconds)
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    // Auto-close for transient errors
    autoCloseTimer.current = setTimeout(() => {
      dispatch(clearGlobalError())
    }, AUTO_CLOSE_MS)

    return () => {
      clearTimeout(autoCloseTimer.current)
      clearInterval(countdownInterval.current)
    }
  }, [error, dispatch, isPersistent, retryAfterSeconds])

  // 503/502 persistent errors are handled by ServerErrorBanner — skip here
  if (isPersistent || !error || !severity) return null

  const icon = ICON_BY_SEVERITY[severity]
  const severityLabel = { info: 'Info', success: 'Éxito', warning: 'Advertencia', danger: 'Error' }[severity]

  return (
    <div className={`api-error-alert api-error-alert--${severity}`} role="alert" aria-live="assertive">
      <span className="api-error-alert__icon material-icons" aria-hidden="true">
        {icon}
      </span>
      <div className="api-error-alert__body">
        <strong className="api-error-alert__label">{severityLabel}:</strong>{' '}
        <span className="api-error-alert__message">{error.message}</span>
        {countdown != null && (
          <span className="api-error-alert__countdown"> Reintentar en {countdown}s</span>
        )}
      </div>
      <div className="api-error-alert__actions">
        {isRetryable && !countdown && (
          <button
            className="api-error-alert__retry"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        )}
        <button
          className="api-error-alert__close"
          aria-label="Cerrar"
          onClick={() => dispatch(clearGlobalError())}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  )
}
