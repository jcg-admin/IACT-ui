import React from 'react'
import PropTypes from 'prop-types'

function ConfirmAssignment({ data }) {
  return (
    <div className="content-confirm-assignment">
      <h3>Confirmar Cambios</h3>
      <div className="confirm-summary">
        <p>Se realizarán los siguientes cambios:</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <p className="confirm-warning">Esta acción no se puede deshacer. Asegúrate de que los datos sean correctos.</p>
      </div>
    </div>
  )
}

ConfirmAssignment.propTypes = {
  data: PropTypes.object
}

export default ConfirmAssignment
