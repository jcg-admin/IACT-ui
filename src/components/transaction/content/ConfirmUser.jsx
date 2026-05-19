import React from 'react'
import PropTypes from 'prop-types'

function ConfirmUser({ data }) {
  return (
    <div className="content-confirm-user">
      <h3>Confirmar Creación</h3>
      <div className="confirm-section">
        <p>¿Estás seguro de que deseas crear este usuario?</p>
        <div className="confirm-details">
          <p><strong>{data.firstName} {data.lastName}</strong></p>
          <p>{data.email}</p>
          <p>@{data.username}</p>
        </div>
        <p className="confirm-note">Presiona &quot;Confirmar&quot; para completar la creación.</p>
      </div>
    </div>
  )
}

ConfirmUser.propTypes = {
  data: PropTypes.object
}

export default ConfirmUser
