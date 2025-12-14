import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const stats = [
    {
      title: 'Total Templates',
      value: '12',
      color: '#000'
    },
    {
      title: 'Messages Created Today',
      value: '8',
      color: '#000'
    },
    {
      title: 'Active Tools',
      value: '2',
      color: '#000'
    },
    {
      title: 'Time Saved',
      value: '2.5h',
      color: '#000'
    }
  ]

  const recentActivity = [
    { action: 'Created message from "Customer Greeting" template', time: '5 minutes ago' },
    { action: 'Created new "Thank You" template', time: '2 hours ago' },
    { action: 'Used "Follow Up" template', time: '3 hours ago' }
  ]

  const quickActions = [
    {
      name: 'Create Message',
      description: 'Use existing templates to create messages',
      path: '/message-template'
    },
    {
      name: 'Generate Quote',
      description: 'Create professional website quotes',
      path: '/quote-generator'
    },
    {
      name: 'Manage Templates',
      description: 'Add or edit message templates',
      path: '/message-template'
    }
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="card" style={{ marginBottom: '30px', border: '1px solid #eee' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Welcome Back</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {stats.map((stat, index) => (
          <div key={index} className="card" style={{
            background: 'white',
            border: '1px solid #eee',
            borderLeft: '3px solid #000'
          }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#000', fontWeight: '700' }}>
                {stat.value}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '13px', fontWeight: '500' }}>
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Quick Actions */}
        <div className="card" style={{ border: '1px solid #eee' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                style={{
                  display: 'block',
                  padding: '16px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f9f9f9'
                  e.target.style.borderColor = '#000'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff'
                  e.target.style.borderColor = '#eee'
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600' }}>{action.name}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ border: '1px solid #eee' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{
                padding: '12px',
                background: '#f9f9f9',
                borderRadius: '3px',
                borderLeft: '2px solid #000'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500' }}>
                  {activity.action}
                </p>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {activity.time}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home