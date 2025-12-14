import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard'
    },
    {
      path: '/message-template',
      name: 'Message Templates'
    },
    {
      path: '/quote-generator',
      name: 'Quote Generator'
    }
    // Thêm các tool khác ở đây sau này
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? '60px' : '250px',
        background: '#000',
        color: 'white',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
        borderRight: '1px solid #333'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={logo} 
                alt="MistyDev Logo" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px',
                  objectFit: 'cover'
                }} 
              />
              <h2 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '500' }}>
                Mini Tools Suite
              </h2>
            </div>
          )}
          {sidebarCollapsed && (
            <img 
              src={logo} 
              alt="MistyDev Logo" 
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '4px',
                objectFit: 'cover',
                margin: '0 auto'
              }} 
            />
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: '1px solid #333',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '3px'
            }}
          >
            {sidebarCollapsed ? '>' : '<'}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '10px 0' }}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                display: 'block',
                padding: '15px 20px',
                color: isActive(item.path) ? '#fff' : '#ccc',
                textDecoration: 'none',
                background: isActive(item.path) ? '#333' : 'transparent',
                borderRight: isActive(item.path) ? '2px solid #fff' : 'none',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: isActive(item.path) ? '500' : '400'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = '#222'
                  e.target.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = 'transparent'
                  e.target.style.color = '#ccc'
                }
              }}
            >
              {!sidebarCollapsed ? item.name : item.name.charAt(0)}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            fontSize: '11px',
            color: '#666',
            textAlign: 'center'
          }}>
            v1.0.0
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarCollapsed ? '60px' : '250px',
        flex: 1,
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#fff',
          padding: '20px 30px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#000', fontWeight: '600' }}>
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>
              {new Date().toLocaleDateString('vi-VN')}
            </span>
            <img 
              src={logo} 
              alt="MistyDev Logo" 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '6px',
                objectFit: 'cover',
                border: '2px solid #f0f0f0'
              }} 
            />
          </div>
        </div>

        {/* Page Content */}
        <main style={{ padding: '30px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout