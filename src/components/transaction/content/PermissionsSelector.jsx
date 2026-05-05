import React from 'react'
import PropTypes from 'prop-types'

function PermissionsSelector({ data, onChange }) {
  const _permissions = ['read', 'write', 'delete', 'admin']

  const _handleToggle = (perm) => {
    const _current = data.permissions || []
    const _updated = _current.includes(perm)
      ? _current.filter(p => p !== perm)
      : [..._current, perm]
    onChange?.({ ...data, permissions: _updated })
  }

  return (
    <div className="content-permissions-selector">
      <h3>Seleccionar Permisos</h3>
      <div className="permissions-list">
        {_permissions.map(perm => (
          <div key={perm} className="permission-item">
            <input
              type="checkbox"
              id={`perm-${perm}`}
              checked={(data.permissions || []).includes(perm)}
              onChange={() => _handleToggle(perm)}
            />
            <label htmlFor={`perm-${perm}`}>{perm.toUpperCase()}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

PermissionsSelector.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func
}

export default PermissionsSelector
