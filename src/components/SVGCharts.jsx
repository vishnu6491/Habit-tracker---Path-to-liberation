import React from 'react';

export const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <svg width="100%" height="150" viewBox="0 0 300 150">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        const x = i * (300 / data.length) + 10;
        return (
          <rect key={i} x={x} y={150 - h} width="20" height={h} fill="#FFD700" rx="4" />
        );
      })}
    </svg>
  );
};

export const LineChart = ({ data }) => {
  if (data.length < 2) return <div className="card">Not enough data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 280 + 10;
    const y = 140 - (d.value / max) * 120;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="150" viewBox="0 0 300 150">
      <polyline points={points} fill="none" stroke="#FFD700" strokeWidth="3" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 280 + 10;
        const y = 140 - (d.value / max) * 120;
        return <circle key={i} cx={x} cy={y} r="4" fill="#fff" />;
      })}
    </svg>
  );
};
