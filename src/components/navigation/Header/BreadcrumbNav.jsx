/**
 * BreadcrumbNav Component
 * Navigation breadcrumb showing current page
 */

import React from 'react'
import PropTypes from 'prop-types'
import './BreadcrumbNav.scss'

export default function BreadcrumbNav({
  currentPage = 'Dashboard',
  basePath = 'Dashboard',
}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumbList">
        <li>
          <a href="/" className="link">{basePath}</a>
        </li>
        {currentPage !== basePath && (
          <>
            <li className="separator">/</li>
            <li>
              <span className="current">{currentPage}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}

BreadcrumbNav.propTypes = {
  currentPage: PropTypes.string,
  basePath: PropTypes.string,
}
