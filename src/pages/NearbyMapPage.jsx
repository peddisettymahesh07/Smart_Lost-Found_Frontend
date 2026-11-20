import React, { useState, useEffect } from 'react';
import { locationService } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { Link } from 'react-router-dom';

export const NearbyMapPage = () => {
  const [centerCoords, setCenterCoords] = useState([37.7749, -122.4194]); // SF default
  const [radiusKm, setRadiusKm] = useState(25);
  const [itemType, setItemType] = useState('all');
  const [city, setCity] = useState('');
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNearby = async (lat, lon, r, type, c) => {
    try {
      setLoading(true);
      const res = await locationService.getNearby({
        lat: lat,
        lon: lon,
        radius_km: r,
        item_type: type,
        city: c || undefined,
      });
      setMarkers(res.results || []);
    } catch (err) {
      console.error("Failed to load nearby items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby(centerCoords[0], centerCoords[1], radiusKm, itemType, city);
  }, [centerCoords, radiusKm, itemType]);

  const handleMapClick = (coords) => {
    setCenterCoords([coords.lat, coords.lon]);
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchNearby(centerCoords[0], centerCoords[1], radiusKm, itemType, city);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenterCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          alert('Could not access current location.');
        }
      );
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      <div className="section-flex-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🗺️ Location-Based Discovery &amp; Haversine Distance Search
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Find nearby lost and found items using geographic coordinates and OpenStreetMap. Click anywhere on the map to move your search radius.
          </p>
        </div>
        <button onClick={handleUseCurrentLocation} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
          🎯 Use My Current Location
        </button>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Display Items</label>
            <select
              className="form-input"
              style={{ width: '160px' }}
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            >
              <option value="all">All (Lost &amp; Found)</option>
              <option value="lost">Lost Belongings Only</option>
              <option value="found">Found Items Only</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Search Radius</label>
            <select
              className="form-input"
              style={{ width: '140px' }}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
            >
              <option value="5">5 km Radius</option>
              <option value="10">10 km Radius</option>
              <option value="25">25 km Radius</option>
              <option value="50">50 km Radius</option>
              <option value="100">100 km Radius</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by City</label>
            <input
              type="text"
              placeholder="e.g. San Francisco"
              className="form-input"
              style={{ width: '180px' }}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary" style={{ height: '42px' }}>
            Apply Filter
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '14px', fontSize: '0.82rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              Lost Reports
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0d9488', display: 'inline-block' }} />
              Found Items
            </span>
          </div>
        </form>
      </div>

      {/* Interactive Leaflet Map */}
      <LeafletMap
        center={centerCoords}
        zoom={12}
        markers={markers}
        radiusKm={radiusKm}
        onMapClick={handleMapClick}
        height="500px"
      />

      {/* Items list in radius */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Items Within {radiusKm} km of Selected Center ({markers.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}><div className="spinner" /></div>
        ) : markers.length === 0 ? (
          <div className="empty-state">
            No items recorded within {radiusKm} km of these coordinates. Try zooming out or increasing search radius.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {markers.map((loc) => {
              const isLost = loc.item_type === 'lost';
              return (
                <div key={loc.id} className="card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '8px',
                      backgroundColor: isLost ? '#fef2f2' : '#f0fdfa',
                      color: isLost ? '#ef4444' : '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      flexShrink: 0,
                    }}
                  >
                    {isLost ? '🔴' : '🟢'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {loc.item_title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      📍 {loc.area}, {loc.city}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                      Distance: ~{loc.distance_km} km away
                    </div>
                  </div>

                  <Link
                    to={`/items/${loc.item_type}/${loc.item_id}`}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '5px 10px', flexShrink: 0 }}
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
