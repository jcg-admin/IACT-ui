import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '@ui/shared/Modal'

export default function GroupAssignModal({
  isOpen,
  mode = 'assign',
  groups = [],
  onConfirm,
  onClose,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  if (!isOpen) return null

  const title = mode === 'assign' ? 'Asignar grupo' : 'Revocar grupo'

  const handleConfirm = () => {
    if (selectedGroupId === null) return
    onConfirm(selectedGroupId)
    setSelectedGroupId(null)
  }

  const handleClose = () => {
    setSelectedGroupId(null)
    onClose()
  }

  const footer = (
    <>
      <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={selectedGroupId === null}
      >
        Confirmar
      </button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm" footer={footer}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {groups.map((group) => (
          <li key={group.id} style={{ padding: '8px 0' }}>
            <label htmlFor={`group-${group.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                id={`group-${group.id}`}
                type="radio"
                name="group-select"
                value={group.id}
                aria-label={group.name}
                checked={selectedGroupId === group.id}
                onChange={() => setSelectedGroupId(group.id)}
              />
              {group.name}
              {group.code && <span style={{ fontSize: '12px', color: '#9ca3af' }}>({group.code})</span>}
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

GroupAssignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['assign', 'revoke']),
  groups: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string,
  })),
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
