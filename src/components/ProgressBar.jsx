import React from 'react';

const ProgressBar = ({ current, max, label }) => {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <span>{label}</span>
        <span className="gold-text">{Math.round(pct)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
