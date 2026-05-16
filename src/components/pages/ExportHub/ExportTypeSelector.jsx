/**
 * ExportTypeSelector Component
 * 
 * Select data type to export
 */

import React from 'react'
import PropTypes from 'prop-types'

const EXPORT_TYPES = [
  { id: 'users', name: 'Users', icon: '👥', description: 'User accounts and profiles' },
  { id: 'jobs', name: 'Jobs', icon: '⚙️', description: 'Job history and results' },
  { id: 'transactions', name: 'Transactions', icon: '💰', description: 'Transaction records' },
  { id: 'reports', name: 'Reports', icon: '📊', description: 'Generated reports' }
]

export default function ExportTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="type-selector">
      {EXPORT_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
        >
          <div className="type-icon">{type.icon}</div>
          <div className="type-name">{type.name}</div>
          <div className="type-description">{type.description}</div>
        </button>
      ))}
    </div>
  )
}
ExportTypeSelector.propTypes = {
  selectedType: PropTypes.string,
  onSelect:     PropTypes.func.isRequired,
}
