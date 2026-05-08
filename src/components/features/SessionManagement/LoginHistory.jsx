/**
 * LoginHistory Component
 * 
 * Display login attempts and history
 */

import React, { useState, useEffect } from 'react'
import { getNotificationService } from '@api/notificationGateway'

export default function LoginHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const notify = getNotificationService()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      
      // Mock data - in production, call API
      const mockHistory = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          device: 'Chrome on MacOS',
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          device: 'Safari on iPhone',
          ip: '192.168.1.101',
          location: 'San Francisco, CA',
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          device: 'Unknown Browser',
          ip: '203.0.113.50',
          location: 'Unknown',
          status: 'failed'
        }
      ]

      setHistory(mockHistory)
      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load history: ${error.message}`)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="login-history loading">Loading history...</div>
  }

  return (
    <div className="login-history">
      <div className="page-header">
        <h1>Login History</h1>
        <p>View all login attempts and suspicious activities</p>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Device</th>
            <th>IP Address</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} className={`status-${entry.status}`}>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
              <td>{entry.device}</td>
              <td className="ip">{entry.ip}</td>
              <td>{entry.location}</td>
              <td>
                <span className={`badge badge-${entry.status}`}>
                  {entry.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
