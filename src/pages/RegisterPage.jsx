import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'user',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        if (typeof respData === 'string') {
          setError(respData);
        } else if (respData.email) {
          setError(`Email: ${respData.email[0]}`);
        } else if (respData.password) {
          setError(`Password: ${respData.password[0]}`);
        } else if (respData.detail) {
          setError(respData.detail);
        } else {
          setError(Object.values(respData).flat().join(' '));
        }
      } else {
        setError('Registration failed. Please check connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Create an Account</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Join the Smart Lost &amp; Found Platform community
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              required
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone_number"
              className="form-input"
              placeholder="+1-555-0199"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">General User (Report lost items &amp; claim belongings)</option>
              <option value="finder">Item Finder (Submit found belongings &amp; review claims)</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="Min 8 characters &amp; 1 digit"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                required
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
