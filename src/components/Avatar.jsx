import React from 'react';
import { getSaintLevel } from '../utils/helpers';

const Avatar = ({ xp, inventory }) => {
  const levelInfo = getSaintLevel(xp);
  const level = levelInfo.level;
  const hasHalo = inventory.includes('halo');
  const hasWings = inventory.includes('wings');
  const hasRobe = inventory.includes('robe');
  const hasStaff = inventory.includes('staff');
  const hasBeads = inventory.includes('beads');

  const skinColor = "#FFDBAC";
  const robeColor = hasRobe ? "#FFD700" : (level >= 4 ? "#8B0000" : (level >= 2 ? "#D2691E" : "#555555"));
  const auraColor = level >= 5 ? "rgba(255, 215, 0, 0.3)" : (level >= 3 ? "rgba(255, 255, 255, 0.1)" : "transparent");

  return (
    <div className="avatar-container">
      <svg className="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Spiritual Aura */}
        {level >= 3 && <circle cx="50" cy="50" r="45" fill={auraColor} className="pulse" />}
        
        {/* Divine Wings */}
        {hasWings && (
          <g stroke="#FFD700" strokeWidth="1.5" fill="rgba(255,215,0,0.2)">
            <path d="M 35 45 Q 10 20 20 10 Q 35 25 45 40 Z" />
            <path d="M 65 45 Q 90 20 80 10 Q 65 25 55 40 Z" />
          </g>
        )}

        {/* Golden Halo */}
        {hasHalo && <ellipse cx="50" cy="18" rx="18" ry="6" fill="none" stroke="#FFD700" strokeWidth="2" className="pulse" />}

        {/* Body / Robe (Lotus Pose) */}
        <path d="M 25 85 Q 50 95 75 85 L 70 60 Q 50 55 30 60 Z" fill={robeColor} />
        
        {/* Shoulders */}
        <path d="M 35 60 Q 50 45 65 60 Z" fill={robeColor} />
        
        {/* Head */}
        <circle cx="50" cy="35" r="12" fill={skinColor} />
        
        {/* Eyes (Closed in meditation) */}
        <path d="M 44 35 Q 46 37 48 35" stroke="#333" strokeWidth="1" fill="none" />
        <path d="M 52 35 Q 54 37 56 35" stroke="#333" strokeWidth="1" fill="none" />

        {/* Prayer Beads */}
        {hasBeads && <circle cx="50" cy="55" r="8" fill="none" stroke="#8B4513" strokeWidth="2" strokeDasharray="2,2" />}

        {/* Wooden Staff */}
        {hasStaff && <line x1="82" y1="20" x2="82" y2="90" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />}
      </svg>
      <p className="gold-text" style={{marginTop: '8px', fontWeight: 'bold', textAlign: 'center'}}>{levelInfo.name}</p>
    </div>
  );
};

export default Avatar;
