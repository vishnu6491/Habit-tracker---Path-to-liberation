import React from 'react';
import { getSaintLevel } from '../utils/helpers';

const Environment = ({ xp, missedDays }) => {
  const levelInfo = getSaintLevel(xp);
  const isDegraded = missedDays >= 3;
  
  const getBg = () => {
    if (isDegraded) return 'linear-gradient(to bottom, #2c1a1a, #121212)';
    switch(levelInfo.level) {
      case 1: return 'linear-gradient(to bottom, #3e2723, #121212)';
      case 2: return 'linear-gradient(to bottom, #1b5e20, #121212)';
      case 3: return 'linear-gradient(to bottom, #33691e, #121212)';
      case 4: return 'linear-gradient(to bottom, #f57f17, #121212)';
      case 5: return 'linear-gradient(to bottom, #4a148c, #121212)';
      case 6: return 'linear-gradient(to bottom, #01579b, #121212)';
      case 7: return 'linear-gradient(to bottom, #FFD700, #121212)';
      default: return '#121212';
    }
  };

  return (
    <div className="card" style={{ background: getBg(), minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h3 className="gold-text">{isDegraded ? 'Environment Deteriorating' : levelInfo.env}</h3>
      {isDegraded && <p style={{color: '#f44336'}}>Your discipline wanes. The path darkens.</p>}
    </div>
  );
};

export default Environment;
