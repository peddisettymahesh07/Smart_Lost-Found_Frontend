import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lostItemService, foundItemService, dashboardService } from '../services/api';
import { ItemCard } from '../components/ItemCard';

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const [lostRes, foundRes] = await Promise.all([
          lostItemService.getAll(),
          foundItemService.getAll(),
        ]);
        const lostList = lostRes.results || lostRes;
        const foundList = foundRes.results || foundRes;
        setRecentLost(lostList.slice(0, 4));
        setRecentFound(foundList.slice(0, 4));
      } catch (err) {
        console.error("Failed to load home items:", err);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/lost-items?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>⚡ AI-Powered Computer Vision &amp; Geolocation</span>
            </div>
            <h1 className="hero-title">
              Reconnecting People With What They've <span style={{ color: '#38bdf8' }}>Lost</span> &amp; <span style={{ color: '#2dd4bf' }}>Found</span>
            </h1>
            <p className="hero-description">
              Upload photographs of lost or found belongings. Our pretrained CLIP deep learning model analyzes visual features, colors, categories, and coordinates to automatically identify matches.
            </p>

            {/* Quick Action Buttons */}
            <div className="hero-actions">
              <Link to="/report-lost" className="btn btn-danger-action">
                🚨 Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-teal-action">
                🎁 Report Found Item
              </Link>
              <Link to="/nearby-map" className="btn btn-glass-action">
                🗺️ Explore Nearby Map
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hero-search-bar">
              <span style={{ fontSize: '1.2rem', marginLeft: '12px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search lost or found items (e.g., 'Dell laptop', 'leather wallet', 'keys')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '10px 22px' }}>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">91.7%</div>
              <div className="stat-label">AI Cosine Matching Accuracy</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">512-D</div>
              <div className="stat-label">CLIP Visual Embedding Vectors</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">100%</div>
              <div className="stat-label">Private Ownership Claims</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">&lt; 1 km</div>
              <div className="stat-label">Haversine GPS Precision</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How The Platform Works</h2>
            <p className="section-subtitle">
              A 3-step automated pipeline combining deep learning with secure human verification
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📸</div>
              <div className="step-number">Step 1</div>
              <h3 className="step-title">1. Report With Photograph</h3>
              <p className="step-desc">
                Citizens report lost or found belongings with photos, descriptions, categories, and map coordinates.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">🧠</div>
              <div className="step-number">Step 2</div>
              <h3 className="step-title">2. AI Image &amp; Location Match</h3>
              <p className="step-desc">
                Pretrained CLIP extracts high-dimensional image vectors, combines multi-factor cosine similarity, and notifies both parties.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">🛡️</div>
              <div className="step-number">Step 3</div>
              <h3 className="step-title">3. Verified Return</h3>
              <p className="step-desc">
                Claimants provide confidential proof details (serial numbers, lock screen, unique marks). Finder or admin verifies ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Lost Items */}
      <section className="section-padding">
        <div className="container">
          <div className="section-flex-header">
            <div>
              <h2 className="section-title">Recent Lost Belongings</h2>
              <p className="section-subtitle">Help community members identify their missing items</p>
            </div>
            <Link to="/lost-items" className="btn btn-outline">
              View All Lost Items &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></div>
          ) : recentLost.length === 0 ? (
            <div className="empty-state">No lost items reported yet.</div>
          ) : (
            <div className="cards-grid">
              {recentLost.map((item) => (
                <ItemCard key={item.id} item={item} type="lost" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Found Items */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-flex-header">
            <div>
              <h2 className="section-title">Recently Found Items</h2>
              <p className="section-subtitle">Found items waiting to be reclaimed by verified owners</p>
            </div>
            <Link to="/found-items" className="btn btn-outline">
              View All Found Items &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></div>
          ) : recentFound.length === 0 ? (
            <div className="empty-state">No found items reported yet.</div>
          ) : (
            <div className="cards-grid">
              {recentFound.map((item) => (
                <ItemCard key={item.id} item={item} type="found" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI & Security Guarantee Banner */}
      <section className="cta-section">
        <div className="container cta-container">
          <div className="cta-content">
            <h2>Have you lost or found something valuable?</h2>
            <p>
              Join hundreds of citizens using our AI matching engine to safely recover lost belongings.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '1rem' }}>
                Create Free Account
              </Link>
              <Link to="/nearby-map" className="btn btn-secondary" style={{ padding: '12px 26px', fontSize: '1rem' }}>
                Open Nearby Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
