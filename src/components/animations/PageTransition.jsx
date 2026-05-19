/**
 * PageTransition Component
 * 
 * Wraps pages with fade in/out animations
 * Uses Framer Motion for smooth transitions between routes
 * 
 * Usage:
 *   <PageTransition>
 *     <YourPageContent />
 *   </PageTransition>
 */

import React from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * Animation variants for page transitions
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

/**
 * PageTransition - Wrapper for page transitions
 * 
 * Provides smooth fade in/out animations when navigating between pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to wrap
 * @param {string} props.key - Unique key for animation trigger (usually route path)
 * @returns {React.ReactElement}
 * 
 * Example:
 *   <PageTransition key={location.pathname}>
 *     <Route {...props} />
 *   </PageTransition>
 */
export default function PageTransition({ children, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Export animation variants for custom use
 */
export { pageVariants }
PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
}
