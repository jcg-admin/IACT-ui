/**
 * MenuButton Component
 * Toggle button for sidebar menu (mobile)
 */

import React from 'react'
import PropTypes from 'prop-types'
import './MenuButton.scss'

export default function MenuButton({
  isOpen = false,
  onClick = () => {},
}) {
  return (
    <button
      className={`menuButton${isOpen ? ' open' : ''}`}
      onClick={onClick}
      aria-label="Toggle sidebar menu"
      aria-expanded={isOpen}
    >
      <span className="line" />
      <span className="line" />
      <span className="line" />
    </button>
  )
}

MenuButton.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
}
