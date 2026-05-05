import React, { useState } from 'react'
import PropTypes from 'prop-types'

function ConflictResolver({ conflicts, onResolve }) {
  const [_resolved, setResolved] = useState([])

  const _handleResolve = (conflictId) => {
    setResolved([..._resolved, conflictId])
    onResolve?.(conflictId, { action: 'remove' })
  }

  const _unresolved = conflicts?.filter(c => !_resolved.includes(c.id)) || []

  return (
    <div className="content-conflict-resolver">
      <h3>Resolver Conflictos SoD</h3>
      {_unresolved.length === 0 ? (
        <p>Todos los conflictos resueltos.</p>
      ) : (
        <>
          <p>{_unresolved.length} conflictos pendientes:</p>
          {_unresolved.map(c => (
            <div key={c.id} className="conflict-item">
              <div className="conflict-header">
                <strong>{c.field}</strong>
                <span className="conflict-severity">{c.severity}</span>
              </div>
              <p>{c.message}</p>
              {c.suggestion && <p className="conflict-suggestion">Sugerencia: {c.suggestion}</p>}
              <button onClick={() => _handleResolve(c.id)}>Resolver</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

ConflictResolver.propTypes = {
  conflicts: PropTypes.array,
  onResolve: PropTypes.func
}

export default ConflictResolver
