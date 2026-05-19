import React from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'
import ContextErrorBanner from '../components/feedback/ContextErrorBanner'

export default function ModuleLayout({ context }) {
  return (
    <>
      <ContextErrorBanner context={context} />
      <Outlet />
    </>
  )
}

ModuleLayout.propTypes = {
  context: PropTypes.string.isRequired,
}
