import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lostItemService, foundItemService, matchService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/LeafletMap';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

export const ItemDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const isLost = type === 'lost';
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingRunning, setMatchingRunning] = useState(false);
  const [error, setError] = useState('');

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const data = isLost
        ? await lostItemService.getById(id)
        : await foundItemService.getById(id);
      setItem(data);

      // Fetch existing matches
      const matchQuery = isLost ? { lost_item_id: id } : { found_item_id: id };
      const mRes = await matchService.getAll(matchQuery);
      setMatches(mRes.results || mRes);
    } catch (err) {
      console.error(err);
      setError('Item not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [type, id]);

  const handleRunAIMatching = async () => {
    try {
      setMatchingRunning(true);
      const payload = isLost ? { lost_item_id: id } : { found_item_id: id };
      await matchService.generate(payload);
      await fetchItemDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingRunning(false);
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      try {
        if (isLost) {
          await lostItemService.delete(id);
          navigate('/lost-items');
        } else {
          await foundItemService.delete(id);
          navigate('/found-items');
        }
      } catch (err) {
        alert("Failed to delete item.");
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner" /></div>;
  }

  if (error || !item) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>{error || 'Item not found.'}</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Return to Home</Link>
      </div>
    );
  }

  const isOwner = user && (user.id === item.user || user.email === item.user_email);
  const canManage = isOwner || isAdmin;

  const defaultImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=60'
    : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60';

  const imageUrl = item.images && item.images.length > 0 && item.images[0].image
    ? item.images[0].image
    : item.image || defaultImage;

  const marker = item.latitude && item.longitude ? [{
    latitude: item.latitude,
    longitude: item.longitude,
    item_type: type,
    item_title: item.title,
    area: item.location_area,
    city: item.city
  }] : [];

  return (
    <div className="container" style={{ padding: '30px 16px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to={isLost ? '/lost-items' : '/found-items'} style={{ color: '#2563eb', fontSize: '0.88rem', textDecoration: 'none' }}>
          &larr; Back to {isLost ? 'Lost Items' : 'Found Items'} Listing
        </Link>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Photograph */}
          <div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', height: '320px', backgroundColor: '#f1f5f9' }}>
              <img
                src={imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: isLost ? '#fef2f2' : '#f0fdfa',
                  color: isLost ? '#dc2626' : '#0d9488',
                  border: `1px solid ${isLost ? '#fecaca' : '#99f6e4'}`
                }}
              >
                {isLost ? '🔴 LOST REPORT' : '🟢 FOUND REPORT'}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 600 }}>
                {item.category}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569' }}>
                Colour: <strong>{item.colour}</strong>
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              {item.title}
            </h1>

            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '18px' }}>
              {item.description}
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.88rem' }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>📅 Date {isLost ? 'Lost' : 'Found'}:</strong> {item.date_lost || item.date_found}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>📍 Location:</strong> {item.location_area}, {item.city}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>👤 Reporter:</strong> {item.user_name || item.user_email}
              </div>
              {item.contact_preference && (
                <div>
                  <strong>📞 Contact Preference:</strong> {item.contact_preference.toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!isLost && (
                <Link to={`/claim-item/${item.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '10px' }}>
                  🛡️ Claim This Item
                </Link>
              )}
              <button
                onClick={handleRunAIMatching}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
                disabled={matchingRunning}
              >
                {matchingRunning ? '✨ Computing CLIP Embeddings...' : '✨ Run AI Matching'}
              </button>
              {canManage && (
                <button
                  onClick={handleDeleteItem}
                  className="btn btn-outline"
                  style={{ color: '#ef4444', borderColor: '#ef4444', padding: '10px 14px' }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map Location Section */}
        {item.latitude && item.longitude && (
          <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              📍 Location on Map (Latitude: {item.latitude}, Longitude: {item.longitude})
            </h3>
            <LeafletMap
              center={[parseFloat(item.latitude), parseFloat(item.longitude)]}
              zoom={14}
              markers={marker}
              height="260px"
            />
          </div>
        )}
      </div>

      {/* AI Matching Results for this item */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              ✨ AI Matching Results ({matches.length})
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Matches computed using CLIP visual embeddings, category, colour, description, and Haversine distance
            </p>
          </div>
          <button
            onClick={handleRunAIMatching}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            disabled={matchingRunning}
          >
            {matchingRunning ? 'Analyzing...' : '↻ Re-Calculate Similarity'}
          </button>
        </div>

        {matches.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            No high-confidence matches found yet. Click "Run AI Matching" to compare against newly added items.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {matches.map((m) => {
              const matchedCounterpart = isLost ? m.found_item : m.lost_item;
              return (
                <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        Match with: {matchedCounterpart?.title}
                      </span>
                      <MatchScoreBadge score={m.combined_score} confidence={m.confidence_level} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Distance: <strong>{m.distance_km !== null ? `~${m.distance_km} km` : 'Same City'}</strong>
                    </span>
                  </div>

                  {/* Similarity breakdown bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <div style={{ color: '#64748b' }}>Image Cosine (50%)</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.image_similarity}%</div>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <div style={{ color: '#64748b' }}>Category (15%)</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.category_similarity}%</div>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <div style={{ color: '#64748b' }}>Colour (10%)</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.colour_similarity}%</div>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <div style={{ color: '#64748b' }}>Text / NLP (10%)</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.description_similarity}%</div>
                    </div>
                    <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <div style={{ color: '#64748b' }}>Location (10%)</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.location_similarity}%</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 12px 0' }}>
                    {m.explanation}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link
                      to={`/items/${isLost ? 'found' : 'lost'}/${matchedCounterpart?.id}`}
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                    >
                      View Matched Item &rarr;
                    </Link>
                    {isLost && (
                      <Link
                        to={`/claim-item/${matchedCounterpart?.id}?lostId=${item.id}`}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      >
                        File Ownership Claim
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
