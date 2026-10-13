import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCrestIcon, LogOutIcon } from '../icons';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function DashboardLayout({ title, roleLabel, navItems, activeTab, onTabChange, children }) {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header flex items-center gap-3">
          <div className="school-crest" style={{ width: '38px', height: '38px' }}>
            <ShieldCrestIcon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text-inverse)' }}>
              [School Portal]
            </div>
            <Badge variant="gold" style={{ fontSize: '0.6875rem', padding: '2px 6px' }}>
              {roleLabel}
            </Badge>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="sidebar-nav">
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '0.5rem 1rem 0.25rem' }}>
            Management
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link to="/" className="sidebar-link">
              <span>🏠</span>
              <span>View Public Website</span>
            </Link>
            <button
              type="button"
              className="sidebar-link"
              style={{ color: '#f87171' }}
              onClick={handleLogout}
            >
              <LogOutIcon size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header flex-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
            <h1 className="heading-sm" style={{ color: 'var(--color-navy-900)' }}>{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Signed in as: <strong style={{ color: 'var(--color-navy-900)' }}>{userEmail || 'Authenticated User'}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOutIcon size={14} />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
