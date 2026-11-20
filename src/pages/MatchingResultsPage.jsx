import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

export const MatchingResultsPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [minScore, setMinScore] = useState(30);
  const [runningGlobalMatch, setRunningGlobalMatch] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {};
      if (confidenceFilter) params.confidence = confidenceFilter;
      if (minScore) params.min_score = minScore;

      const res = await matchService.getAll(params);
      setMatches(res.results || res);
    } catch (err) {
      console.error("Error fetching AI matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [confidenceFilter, minScore]);

  const handleGlobalReMatch = async () => {
    try {
      setRunningGlobalMatch(true);
      await matchService.generate();
      await fetchMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningGlobalMatch(false);
    }
  };

  const handleStatusUpdate = async (matchId, newStatus) => {
    try {
      await matchService.respond(matchId, newStatus);
      setMatches(matches.map(m => m.id === matchId ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert("Failed to update match status.");
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      <div className="section-flex-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            ✨ AI Image &amp; Location Matching Engine
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Pairings computed using pretrained CLIP image embeddings, category, colour, description, and location proximity.
          </p>
        </div>
        <button
          onClick={handleGlobalReMatch}
          className="btn btn-primary"
          disabled={runningGlobalMatch}
        >
          {runningGlobalMatch ? '✨ Re-calculating Embeddings...' : '↻ Run Global AI Matching'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Confidence Level</label>
            <select
              className="form-input"
              style={{ width: '180px' }}
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
            >
              <option value="">All Confidences</option>
              <option value="High">High Match (>= 75%)</option>
              <option value="Medium">Medium Match (50% - 74%)</option>
              <option value="Low">Low Match (&lt; 50%)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              Minimum Similarity Score: <strong>{minScore}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              style={{ width: '180px', accentColor: '#2563eb' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748b', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669' }} /> High Match (&ge; 75%)
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706', marginLeft: '8px' }} /> Medium (50-74%)
          </div>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨</div>
          <h3>No Matching Items Found</h3>
          <p>No pairs currently satisfy the minimum {minScore}% similarity filter. Try lowering the threshold or run global matching.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {matches.map((m) => {
            const lostImg = m.lost_item?.images?.[0]?.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300&auto=format&fit=crop&q=60';
            const foundImg = m.found_item?.images?.[0]?.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=60';

            return (
              <div key={m.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                      AI Match #{m.id}
                    </span>
                    <MatchScoreBadge score={m.combined_score} confidence={m.confidence_level} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Side-by-side Visual Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Lost Item Column */}
                  <div style={{ border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px', backgroundColor: '#fef2f2' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '85px', height: '85px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0 }}>
                        <img src={lostImg} alt={m.lost_item?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
                          🔴 REPORTED LOST
                        </div>
                        <h4 style={{ margin: '3px 0', fontSize: '0.98rem', color: '#0f172a' }}>{m.lost_item?.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📍 {m.lost_item?.location_area}, {m.lost_item?.city}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          Date: {m.lost_item?.date_lost} &bull; Colour: {m.lost_item?.colour}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Found Item Column */}
                  <div style={{ border: '1px solid #ccfbf1', borderRadius: '10px', padding: '14px', backgroundColor: '#f0fdfa' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '85px', height: '85px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0 }}>
                        <img src={foundImg} alt={m.found_item?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                          🟢 REPORTED FOUND
                        </div>
                        <h4 style={{ margin: '3px 0', fontSize: '0.98rem', color: '#0f172a' }}>{m.found_item?.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📍 {m.found_item?.location_area}, {m.found_item?.city}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          Date: {m.found_item?.date_found} &bull; Colour: {m.found_item?.colour}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Breakdown Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Image Sim (50%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.image_similarity}%</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Category (15%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.category_similarity}%</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Colour (10%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.colour_similarity}%</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Text / NLP (10%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.description_similarity}%</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Location (10%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.location_similarity}%</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748b' }}>Date (5%)</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.date_similarity}%</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <strong>🤖 Explanation:</strong> {m.explanation}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStatusUpdate(m.id, 'confirmed_match')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '5px 12px', color: '#059669', borderColor: '#059669' }}
                    >
                      ✓ Confirm Potential Match
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(m.id, 'rejected')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '5px 12px', color: '#dc2626', borderColor: '#dc2626' }}
                    >
                      ✕ Dismiss
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/items/lost/${m.lost_item?.id}`} className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                      Inspect Lost Item
                    </Link>
                    <Link to={`/items/found/${m.found_item?.id}`} className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                      Inspect Found Item
                    </Link>
                    <Link
                      to={`/claim-item/${m.found_item?.id}?lostId=${m.lost_item?.id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      Submit Ownership Claim &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
