/**
 * AnimatedLoadingSpinner Component
 * 
 * Loading spinner with Framer Motion animations
 * Smooth rotating spinner with optional fade in/out
 * 
 * Usage:
 *   <AnimatedLoadingSpinner />
 *   <AnimatedLoadingSpinner size="lg" message="Loading data..." />
 */

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Spinner rotation animation
 */
const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

/**
 * Container fade in animation
 */
const containerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
}

/**
 * AnimatedLoadingSpinner - Animated loading spinner
 * 
 * Displays a smooth rotating spinner with optional message
 * Can be full screen or inline
 * 
 * @param {Object} props
 * @param {boolean} props.fullScreen - Display as full screen overlay (default: false)
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.overlay - Show overlay background (default: true)
 * @returns {React.ReactElement}
 * 
 * Example:
 *   <AnimatedLoadingSpinner fullScreen size="lg" message="Loading your data..." />
 */
export default function AnimatedLoadingSpinner({
  fullScreen = false,
  size = 'md',
  message = null,
  overlay = true,
}) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  const spinnerSize = sizeMap[size] || sizeMap.md

  const spinner = (
    <motion.div
      className="flex flex-column items-center justify-center"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* Spinner circle */}
      <motion.div
        variants={spinnerVariants}
        animate="spin"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid rgba(15, 23, 42, 0.2)',
          borderTop: '3px solid #0ea5e9',
          borderRadius: '50%',
        }}
      />

      {/* Optional message */}
      {message && (
        <motion.p
          style={{
            marginTop: '16px',
            color: '#cbd5e1',
            fontSize: '14px',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <motion.div
        className="loading-overlay-animated"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: overlay ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {spinner}
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center p-lg">
      {spinner}
    </div>
  )
}

/**
 * Export animation variants for custom use
 */
export { spinnerVariants, containerVariants }
