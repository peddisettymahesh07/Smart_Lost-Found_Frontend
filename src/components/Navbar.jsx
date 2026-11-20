import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <span style={{ fontSize: '1.5rem', marginRight: '6px' }}>🔍</span>
          <span className="brand-text">
            Smart<span style={{ color: '#0d9488' }}>Lost</span>&amp;Found
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-only">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/lost-items" className={`nav-link ${isActive('/lost-items') ? 'active' : ''}`}>Lost Items</Link>
          <Link to="/found-items" className={`nav-link ${isActive('/found-items') ? 'active' : ''}`}>Found Items</Link>
          <Link to="/matches" className={`nav-link ${isActive('/matches') ? 'active' : ''}`}>
            ✨ AI Matches
          </Link>
          <Link to="/nearby-map" className={`nav-link ${isActive('/nearby-map') ? 'active' : ''}`}>
            🗺️ Nearby Map
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/report-lost" className="nav-action-btn lost-btn">
                + Report Lost
              </Link>
              <Link to="/report-found" className="nav-action-btn found-btn">
                + Report Found
              </Link>
            </>
          )}
        </div>

        {/* User Actions / Notification / Profile */}
        <div className="nav-user-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <NotificationBell />

              <div className="user-menu-pill">
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1e293b' }}>
                  <div className="user-avatar-badge">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="desktop-only" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                  </span>
                </Link>
              </div>

              {isAdmin && (
                <Link to="/admin-dashboard" className="admin-badge-pill desktop-only">
                  Admin Panel
                </Link>
              )}

              <button onClick={handleLogout} className="btn-logout desktop-only" title="Logout">
                🚪 Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer mobile-only">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/lost-items" onClick={() => setMobileMenuOpen(false)}>Lost Items Listing</Link>
          <Link to="/found-items" onClick={() => setMobileMenuOpen(false)}>Found Items Listing</Link>
          <Link to="/matches" onClick={() => setMobileMenuOpen(false)}>AI Image Matches</Link>
          <Link to="/nearby-map" onClick={() => setMobileMenuOpen(false)}>Nearby Map Search</Link>

          {isAuthenticated ? (
            <>
              <div style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }} />
              <Link to="/report-lost" onClick={() => setMobileMenuOpen(false)} style={{ color: '#dc2626', fontWeight: 600 }}>+ Report Lost Item</Link>
              <Link to="/report-found" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0d9488', fontWeight: 600 }}>+ Report Found Item</Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              <Link to="/claims" onClick={() => setMobileMenuOpen(false)}>My Claims</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile Settings</Link>
              {isAdmin && (
                <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#7c3aed', fontWeight: 600 }}>
                  Admin Dashboard
                </Link>
              )}
              <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }} />
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
