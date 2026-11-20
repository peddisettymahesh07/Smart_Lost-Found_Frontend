import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundItemService } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';

export const ReportFoundPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    colour: 'Black',
    date_found: new Date().toISOString().split('T')[0],
    location_area: '',
    city: 'San Francisco',
    latitude: '37.7749',
    longitude: '-122.4194',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics', 'Documents', 'Accessories', 'Bags', 'Jewellery',
    'Clothing', 'Books', 'Keys', 'Wallets & Purses', 'Other'
  ];

  const colours = [
    'Black', 'Blue', 'Red', 'White', 'Silver', 'Gold', 'Brown',
    'Green', 'Yellow', 'Grey', 'Orange', 'Purple', 'Pink', 'Multi-colour', 'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size cannot exceed 10MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleMapClick = (coords) => {
    setFormData({
      ...formData,
      latitude: coords.lat.toFixed(6),
      longitude: coords.lon.toFixed(6),
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          });
        },
        () => {
          setError('Unable to fetch your current GPS position. You can click on the map to set coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.city) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await foundItemService.create(data);
      navigate(`/items/found/${res.id}?success=created`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit found report.');
    } finally {
      setLoading(false);
    }
  };

  const marker = formData.latitude && formData.longitude ? [{
    latitude: formData.latitude,
    longitude: formData.longitude,
    item_type: 'found',
    item_title: formData.title || 'Selected Found Location',
    area: formData.location_area || 'Pinned Spot',
    city: formData.city
  }] : [];

  return (
    <div className="container" style={{ padding: '30px 16px', maxWidth: '850px' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d9488' }}>
          🎁 Report a Found Item
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Thank you for being a good citizen! Upload a photograph and location details so our AI matching engine can alert the rightful owner.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
          1. Found Belonging Details
        </h3>

        <div className="form-group">
          <label className="form-label">Item Title / Name *</label>
          <input
            type="text"
            name="title"
            required
            className="form-input"
            placeholder="e.g. Silver Dell Laptop in Black Sleeve"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category *</label>
            <select name="category" className="form-input" value={formData.category} onChange={handleInputChange}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Primary Colour *</label>
            <select name="colour" className="form-input" value={formData.colour} onChange={handleInputChange}>
              {colours.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Date Found *</label>
            <input
              type="date"
              name="date_found"
              required
              className="form-input"
              value={formData.date_found}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description &amp; Condition *</label>
          <textarea
            name="description"
            rows="3"
            required
            className="form-input"
            placeholder="Describe what was found. NOTE: Avoid disclosing private serial numbers or specific lock wallpapers to prevent fraudulent claims."
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        {/* Image Upload */}
        <div className="form-group" style={{ margin: '20px 0' }}>
          <label className="form-label">Photograph of Found Item *</label>
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('foundImageInput').click()}
          >
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Item Preview"
                  style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', marginBottom: '10px' }}
                />
                <div style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: 600 }}>
                  ✓ Photograph selected (Click to change)
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>📸</div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>
                  Click to upload photograph of found item
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Processed with CLIP Vision Transformer embeddings
                </div>
              </div>
            )}
            <input
              id="foundImageInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px 0', color: '#0f172a' }}>
          2. Discovery Location
        </h3>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">City *</label>
            <input
              type="text"
              name="city"
              required
              className="form-input"
              placeholder="e.g. San Francisco"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Found Area / Landmark *</label>
            <input
              type="text"
              name="location_area"
              required
              className="form-input"
              placeholder="e.g. Campus Library 2nd Floor Window Table"
              value={formData.location_area}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
            Click on the map to mark the discovery spot:
          </span>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            🎯 Use My GPS Location
          </button>
        </div>

        <LeafletMap
          center={[parseFloat(formData.latitude) || 37.7749, parseFloat(formData.longitude) || -122.4194]}
          zoom={13}
          markers={marker}
          onMapClick={handleMapClick}
          height="280px"
        />

        <div className="form-row" style={{ marginTop: '12px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              className="form-input"
              value={formData.latitude}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              className="form-input"
              value={formData.longitude}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-teal-action"
          style={{ width: '100%', padding: '14px', marginTop: '20px', fontSize: '1rem', fontWeight: 700 }}
          disabled={loading}
        >
          {loading ? 'Generating AI Embeddings & Matching...' : 'Submit Found Item Report'}
        </button>
      </form>
    </div>
  );
};
