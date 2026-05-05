import React from 'react'
import PropTypes from 'prop-types'

function SeparationRulesValidation({ conflicts, onNext }) {
  return (
    <div className="content-separation-rules-validation">
      <h3>Resultados de Validación de Separación de Funciones</h3>
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

SeparationRulesValidation.propTypes = {
  conflicts: PropTypes.array,
  onNext: PropTypes.func
}

export default SeparationRulesValidation
