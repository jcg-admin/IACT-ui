/**
 * ScheduledReports Component
 * 
 * Manage scheduled report generation
 */

import React, { useState, useEffect } from 'react'
import { getNotificationService } from '@services/notificationGateway'

export default function ScheduledReports() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const notify = getNotificationService()

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      
      const mockSchedules = [
        {
          id: '1',
          name: 'Daily Summary',
          frequency: 'daily',
          time: '09:00 AM',
          email: 'admin@example.com',
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Weekly Report',
          frequency: 'weekly',
          time: 'Monday 08:00 AM',
          email: 'team@example.com',
          lastRun: new Date(Date.now() - 604800000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          name: 'Monthly Analytics',
          frequency: 'monthly',
          time: '1st of month, 10:00 AM',
          email: 'management@example.com',
          lastRun: new Date(Date.now() - 2592000000).toISOString(),
          status: 'paused'
        }
      ]

      setSchedules(mockSchedules)
      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load schedules: ${error.message}`)
      setLoading(false)
    }
  }

  const handleToggleSchedule = async (id) => {
    setSchedules(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    )
    notify.success('Schedule updated')
  }

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule?')) return
    
    setSchedules(prev => prev.filter(s => s.id !== id))
    notify.success('Schedule deleted')
  }

  if (loading) {
    return <div className="scheduled-reports loading">Loading schedules...</div>
  }

  return (
    <div className="scheduled-reports">
      <div className="reports-header">
        <h2>Scheduled Reports</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          Add Schedule
        </button>
      </div>

      <div className="schedules-list">
        {schedules.map(schedule => (
          <div key={schedule.id} className={`schedule-card status-${schedule.status}`}>
            <div className="schedule-info">
              <h3>{schedule.name}</h3>
              <p>{schedule.frequency} at {schedule.time}</p>
              <p className="email">{schedule.email}</p>
              <p className="last-run">
                Last run: {new Date(schedule.lastRun).toLocaleString()}
              </p>
            </div>
            <div className="schedule-actions">
              <button
                onClick={() => handleToggleSchedule(schedule.id)}
                className={`btn ${schedule.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
              >
                {schedule.status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => handleDeleteSchedule(schedule.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
