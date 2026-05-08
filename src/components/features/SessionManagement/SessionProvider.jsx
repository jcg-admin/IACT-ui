/**
 * SessionManager Context Provider
 * 
 * Manages session state and auto-logout
 */

import React, { createContext, useState, useEffect, useCallback } from 'react'
import userAuth from '../../../facades/UserIdentity'

export const SessionContext = createContext()

export default function SessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const isValid = await userAuth.checkSession()
      setIsAuthenticated(isValid)
      
      if (isValid) {
        const profile = await userAuth.loadProfile()
        setSession(profile)
      } else {
        setSession(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await userAuth.refreshSession()
      if (refreshed.is_valid) {
        setSession(refreshed.user)
        setIsAuthenticated(true)
        return true
      } else {
        setIsAuthenticated(false)
        return false
      }
    } catch (error) {
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await userAuth.endSession()
      setSession(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const value = {
    session,
    isAuthenticated,
    loading,
    checkSession,
    refreshSession,
    logout
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
