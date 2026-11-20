import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] ||
                  err.response?.data?.detail ||
                  'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👋</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Sign in to access your reports, matches, and notifications
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box for evaluation */}
        <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Demo Credentials (Click to fill)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@smartlostfound.com', 'Admin@12345')}
              style={{ textAlign: 'left', background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              👑 <strong>Administrator:</strong> admin@smartlostfound.com / Admin@12345
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john.doe@example.com', 'User@12345')}
              style={{ textAlign: 'left', background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              👤 <strong>General User:</strong> john.doe@example.com / User@12345
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah.finder@example.com', 'Finder@12345')}
              style={{ textAlign: 'left', background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              🔍 <strong>Item Finder:</strong> sarah.finder@example.com / Finder@12345
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>Don't have an account yet? </span>
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
