import React from 'react';

export const MatchScoreBadge = ({ score, confidence }) => {
  const numScore = parseFloat(score || 0);

  let badgeColor = '#64748b'; // default slate
  let bgLight = '#f1f5f9';
  let label = confidence || (numScore >= 75 ? 'High' : numScore >= 50 ? 'Medium' : 'Low');

  if (label === 'High' || numScore >= 75) {
    badgeColor = '#059669'; // Emerald
    bgLight = '#ecfdf5';
  } else if (label === 'Medium' || numScore >= 50) {
    badgeColor = '#d97706'; // Amber
    bgLight = '#fffbeb';
  } else {
    badgeColor = '#2563eb'; // Blue
    bgLight = '#eff6ff';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: bgLight,
        border: `1px solid ${badgeColor}40`,
        color: badgeColor,
        fontWeight: '600',
        fontSize: '0.82rem',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: badgeColor,
          display: 'inline-block',
        }}
      />
      <span>{numScore.toFixed(1)}% Match</span>
      <span style={{ opacity: 0.85, fontSize: '0.75rem' }}>({label})</span>
    </div>
  );
};
