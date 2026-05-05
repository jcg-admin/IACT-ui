import React from 'react'
import PropTypes from 'prop-types'

function SoDValidation({ conflicts, onNext }) {
  return (
    <div className="content-sod-validation">
      <h3>SoD Validation Results</h3>
      {conflicts && conflicts.length > 0 ? (
        <>
          <p>{conflicts.length} conflictos detectados:</p>
          <ul>
            {conflicts.map(c => (
              <li key={c.id}>{c.field}: {c.message}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>No hay conflictos. Continuar.</p>
      )}
    </div>
  )
}

SoDValidation.propTypes = {
  conflicts: PropTypes.array,
  onNext: PropTypes.func
}

export default SoDValidation
