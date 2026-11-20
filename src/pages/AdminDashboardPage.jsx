import React, { useState, useEffect } from 'react';
import { dashboardService, authService, claimService } from '../services/api';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, userRes, claimRes] = await Promise.all([
        dashboardService.getAdminStats(),
        authService.getAdminUsers().catch(() => ({ results: [] })),
        claimService.getAll().catch(() => ({ results: [] })),
      ]);
      setStats(dashRes);
      setUsers(userRes.results || userRes || []);
      setClaims(claimRes.results || claimRes || []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>;
  }

  const summary = stats?.summary || {};
  const categories = stats?.category_breakdown || [];
  const confidence = stats?.confidence_distribution || { High: 0, Medium: 0, Low: 0 };
  const cities = stats?.city_distribution || [];
  const recentActions = stats?.recent_actions || [];

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            👑 Administrator Command Center
          </h1>
          <span style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #ddd6fe' }}>
            Root Admin
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
          Platform metrics, user governance, AI matching oversight, and disputed ownership verification.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="dash-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>👥</div>
          <div>
            <div className="dash-stat-value">{summary.total_users || 0}</div>
            <div className="dash-stat-title">Registered Users</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>📦</div>
          <div>
            <div className="dash-stat-value">{summary.total_lost_items || 0}</div>
            <div className="dash-stat-title">Lost Reports</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>🎁</div>
          <div>
            <div className="dash-stat-value">{summary.total_found_items || 0}</div>
            <div className="dash-stat-title">Found Reports</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>✨</div>
          <div>
            <div className="dash-stat-value">{summary.total_matches || 0}</div>
            <div className="dash-stat-title">AI Matches ({summary.high_confidence_matches || 0} High)</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>🛡️</div>
          <div>
            <div className="dash-stat-value" style={{ color: '#d97706' }}>{summary.pending_claims || 0}</div>
            <div className="dash-stat-title">Pending Claims</div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div>
            <div className="dash-stat-value" style={{ color: '#059669' }}>{summary.resolved_cases || 0}</div>
            <div className="dash-stat-title">Resolved Returns</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="dashboard-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Analytics &amp; Distributions
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Accounts ({users.length})
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Ownership Claims &amp; Disputes ({claims.length})
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Admin Audit Log ({recentActions.length})
        </button>
      </div>

      {/* TAB 1: ANALYTICS & DISTRIBUTIONS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Category Breakdown */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
              📊 Items by Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((c) => {
                const total = (summary.total_lost_items || 0) + (summary.total_found_items || 0);
                const pct = total > 0 ? ((c.count / total) * 100).toFixed(0) : 0;
                return (
                  <div key={c.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{c.category}</span>
                      <span style={{ color: '#64748b' }}>{c.count} items ({pct}%)</span>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#2563eb', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Match Confidence Distribution */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
              ✨ AI Match Confidence Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
                  <span>🟢 High Confidence (&ge; 75%)</span>
                  <span>{confidence.High || 0} Matches</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#065f46', marginTop: '3px' }}>
                  Strong image cosine similarity + identical category &amp; proximity
                </div>
              </div>

              <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#d97706', fontSize: '0.9rem' }}>
                  <span>🟡 Medium Confidence (50% - 74%)</span>
                  <span>{confidence.Medium || 0} Matches</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '3px' }}>
                  Moderate visual or geographic correlation
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                  <span>🔵 Low Confidence (&lt; 50%)</span>
                  <span>{confidence.Low || 0} Matches</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e40af', marginTop: '3px' }}>
                  Weak correlation or distant location
                </div>
              </div>
            </div>
          </div>

          {/* City Distribution */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
              📍 Regional Distribution (Top Cities)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cities.map((ct) => (
                <div key={ct.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{ct.city}</span>
                  <span style={{ color: '#0d9488', fontWeight: 700 }}>{ct.count} reports</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
            Registered Citizen Accounts
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>User ID</th>
                <th style={{ padding: '10px' }}>Full Name</th>
                <th style={{ padding: '10px' }}>Email Address</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#64748b' }}>#{u.id}</td>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>{u.full_name}</td>
                  <td style={{ padding: '10px', color: '#334155' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: u.role === 'admin' ? '#f5f3ff' : u.role === 'finder' ? '#f0fdfa' : '#eff6ff',
                        color: u.role === 'admin' ? '#7c3aed' : u.role === 'finder' ? '#0d9488' : '#2563eb',
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: u.is_active ? '#059669' : '#dc2626', fontWeight: 600 }}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CLAIMS & DISPUTES */}
      {activeTab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {claims.map((c) => (
            <div key={c.id} className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Claim #{c.id} on Found Item: {c.found_item_title}
                </span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: c.status === 'approved' ? '#ecfdf5' : c.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                    color: c.status === 'approved' ? '#059669' : c.status === 'rejected' ? '#dc2626' : '#d97706',
                  }}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>
                Claimant: <strong>{c.claimant_name} ({c.claimant_email})</strong> &bull; Finder: {c.finder_name || c.finder_email}
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '10px' }}>
                <div><strong>Proof:</strong> {c.proof_description}</div>
                {c.secret_identifiers && <div style={{ color: '#0369a1', marginTop: '4px' }}><strong>Secret Identifiers:</strong> {c.secret_identifiers}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Link to="/claims" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                  Manage in Claims Console &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
            Administrative Actions Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActions.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No administrative audit events recorded yet.</div>
            ) : (
              recentActions.map((act) => (
                <div key={act.id} style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #7c3aed', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: '#0f172a' }}>{act.action.replace('_', ' ').toUpperCase()}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(act.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ color: '#475569' }}>
                    Target: {act.target_type} #{act.target_id} &bull; Admin: {act.admin__email}
                  </div>
                  {act.details && <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '3px' }}>{act.details}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
