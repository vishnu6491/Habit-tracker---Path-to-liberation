import React from 'react';
import { getSaintLevel } from '../utils/helpers';

const Avatar = ({ xp, inventory }) => {
  const levelInfo = getSaintLevel(xp);
  const hasHalo = inventory.includes('halo');
  const hasWings = inventory.includes('wings');
  const hasRobe = inventory.includes('robe');

  return (
    <div className="avatar-container">
      <svg className="avatar-svg" viewBox="0 0 100 100">
        {hasHalo && <ellipse cx="50" cy="20" rx="25" ry="8" fill="none" stroke="#FFD700" strokeWidth="3" className="pulse" />}
        {hasWings && <path d="M 20 50 Q 5 30 20 20 Q 40 30 50 40 Q 60 30 80 20 Q 95 30 80 50" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.8" />}
        <circle cx="50" cy="50" r="20" fill={hasRobe ? "#FFD700" : "#888"} />
        <path d="M 30 70 Q 50 90 70 70 L 70 100 L 30 100 Z" fill={hasRobe ? "#B8860B" : "#555"} />
        <text x="50" y="95" textAnchor="middle" fill="#FFD700" fontSize="10">{levelInfo.name}</text>
      </svg>
    </div>
  );
};

export default Avatar;
