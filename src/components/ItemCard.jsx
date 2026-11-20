import React from 'react';
import { Link } from 'react-router-dom';

export const ItemCard = ({ item, type = 'lost' }) => {
  const isLost = type === 'lost';
  const badgeBg = isLost ? '#fef2f2' : '#f0fdfa';
  const badgeBorder = isLost ? '#fecaca' : '#99f6e4';
  const badgeText = isLost ? '#dc2626' : '#0d9488';
  const itemTypeLabel = isLost ? 'LOST' : 'FOUND';

  const defaultImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60'
    : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60';

  const imageUrl = item.images && item.images.length > 0 && item.images[0].image
    ? item.images[0].image
    : item.image || defaultImage;

  const dateValue = isLost ? item.date_lost : item.date_found;

  return (
    <div className="card item-card">
      <div style={{ position: 'relative', height: '190px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img
          src={imageUrl}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultImage; }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
          <span
            style={{
              backgroundColor: badgeBg,
              color: badgeText,
              border: `1px solid ${badgeBorder}`,
              fontWeight: 700,
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}
          >
            {itemTypeLabel}
          </span>
          <span
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '6px'
            }}
          >
            {item.category}
          </span>
        </div>
        {item.status && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span
              style={{
                backgroundColor: item.status === 'open' || item.status === 'available' ? '#10b981' : '#f59e0b',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}
            >
              {item.status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', lineHeight: '1.3' }}>
          {item.title}
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.4em'
          }}
        >
          {item.description}
        </p>

        <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '16px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span>📍</span>
            <span style={{ fontWeight: 500 }}>{item.location_area}, {item.city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅</span>
            <span>{dateValue || 'Recent'}</span>
            <span style={{ margin: '0 4px' }}>•</span>
            <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: item.colour?.toLowerCase() || '#94a3b8', border: '1px solid #cbd5e1' }} />
            <span>{item.colour}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/items/${type}/${item.id}`}
            className="btn btn-outline"
            style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', padding: '7px 10px' }}
          >
            View Details
          </Link>
          {!isLost && (
            <Link
              to={`/claim-item/${item.id}`}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '7px 12px' }}
            >
              Claim
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
