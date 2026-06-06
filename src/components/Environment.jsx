import React from 'react';
import { getSaintLevel } from '../utils/helpers';

const Environment = ({ xp, missedDays }) => {
  const levelInfo = getSaintLevel(xp);
  const isDegraded = missedDays >= 3;
  const level = levelInfo.level;

  const renderScene = () => {
    if (isDegraded) {
      return (
        <g>
          <rect width="300" height="150" fill="#2c1a1a" />
          <path d="M 140 150 L 145 100 L 130 80 M 145 100 L 160 70" stroke="#111" strokeWidth="4" fill="none" />
          <path d="M 50 150 Q 150 130 250 150" fill="#1a1a1a" />
        </g>
      );
    }

    switch (level) {
      case 1: // Dusty Path
        return (
          <g>
            <rect width="300" height="100" fill="#5C4033" />
            <rect y="100" width="300" height="50" fill="#8B7355" />
            <circle cx="250" cy="40" r="20" fill="#D2B48C" opacity="0.5" />
          </g>
        );
      case 2: // Forest
        return (
          <g>
            <rect width="300" height="150" fill="#87CEEB" />
            <rect y="110" width="300" height="40" fill="#228B22" />
            <polygon points="40,110 60,50 80,110" fill="#006400" />
            <polygon points="220,110 240,60 260,110" fill="#006400" />
          </g>
        );
      case 3: // Hermitage
        return (
          <g>
            <rect width="300" height="150" fill="#B0C4DE" />
            <polygon points="0,150 100,80 200,150" fill="#696969" />
            <rect x="130" y="110" width="40" height="40" fill="#8B4513" />
            <polygon points="120,110 150,90 180,110" fill="#A52A2A" />
          </g>
        );
      case 4: // Ashram
        return (
          <g>
            <rect width="300" height="150" fill="#FFA07A" />            <rect y="120" width="300" height="30" fill="#D2B48C" />
            <rect x="120" y="80" width="60" height="40" fill="#F5F5DC" />
            <polygon points="110,80 150,50 190,80" fill="#FF8C00" />
          </g>
        );
      case 5: // Temple
        return (
          <g>
            <rect width="300" height="150" fill="#E6E6FA" />
            <rect y="120" width="300" height="30" fill="#D3D3D3" />
            <rect x="100" y="70" width="10" height="50" fill="#FFF" />
            <rect x="130" y="70" width="10" height="50" fill="#FFF" />
            <rect x="160" y="70" width="10" height="50" fill="#FFF" />
            <rect x="190" y="70" width="10" height="50" fill="#FFF" />
            <polygon points="80,70 150,30 220,70" fill="#FFD700" />
          </g>
        );
      case 6: // Celestial Realm
        return (
          <g>
            <rect width="300" height="150" fill="#000033" />
            <circle cx="50" cy="30" r="2" fill="#FFF" />
            <circle cx="120" cy="60" r="1.5" fill="#FFF" />
            <circle cx="250" cy="40" r="2.5" fill="#FFF" />
            <circle cx="200" cy="90" r="1" fill="#FFF" />
            <ellipse cx="150" cy="130" rx="100" ry="20" fill="rgba(255,255,255,0.1)" />
          </g>
        );
      case 7: // Liberation Realm
        return (
          <g>
            <defs>
              <radialGradient id="goldGradient">
                <stop offset="0%" stopColor="#FFF8DC" />
                <stop offset="100%" stopColor="#FFD700" />
              </radialGradient>
            </defs>
            <rect width="300" height="150" fill="url(#goldGradient)" />
            <path d="M 150 120 Q 130 100 150 80 Q 170 100 150 120" fill="#FFF" opacity="0.8" />
          </g>
        );
      default:
        return <rect width="300" height="150" fill="#121212" />;
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', border: isDegraded ? '2px solid #f44336' : '1px solid #333' }}>
      <svg viewBox="0 0 300 150" style={{ width: '100%', height: '150px', display: 'block' }}>
        {renderScene()}      </svg>
      <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.7)' }}>
        <h3 className="gold-text" style={{ margin: 0 }}>{isDegraded ? 'Environment Deteriorating' : levelInfo.env}</h3>
        {isDegraded && <p style={{color: '#f44336', fontSize: '12px', margin: '4px 0 0 0'}}>Your discipline wanes. The path darkens.</p>}
      </div>
    </div>
  );
};

export default Environment;
