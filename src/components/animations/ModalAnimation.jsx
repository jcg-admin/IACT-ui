/**
 * ModalAnimation Component
 * 
 * Modal with smooth scale and fade animations
 * Uses Framer Motion for entrance/exit animations
 * 
 * Usage:
 *   <ModalAnimation isOpen={true} onClose={handleClose}>
 *     <ModalContent />
 *   </ModalAnimation>
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * Backdrop (overlay) animation
 */
const backdropVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
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
 * Modal content animation
 */
const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

/**
 * ModalAnimation - Modal with animations
 * 
 * Displays a modal with smooth entrance and exit animations
 * Backdrop closes modal on click
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.className - Custom CSS classes
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg' (default: 'md')
 * @returns {React.ReactElement}
 * 
 * Example:
 *   <ModalAnimation isOpen={showModal} onClose={() => setShowModal(false)}>
 *     <div className="modal-header">
 *       <h2>Modal Title</h2>
 *     </div>
 *     <div className="modal-body">
 *       Modal content here
 *     </div>
 *   </ModalAnimation>
 */
export default function ModalAnimation({
  isOpen,
  onClose,
  children,
  className = '',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  const modalSize = sizeClasses[size] || sizeClasses.md

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className={`bg-slate-800 rounded-lg shadow-lg p-lg ${modalSize} ${className}`}
              style={{
                pointerEvents: 'auto',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Export animation variants for custom use
 */
export { backdropVariants, modalVariants }
ModalAnimation.propTypes = {
  isOpen:    PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  children:  PropTypes.node,
  className: PropTypes.string,
  size:      PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
}
