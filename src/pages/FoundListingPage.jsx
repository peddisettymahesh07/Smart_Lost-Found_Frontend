import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { foundItemService } from '../services/api';
import { ItemCard } from '../components/ItemCard';

export const FoundListingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [colour, setColour] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');

  const categories = [
    'Electronics', 'Documents', 'Accessories', 'Bags', 'Jewellery',
    'Clothing', 'Books', 'Keys', 'Wallets & Purses', 'Other'
  ];

  const colours = [
    'Black', 'Blue', 'Red', 'White', 'Silver', 'Gold', 'Brown',
    'Green', 'Yellow', 'Grey', 'Orange', 'Purple', 'Pink', 'Multi-colour', 'Other'
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (colour) params.colour = colour;
      if (city) params.city = city;
      if (status) params.status = status;

      const res = await foundItemService.getAll(params);
      setItems(res.results || res);
    } catch (err) {
      console.error("Error fetching found items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, colour, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setColour('');
    setCity('');
    setStatus('');
    setTimeout(fetchItems, 50);
  };

  return (
    <div className="container" style={{ padding: '30px 16px' }}>
      <div className="section-flex-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Found Belongings Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Found items waiting to be claimed by their verified owners.
          </p>
        </div>
        <Link to="/report-found" className="btn btn-teal-action">
          + Report Found Item
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Keyword Search</label>
            <input
              type="text"
              placeholder="Title, description..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Category</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Colour</label>
            <select className="form-input" value={colour} onChange={(e) => setColour(e.target.value)}>
              <option value="">All Colours</option>
              {colours.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>City</label>
            <input
              type="text"
              placeholder="e.g. San Francisco"
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
              Filter
            </button>
            <button type="button" onClick={resetFilters} className="btn btn-outline" style={{ height: '42px' }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results Listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎁</div>
          <h3>No Found Items Found</h3>
          <p>No found items match your current search filters.</p>
          <button onClick={resetFilters} className="btn btn-outline" style={{ marginTop: '10px' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            Showing <strong>{items.length}</strong> reported found items:
          </div>
          <div className="cards-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} type="found" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
