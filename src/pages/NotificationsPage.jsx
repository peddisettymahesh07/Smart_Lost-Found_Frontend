import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="container" style={{ padding: '30px 16px', maxWidth: '800px' }}>
      <div className="section-flex-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🔔 Activity &amp; AI Match Notifications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Instant notifications for potential AI matches, claim submissions, and ownership verification status.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            ✓ Mark All As Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filter === 'all' ? '#1e3a8a' : '#e2e8f0',
            color: filter === 'all' ? '#ffffff' : '#334155',
          }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: filter === 'unread' ? '#1e3a8a' : '#e2e8f0',
            color: filter === 'unread' ? '#ffffff' : '#334155',
          }}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><div className="spinner" /></div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔔</div>
          <h3>No notifications in this view</h3>
          <p>You're all caught up! New AI similarity alerts and claim responses will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map((n) => {
            const isMatch = n.notification_type === 'match_found' || n.notification_type === 'new_match';
            const isClaim = n.notification_type?.includes('claim');

            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '16px',
                  backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                  borderLeft: n.is_read ? '4px solid #cbd5e1' : '4px solid #10b981',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {isMatch ? '✨' : isClaim ? '🛡️' : '📢'}
                    </span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {n.title}
                    </h3>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 10px 0', lineHeight: '1.5' }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>{new Date(n.created_at).toLocaleString()}</span>

                  {isMatch && (
                    <Link to="/matches" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      View Matching Results &rarr;
                    </Link>
                  )}
                  {isClaim && (
                    <Link to="/claims" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      View Claim Details &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
