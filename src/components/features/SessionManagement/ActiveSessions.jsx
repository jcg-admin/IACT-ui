/**
 * ActiveSessions Component
 *
 * Display active sessions and devices — UC-AUTH sessions management.
 */

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveSessions,
  revokeSession,
  selectActiveSessions,
  selectSessionsLoading,
  selectSessionsError,
} from '@store/slices/auth'

export default function ActiveSessions() {
  const dispatch = useDispatch()
  const sessions = useSelector(selectActiveSessions)
  const loading = useSelector(selectSessionsLoading)
  const error = useSelector(selectSessionsError)

  useEffect(() => {
    dispatch(fetchActiveSessions())
  }, [dispatch])

  const handleRevokeSession = (sessionId) => {
    if (!window.confirm('Revoke this session?')) return
    dispatch(revokeSession(sessionId))
  }

  if (loading) {
    return <div className="active-sessions loading" role="status" aria-busy="true">Loading sessions...</div>
  }

  return (
    <div className="active-sessions">
      <div className="page-header">
        <h1>Active Sessions</h1>
        <p>Manage your active sessions and devices</p>
      </div>

      {error && (
        <div role="alert" className="error-banner" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

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
