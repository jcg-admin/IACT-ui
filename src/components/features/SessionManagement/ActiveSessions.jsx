/**
 * ActiveSessions Component
 * 
 * Display active sessions and devices
 */

import React, { useState, useEffect } from 'react'
import userAuth from '../../../facades/UserAuth'
import { getNotificationService } from '@services/notificationService'

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const notify = getNotificationService()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      
      // Mock data - in production, call API
      const mockSessions = [
        {
          id: 'session-1',
          device: 'Chrome on MacOS',
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          lastActive: new Date(Date.now() - 300000).toISOString(),
          isCurrent: true
        },
        {
          id: 'session-2',
          device: 'Safari on iPhone',
          ip: '192.168.1.101',
          location: 'San Francisco, CA',
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false
        },
        {
          id: 'session-3',
          device: 'Firefox on Windows',
          ip: '192.168.1.102',
          location: 'New York, NY',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          isCurrent: false
        }
      ]

      setSessions(mockSessions)
      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load sessions: ${error.message}`)
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Revoke this session?')) return

    try {
      // In production, call API to revoke session
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      notify.success('Session revoked')
    } catch (error) {
      notify.error('Failed to revoke session')
    }
  }

  if (loading) {
    return <div className="active-sessions loading">Loading sessions...</div>
  }

  return (
    <div className="active-sessions">
      <div className="page-header">
        <h1>Active Sessions</h1>
        <p>Manage your active sessions and devices</p>
      </div>

      <div className="sessions-list">
        {sessions.map((sess) => (
          <div key={sess.id} className={`session-card ${sess.isCurrent ? 'current' : ''}`}>
            <div className="session-header">
              <h3>{sess.device}</h3>
              {sess.isCurrent && <span className="badge badge-current">Current</span>}
            </div>
            <div className="session-details">
              <div className="detail">
                <span className="label">IP Address:</span>
                <span className="value">{sess.ip}</span>
              </div>
              <div className="detail">
                <span className="label">Location:</span>
                <span className="value">{sess.location}</span>
              </div>
              <div className="detail">
                <span className="label">Last Active:</span>
                <span className="value">
                  {new Date(sess.lastActive).toLocaleString()}
                </span>
              </div>
            </div>
            {!sess.isCurrent && (
              <button
                onClick={() => handleRevokeSession(sess.id)}
                className="btn btn-danger"
              >
                Revoke Session
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
