import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lostItemService, foundItemService, matchService, claimService, dashboardService } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');
  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [stats, setStats] = useState({
    my_lost_count: 0,
    my_found_count: 0,
    my_matches_count: 0,
    my_claims_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes, matchRes, claimRes, statsRes] = await Promise.all([
          lostItemService.getAll({ my_items: true }),
          foundItemService.getAll({ my_items: true }),
          matchService.getAll(),
          claimService.getAll(),
          dashboardService.getUserStats().catch(() => null),
        ]);

        setMyLostItems(lostRes.results || lostRes);
        setMyFoundItems(foundRes.results || foundRes);
        setMyMatches(matchRes.results || matchRes);
        setMyClaims(claimRes.results || claimRes);

        if (statsRes) {
          setStats(statsRes);
        } else {
          setStats({
            my_lost_count: (lostRes.results || lostRes).length,
            my_found_count: (foundRes.results || foundRes).length,
            my_matches_count: (matchRes.results || matchRes).length,
            my_claims_count: (claimRes.results || claimRes).length,
          });
        }
      } catch (err) {
        console.error("Error loading user dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      {/* Welcome Banner */}
      <div className="dashboard-header-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Welcome back, {user?.full_name || 'Citizen'}!
            </h1>
            <span className="role-pill">
              {user?.role === 'finder' ? '🔍 Finder Account' : user?.role === 'admin' ? '👑 Admin' : '👤 General User'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
            Manage your reported items, review AI image match suggestions, and track claim verifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/report-lost" className="btn btn-danger-action" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            + Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-teal-action" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            + Report Found
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card" onClick={() => setActiveTab('lost')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '1.8rem' }}>📦</div>
          <div>
            <div className="dash-stat-value">{stats.my_lost_count}</div>
            <div className="dash-stat-title">My Lost Reports</div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => setActiveTab('found')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '1.8rem' }}>🎁</div>
          <div>
            <div className="dash-stat-value">{stats.my_found_count}</div>
            <div className="dash-stat-title">My Found Reports</div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => setActiveTab('matches')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '1.8rem' }}>✨</div>
          <div>
            <div className="dash-stat-value">{stats.my_matches_count}</div>
            <div className="dash-stat-title">AI Matches Found</div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => setActiveTab('claims')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '1.8rem' }}>🛡️</div>
          <div>
            <div className="dash-stat-value">{stats.my_claims_count}</div>
            <div className="dash-stat-title">Claims In Progress</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          My Lost Items ({myLostItems.length})
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          My Found Items ({myFoundItems.length})
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Possible AI Matches ({myMatches.length})
        </button>
        <button
          className={`dash-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Ownership Claims ({myClaims.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><div className="spinner" /></div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {/* TAB 1: LOST ITEMS */}
          {activeTab === 'lost' && (
            <div>
              {myLostItems.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
                  <h3>You haven't reported any lost items.</h3>
                  <p>If you've lost something, report it to allow our CLIP AI model to match it with found items.</p>
                  <Link to="/report-lost" className="btn btn-primary" style={{ marginTop: '12px' }}>
                    + Report Lost Item Now
                  </Link>
                </div>
              ) : (
                <div className="cards-grid">
                  {myLostItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="lost" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOUND ITEMS */}
          {activeTab === 'found' && (
            <div>
              {myFoundItems.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎁</div>
                  <h3>You haven't reported any found items.</h3>
                  <p>Found someone's property? Report it to help reconnect them with their belonging.</p>
                  <Link to="/report-found" className="btn btn-secondary" style={{ marginTop: '12px' }}>
                    + Report Found Item Now
                  </Link>
                </div>
              ) : (
                <div className="cards-grid">
                  {myFoundItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="found" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI MATCHES */}
          {activeTab === 'matches' && (
            <div>
              {myMatches.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✨</div>
                  <h3>No AI Matches Identified Yet</h3>
                  <p>When someone reports an item visually or geographically matching yours, it will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myMatches.map((m) => (
                    <div key={m.id} className="card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                            Match #{m.id}
                          </span>
                          <MatchScoreBadge score={m.combined_score} confidence={m.confidence_level} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Status: <strong style={{ color: '#2563eb' }}>{m.status.replace('_', ' ').toUpperCase()}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>🔴 LOST ITEM</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.lost_item?.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>📍 {m.lost_item?.city} &bull; {m.lost_item?.category}</div>
                        </div>

                        <div style={{ backgroundColor: '#f0fdfa', padding: '12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', marginBottom: '4px' }}>🟢 FOUND ITEM</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.found_item?.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>📍 {m.found_item?.city} &bull; {m.found_item?.category}</div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#475569', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '0 0 14px 0', border: '1px solid #e2e8f0' }}>
                        💡 {m.explanation}
                      </p>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Link to={`/items/lost/${m.lost_item?.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                          View Lost Item
                        </Link>
                        <Link to={`/items/found/${m.found_item?.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                          View Found Item
                        </Link>
                        <Link to={`/claim-item/${m.found_item?.id}?lostId=${m.lost_item?.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                          Submit Ownership Claim &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLAIMS */}
          {activeTab === 'claims' && (
            <div>
              {myClaims.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️</div>
                  <h3>No Ownership Claims Filed</h3>
                  <p>When you spot your missing belonging in the Found Items catalog, submit an ownership claim to begin verification.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myClaims.map((claim) => (
                    <div key={claim.id} className="card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                          Claim #{claim.id} &bull; Found Item: {claim.found_item_title}
                        </h4>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: claim.status === 'approved' ? '#ecfdf5' : claim.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                            color: claim.status === 'approved' ? '#059669' : claim.status === 'rejected' ? '#dc2626' : '#d97706',
                          }}
                        >
                          {claim.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 10px 0' }}>
                        Submitted on: {new Date(claim.created_at).toLocaleDateString()} &bull; Finder: {claim.finder_name || claim.finder_email}
                      </p>
                      <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', color: '#334155' }}>
                        <strong>Proof Provided:</strong> {claim.proof_description}
                      </div>
                      {claim.finder_response && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0fdfa', borderRadius: '6px', fontSize: '0.8rem', color: '#0d9488' }}>
                          💬 <strong>Finder Response:</strong> {claim.finder_response}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
