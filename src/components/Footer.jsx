import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>🔍</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                Smart<span style={{ color: '#2dd4bf' }}>Lost</span>&amp;Found
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '320px' }}>
              AI-powered lost and found platform combining CLIP image embeddings, multi-factor similarity matching, and Leaflet OpenStreetMap location discovery.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '14px', fontWeight: 600 }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/lost-items" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Lost Items</Link></li>
              <li><Link to="/found-items" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Found Items</Link></li>
              <li><Link to="/matches" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>AI Matches</Link></li>
              <li><Link to="/nearby-map" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Nearby Map Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '14px', fontWeight: 600 }}>Actions &amp; Roles</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link to="/report-lost" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Report Lost Belonging</Link></li>
              <li><Link to="/report-found" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Report Found Belonging</Link></li>
              <li><Link to="/claims" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Ownership Verification</Link></li>
              <li><Link to="/admin-dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Administrator Console</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '14px', fontWeight: 600 }}>Core Technologies</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['OpenAI CLIP', 'Pillow / NumPy', 'Django REST', 'React.js', 'SimpleJWT', 'MySQL 8.0', 'Leaflet Maps', 'Haversine'].map(t => (
                <span key={t} style={{ backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
                  {t}
                </span>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '14px' }}>
              Designed for secure, verified community lost and found operations.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', marginTop: '30px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} Smart Lost &amp; Found Platform. All rights reserved.
          </span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            Python Django &bull; React.js &bull; AI Image Matching &bull; Location Intelligence
          </span>
        </div>
      </div>
    </footer>
  );
};
