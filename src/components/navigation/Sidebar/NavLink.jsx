/**
 * NavLink Component
 * Individual navigation link for sidebar
 */

import React from 'react'
import PropTypes from 'prop-types'
import './NavLink.scss'

export default function NavLink({
  label = 'Link',
  icon = '',
  isActive = false,
  onClick = () => {},
  title = '',
}) {
  return (
    <button
      className={`navLink${isActive ? ' active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={title}
    >
      {icon && <span className="icon">{icon}</span>}
      <span className="label">{label}</span>
    </button>
  )
}

NavLink.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string,
}
