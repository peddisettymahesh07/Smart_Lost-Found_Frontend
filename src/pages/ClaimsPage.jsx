import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { claimService, foundItemService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ClaimsPage = () => {
  const { foundId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const prefillLostId = searchParams.get('lostId');

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);

  // Claim Form State
  const [formData, setFormData] = useState({
    found_item: foundId || '',
    lost_item: prefillLostId || '',
    proof_description: '',
    secret_identifiers: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Finder / Admin response modal/state
  const [respondingClaimId, setRespondingClaimId] = useState(null);
  const [responseStatus, setResponseStatus] = useState('approved');
  const [responseText, setResponseText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await claimService.getAll();
      setClaims(res.results || res);

      if (foundId) {
        try {
          const item = await foundItemService.getById(foundId);
          setSelectedFoundItem(item);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [foundId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!formData.found_item || !formData.proof_description) {
      setFormError('Found Item ID and private proof description are required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('found_item', formData.found_item);
      if (formData.lost_item) data.append('lost_item', formData.lost_item);
      data.append('proof_description', formData.proof_description);
      if (formData.secret_identifiers) data.append('secret_identifiers', formData.secret_identifiers);
      if (proofFile) data.append('proof_document', proofFile);

      await claimService.create(data);
      setFormSuccess('Ownership claim submitted successfully! The finder and administrators have been alerted.');
      setFormData({ found_item: '', lost_item: '', proof_description: '', secret_identifiers: '' });
      setProofFile(null);
      await fetchClaims();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClaimStatus = async (claimId) => {
    try {
      await claimService.updateStatus(claimId, {
        status: responseStatus,
        finder_response: responseText,
        admin_notes: adminNotes,
      });
      alert(`Claim #${claimId} status updated to ${responseStatus}.`);
      setRespondingClaimId(null);
      setResponseText('');
      setAdminNotes('');
      await fetchClaims();
    } catch (err) {
      alert("Failed to update claim status: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px', maxWidth: '900px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          🛡️ Secure Ownership Verification &amp; Claims
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
          Strict privacy controls: Confidential serial numbers, wallpaper passwords, and verification answers are restricted strictly to authorized finders and administrators.
        </p>
      </div>

      {/* Claim Submission Form (shown if foundId is in URL or user opens it) */}
      <div className="card" style={{ padding: '24px', marginBottom: '30px', borderLeft: '4px solid #0d9488' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          Submit New Ownership Claim
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
          Provide distinctive private details only the true owner would know.
        </p>

        {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmitClaim}>
          {selectedFoundItem && (
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>CLAIMING FOUND ITEM</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{selectedFoundItem.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {selectedFoundItem.location_area}, {selectedFoundItem.city}</div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Found Item ID *</label>
              <input
                type="number"
                name="found_item"
                required
                className="form-input"
                placeholder="e.g. 1"
                value={formData.found_item}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">My Matching Lost Item ID (Optional)</label>
              <input
                type="number"
                name="lost_item"
                className="form-input"
                placeholder="e.g. 2"
                value={formData.lost_item}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Private Identifying Marks &amp; Characteristics *</label>
            <textarea
              name="proof_description"
              required
              rows="3"
              className="form-input"
              placeholder="Describe unique scratches, stickers, desktop wallpaper, cards inside wallet, lock combination..."
              value={formData.proof_description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confidential Serial Numbers / Secret Passcodes (Kept Private)</label>
            <input
              type="text"
              name="secret_identifiers"
              className="form-input"
              placeholder="e.g. Serial #87DFX92, Engraving inscription text, or purchase receipt number"
              value={formData.secret_identifiers}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ margin: '14px 0' }}>
            <label className="form-label">Proof Document / Purchase Receipt / Photo (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="form-input"
              onChange={handleProofFileChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            disabled={submitting}
          >
            {submitting ? 'Submitting Claim...' : '🛡️ File Ownership Claim'}
          </button>
        </form>
      </div>

      {/* Claims Listing */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
        Tracked Ownership Claims ({claims.length})
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><div className="spinner" /></div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          No ownership claims recorded. When you find your item in the directory, submit a claim above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {claims.map((claim) => {
            const isClaimant = user?.id === claim.claimant || user?.email === claim.claimant_email;
            const isFinder = user?.email === claim.finder_email;
            const canReview = isFinder || isAdmin;

            return (
              <div key={claim.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      Claim #{claim.id} &bull; {claim.found_item_title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '10px' }}>
                      Claimant: <strong>{claim.claimant_name || claim.claimant_email}</strong>
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: claim.status === 'approved' ? '#ecfdf5' : claim.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                      color: claim.status === 'approved' ? '#059669' : claim.status === 'rejected' ? '#dc2626' : '#d97706',
                      border: '1px solid currentColor'
                    }}
                  >
                    {claim.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Proof Information Box */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Private Proof Description:</strong> {claim.proof_description}
                  </div>
                  {claim.secret_identifiers && (
                    <div style={{ marginBottom: '6px', color: '#0369a1' }}>
                      <strong>🔒 Confidential Identifiers:</strong> {claim.secret_identifiers}
                    </div>
                  )}
                  {claim.finder_response && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0fdfa', borderRadius: '6px', color: '#0d9488' }}>
                      <strong>Finder Response:</strong> {claim.finder_response}
                    </div>
                  )}
                  {claim.admin_notes && (
                    <div style={{ marginTop: '6px', padding: '6px', backgroundColor: '#f5f3ff', borderRadius: '6px', color: '#7c3aed' }}>
                      <strong>Admin Audit Notes:</strong> {claim.admin_notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Submitted: {new Date(claim.created_at).toLocaleString()}
                  </span>

                  {canReview && (
                    <button
                      onClick={() => setRespondingClaimId(claim.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      ✏️ Review &amp; Update Status
                    </button>
                  )}
                </div>

                {/* Review Form Drawer */}
                {respondingClaimId === claim.id && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', backgroundColor: '#fafaf9', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#0f172a' }}>
                      Review Claim #{claim.id} Decision
                    </h4>

                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Decision Status *</label>
                        <select
                          className="form-input"
                          value={responseStatus}
                          onChange={(e) => setResponseStatus(e.target.value)}
                        >
                          <option value="under_review">Under Review (Need more info)</option>
                          <option value="approved">Approved (Ownership Verified)</option>
                          <option value="rejected">Rejected (Proof Insufficient / Fraudulent)</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Response Notes to Claimant *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="Provide pickup instructions or explain rejection reason..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="form-group">
                        <label className="form-label">Internal Administrator Notes</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Audit logs, case resolution notes..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setRespondingClaimId(null)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateClaimStatus(claim.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Confirm Decision
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
