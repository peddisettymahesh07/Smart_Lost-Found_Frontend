import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export const ProfilePage = () => {
  const { user, refreshProfile, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      await authService.updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px', maxWidth: '650px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          👤 User Profile &amp; Preferences
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Manage your personal account credentials, role privileges, and contact settings.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
            }}
          >
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {user?.full_name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              {user?.email}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: user?.role === 'admin' ? '#f5f3ff' : user?.role === 'finder' ? '#f0fdfa' : '#eff6ff',
                color: user?.role === 'admin' ? '#7c3aed' : user?.role === 'finder' ? '#0d9488' : '#2563eb',
              }}
            >
              Role: {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-Only)</label>
            <input
              type="email"
              disabled
              className="form-input"
              value={user?.email || ''}
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+1-555-0199"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={updating}
          >
            {updating ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Account Created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </span>
          <button
            type="button"
            onClick={logout}
            className="btn btn-outline"
            style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.82rem' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
