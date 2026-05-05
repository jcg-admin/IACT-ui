/**
 * Dashboard Page
 * Main dashboard view
 */

import React from 'react'
import './Dashboard.scss'

export default function Dashboard() {
  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Welcome to the IACT Dashboard</p>

      <div className="gridContainer">
        <div className="card">
          <h2>Card 1</h2>
          <p>Content goes here</p>
        </div>
        <div className="card">
          <h2>Card 2</h2>
          <p>Content goes here</p>
        </div>
        <div className="card">
          <h2>Card 3</h2>
          <p>Content goes here</p>
        </div>
        <div className="card">
          <h2>Card 4</h2>
          <p>Content goes here</p>
        </div>
      </div>
    </div>
  )
}
