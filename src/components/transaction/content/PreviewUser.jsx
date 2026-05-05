import React from 'react'
import PropTypes from 'prop-types'

function PreviewUser({ data }) {
  return (
    <div className="content-preview-user">
      <h3>Preview Usuario</h3>
      <div className="preview-card">
        <div className="preview-row">
          <span className="label">Nombre:</span>
          <span className="value">{data.firstName} {data.lastName}</span>
        </div>
        <div className="preview-row">
          <span className="label">Email:</span>
          <span className="value">{data.email}</span>
        </div>
        <div className="preview-row">
          <span className="label">Username:</span>
          <span className="value">{data.username}</span>
        </div>
        <div className="preview-row">
          <span className="label">Permisos:</span>
          <span className="value">{(data.permissions || []).join(', ') || 'Ninguno'}</span>
        </div>
      </div>
    </div>
  )
}

PreviewUser.propTypes = {
  data: PropTypes.object
}

export default PreviewUser
