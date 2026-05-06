import React from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal'

const VARIANT_CLASS = {
  danger: 'btn--danger',
  warning: 'btn--warning',
  default: 'btn--primary',
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  size = 'sm',
}) {
  const confirmClass = `btn ${VARIANT_CLASS[variant] ?? VARIANT_CLASS.default}`

  const footer = (
    <>
      <button className="btn btn--secondary" onClick={onClose}>
        {cancelLabel}
      </button>
      <button className={confirmClass} onClick={onConfirm}>
        {confirmLabel}
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
    >
      <div className="confirm-modal__message">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </Modal>
  )
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'default']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default ConfirmModal
