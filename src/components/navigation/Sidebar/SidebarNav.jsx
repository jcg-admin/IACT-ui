import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './SidebarNav.scss'

function NavLeaf({ link, currentPath, onNavigate, isCollapsed }) {
  const isActive = currentPath === link.path || currentPath.startsWith(link.path + '/')
  return (
    <li className="navItem">
      <button
        className={`navLink${isActive ? ' active' : ''}`}
        onClick={() => onNavigate(link)}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? link.label : undefined}
      >
        {link.icon && <span className="icon">{link.icon}</span>}
        {!isCollapsed && <span className="label">{link.label}</span>}
      </button>
    </li>
  )
}

NavLeaf.propTypes = {
  link: PropTypes.shape({ id: PropTypes.number, label: PropTypes.string, icon: PropTypes.string, path: PropTypes.string }),
  currentPath: PropTypes.string,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}

function NavGroup({ link, isExpanded, onToggle, currentPath, onNavigate, isCollapsed }) {
  return (
    <li className="navItem">
      <button
        className="navLink navGroup__header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        title={isCollapsed ? link.label : undefined}
      >
        {link.icon && <span className="icon">{link.icon}</span>}
        {!isCollapsed && <span className="label">{link.label}</span>}
        {!isCollapsed && (
          <span
            className={`navGroup__chevron${isExpanded ? ' navGroup__chevron--open' : ''}`}
            data-testid={`chevron-${link.id}`}
            aria-hidden="true"
          >
            ›
          </span>
        )}
      </button>
      <ul
        className={`navGroup__children${isExpanded ? ' navGroup__children--open' : ''}`}
        hidden={!isExpanded}
      >
        {link.children.map((child) => {
          const childActive = currentPath === child.path || currentPath.startsWith(child.path + '/')
          return (
            <li key={child.path} className="navItem navItem--child">
              <button
                className={`navLink navLink--child${childActive ? ' active' : ''}`}
                onClick={() => onNavigate(child)}
                aria-current={childActive ? 'page' : undefined}
              >
                {child.icon && <span className="icon">{child.icon}</span>}
                {!isCollapsed && <span className="label">{child.label}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

NavGroup.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
    icon: PropTypes.string,
    path: PropTypes.string,
    children: PropTypes.array,
  }),
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func,
  currentPath: PropTypes.string,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}

export default function SidebarNav({
  navLinks = [],
  currentPath = '',
  onNavigate = () => {},
  isCollapsed = false,
}) {
  const activeGroupId = navLinks.find(
    (l) => l.children?.some((c) => currentPath === c.path || currentPath.startsWith(c.path + '/'))
  )?.id ?? null

  const [expandedId, setExpandedId] = useState(activeGroupId)

  function handleToggle(id) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <nav className="sidebarNav">
      <ul className="navList">
        {navLinks.map((link) => {
          if (link.children && link.children.length > 0) {
            return (
              <NavGroup
                key={link.id}
                link={link}
                isExpanded={expandedId === link.id}
                onToggle={() => handleToggle(link.id)}
                currentPath={currentPath}
                onNavigate={onNavigate}
                isCollapsed={isCollapsed}
              />
            )
          }
          return (
            <NavLeaf
              key={link.id}
              link={link}
              currentPath={currentPath}
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
          )
        })}
      </ul>
    </nav>
  )
}

const childShape = PropTypes.shape({
  label: PropTypes.string,
  path: PropTypes.string,
  permission: PropTypes.string,
  icon: PropTypes.string,
})

SidebarNav.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
      icon: PropTypes.string,
      path: PropTypes.string,
      permission: PropTypes.string,
      children: PropTypes.arrayOf(childShape),
    })
  ),
  currentPath: PropTypes.string,
  onNavigate: PropTypes.func,
  isCollapsed: PropTypes.bool,
}
