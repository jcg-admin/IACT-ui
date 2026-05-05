/**
 * BreadcrumbNav Component
 * Navigation breadcrumb showing current page
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './BreadcrumbNav.module.scss'

export default function BreadcrumbNav({
  currentPage = 'Dashboard',
  basePath = 'Dashboard',
}) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        <li>
          <a href="/" className={styles.link}>{basePath}</a>
        </li>
        {currentPage !== basePath && (
          <>
            <li className={styles.separator}>/</li>
            <li>
              <span className={styles.current}>{currentPage}</span>
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
