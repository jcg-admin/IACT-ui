/**
 * SessionWarning Component
 * 
 * Display timeout warning when session about to expire
 */

import React, { useState, useEffect } from 'react'
import userAuth from '../../../facades/UserAuth'
import { getNotificationService } from '@services/notificationService'

export default function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes

  const notify = getNotificationService()

  useEffect(() => {
    // Check session every 30 seconds
    const checkInterval = setInterval(async () => {
      const isValid = await userAuth.checkSession()
      
      if (!isValid && timeRemaining > 0) {
        setShowWarning(true)
        setTimeRemaining(prev => prev - 30)
      }
    }, 30000)

    return () => clearInterval(checkInterval)
  }, [timeRemaining])

  const handleRefresh = async () => {
    try {
      await userAuth.refreshSession()
      setShowWarning(false)
      setTimeRemaining(300)
      notify.success('Session refreshed')
    } catch (error) {
      notify.error('Failed to refresh session')
    }
  }

  const handleLogout = async () => {
    try {
      await userAuth.endSession()
      window.location.href = '/login'
    } catch (error) {
      notify.error('Logout failed')
    }
  }

  if (!showWarning) return null

  return (
    <div className="session-warning">
      <div className="warning-content">
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire in {timeRemaining} seconds</p>
        <div className="warning-actions">
          <button onClick={handleRefresh} className="btn btn-primary">
            Keep Session Active
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )
}
