import React from 'react';

const ChakraWheel = ({ completionPct }) => {
  const chakras = [
    { name: 'Root', color: '#FF0000', threshold: 15, cx: 50, cy: 15 },
    { name: 'Sacral', color: '#FF7F00', threshold: 30, cx: 75, cy: 30 },
    { name: 'Solar', color: '#FFD700', threshold: 45, cx: 75, cy: 60 },
    { name: 'Heart', color: '#00FF00', threshold: 60, cx: 50, cy: 75 },
    { name: 'Throat', color: '#00BFFF', threshold: 75, cx: 25, cy: 60 },
    { name: 'Third Eye', color: '#4B0082', threshold: 90, cx: 25, cy: 30 },
    { name: 'Crown', color: '#9400D3', threshold: 100, cx: 50, cy: 50 }
  ];

  return (
    <div style={{ textAlign: 'center', margin: '16px 0' }}>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Chakra Activation</p>
      <svg viewBox="0 0 100 100" style={{ width: '150px', height: '150px', margin: '0 auto' }}>
        {/* Connecting lines */}
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Chakra points */}
        {chakras.map((chakra, i) => {
          const isActive = completionPct >= chakra.threshold;
          return (
            <g key={chakra.name}>
              <circle
                cx={chakra.cx}
                cy={chakra.cy}
                r={isActive ? 8 : 5}
                fill={isActive ? chakra.color : 'rgba(255,255,255,0.1)'}
                stroke={isActive ? '#fff' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2"
                className={isActive ? 'pulse' : ''}
                style={{ transition: 'all 0.3s ease' }}
              />
              {isActive && (
                <circle
                  cx={chakra.cx}
                  cy={chakra.cy}
                  r="12"
                  fill="none"
                  stroke={chakra.color}
                  strokeWidth="1"
                  opacity="0.5"
                  className="pulse"
                />
              )}
            </g>
          );
        })}
        
        {/* Center glow */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke={completionPct >= 100 ? '#FFD700' : 'rgba(255,255,255,0.2)'}
          strokeWidth="2"
          opacity={completionPct / 100}
        />
      </svg>
      <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
        {completionPct >= 100 ? 'All Chakras Aligned! ✨' : 
         completionPct >= 75 ? 'Higher Chakras Opening' :
         completionPct >= 50 ? 'Heart Center Activated' :
         completionPct >= 25 ? 'Foundation Strengthening' :
         'Begin Your Journey'}
      </p>
    </div>
  );
};

export default ChakraWheel;
