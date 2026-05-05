/**
 * ProgressBar Component
 * Muestra barra de progreso con porcentaje y ETA
 * 
 * Props:
 *   progress: number (0-100)
 *   total: number (total items - opcional)
 *   etaSeconds: number (segundos restantes - opcional)
 *   size: 'sm' | 'md' | 'lg'
 *   label: string (etiqueta)
 *   showPercent: bool
 *   showEta: bool
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import '@styles/components/_progress-bar.scss'

function ProgressBar({
  progress = 0,
  total = null,
  etaSeconds = null,
  size = 'md',
  label = null,
  showPercent = true,
  showEta = true
}) {
  // ====== COMPUTED ======

  // Clamp progress entre 0-100
  const _progress = useMemo(() => {
    return Math.max(0, Math.min(100, progress))
  }, [progress])

  // Formato de ETA
  const _etaFormatted = useMemo(() => {
    if (!etaSeconds || etaSeconds <= 0) return null

    const _hours = Math.floor(etaSeconds / 3600)
    const _minutes = Math.floor((etaSeconds % 3600) / 60)
    const _seconds = etaSeconds % 60

    if (_hours > 0) {
      return `${_hours}h ${_minutes}m`
    }
    if (_minutes > 0) {
      return `${_minutes}m ${_seconds}s`
    }
    return `${_seconds}s`
  }, [etaSeconds])

  // Porcentaje actual (con total si está)
  const _progressText = useMemo(() => {
    if (total) {
      const _current = Math.round((_progress / 100) * total)
      return `${_current} / ${total}`
    }
    return `${_progress}%`
  }, [_progress, total])

  // Status visual
  const _status = useMemo(() => {
    if (_progress === 100) return 'completed'
    if (_progress > 0) return 'processing'
    return 'queued'
  }, [_progress])

  // ====== RENDER ======

  return (
    <div className={`progress-bar progress-bar--${size} progress-bar--${_status}`}>
      {/* Label */}
      {label && (
        <div className="progress-bar__label">
          <span>{label}</span>
        </div>
      )}

      {/* Progress Container */}
      <div className="progress-bar__container">
        {/* Bar */}
        <div className="progress-bar__bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${_progress}%` }}
            role="progressbar"
            aria-valuenow={_progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Progress: ${_progress}%`}
          />
        </div>

        {/* Meta (right side) */}
        {(showPercent || showEta) && (
          <div className="progress-bar__meta">
            {showPercent && (
              <span className="progress-bar__percent">{_progressText}</span>
            )}
            {showEta && _etaFormatted && (
              <span className="progress-bar__eta">{_etaFormatted}</span>
            )}
          </div>
        )}
      </div>

      {/* Status Text */}
      {_progress === 100 && (
        <div className="progress-bar__status-text">Completed</div>
      )}
      {_progress === 0 && (
        <div className="progress-bar__status-text">Queued</div>
      )}
      {_progress > 0 && _progress < 100 && (
        <div className="progress-bar__status-text">Processing</div>
      )}
    </div>
  )
}

ProgressBar.propTypes = {
  progress: PropTypes.number,
  total: PropTypes.number,
  etaSeconds: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  showPercent: PropTypes.bool,
  showEta: PropTypes.bool
}

export default ProgressBar
