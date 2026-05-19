/**
 * LoginHistory Component
 *
 * Display login attempts and history — UC_AUTH_05
 * Connected to /api/audit/logs?type=LOGIN&user=current via auditSlice
 */

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchLoginHistory,
  selectLoginHistory,
  selectLoginHistoryLoading,
} from '@store/slices/audit'

export default function LoginHistory() {
  const dispatch = useDispatch()
  const history = useSelector(selectLoginHistory)
  const loading = useSelector(selectLoginHistoryLoading)

  useEffect(() => {
    dispatch(fetchLoginHistory())
  }, [dispatch])

  if (loading) {
    return <div className="login-history loading" role="status">Loading history...</div>
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
