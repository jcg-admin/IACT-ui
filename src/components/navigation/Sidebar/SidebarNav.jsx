/**
 * SidebarNav Component
 * Navigation container for sidebar links
 */

import React from 'react'
import PropTypes from 'prop-types'
import './SidebarNav.scss'

export default function SidebarNav({
  navLinks = [],
  currentPage = '',
  onNavigate = () => {},
  isCollapsed = false,
}) {
  return (
    <nav className="sidebarNav">
      <ul className="navList">
        {navLinks.map((link) => (
          <li key={link.id} className="navItem">
            <button
              className={`navLink${currentPage === link.label ? ' active' : ''}`}
              onClick={() => onNavigate(link)}
              aria-current={currentPage === link.label ? 'page' : undefined}
              title={isCollapsed ? link.label : undefined}
            >
              {link.icon && <span className="icon">{link.icon}</span>}
              {!isCollapsed && <span className="label">{link.label}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

SidebarNav.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
      icon: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  currentPage: PropTypes.string,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}
