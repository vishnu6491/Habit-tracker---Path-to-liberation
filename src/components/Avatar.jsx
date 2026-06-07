import React, { useState } from 'react';
import { getSaintLevel } from '../utils/helpers';
import { SHOP_ITEMS } from '../data/constants';

const Avatar = ({ xp, inventory }) => {
  const levelInfo = getSaintLevel(xp);
  const [imageError, setImageError] = useState(false);
  
  // Get equipped items by slot
  const equippedItems = {};
  inventory.forEach(itemId => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (item) {
      equippedItems[item.slot] = item;
    }
  });

  const FallbackAvatar = () => (
    <svg className="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="rgba(255,215,0,0.2)" className="pulse" />
      <circle cx="50" cy="35" r="15" fill="#FFDBAC" />
      <path d="M 25 85 Q 50 95 75 85 L 70 60 Q 50 55 30 60 Z" fill={equippedItems.robe ? "#FFD700" : "#8B4513"} />
      <text x="50" y="95" textAnchor="middle" fill="#FFD700" fontSize="8">{levelInfo.name}</text>
    </svg>
  );

  return (
    <div className="avatar-container">
      <div className="avatar-wrapper">
        {/* Equipment: Wings (behind avatar) */}
        {equippedItems.wings && (
          <img 
            src={equippedItems.wings.image} 
            alt="Wings"
            className="equipment-overlay equipment-wings"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Equipment: Throne (behind/below avatar) */}
        {equippedItems.throne && (
          <img 
            src={equippedItems.throne.image} 
            alt="Throne"
            className="equipment-overlay equipment-throne"
            style={{ zIndex: 1, bottom: '-20px' }}
          />
        )}

        {/* Main Avatar Image */}        {!imageError ? (
          <img 
            src={levelInfo.avatar} 
            alt={levelInfo.name}
            className="avatar-image"
            onError={() => setImageError(true)}
            style={{ zIndex: 2 }}
          />
        ) : (
          <FallbackAvatar />
        )}

        {/* Equipment: Halo (above head) */}
        {equippedItems.halo && (
          <img 
            src={equippedItems.halo.image} 
            alt="Halo"
            className="equipment-overlay equipment-halo"
            style={{ zIndex: 3, top: '-15px' }}
          />
        )}

        {/* Equipment: Aura Ring (around body) */}
        {equippedItems.ring && (
          <img 
            src={equippedItems.ring.image} 
            alt="Aura Ring"
            className="equipment-overlay equipment-aura"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Equipment: Staff (side) */}
        {equippedItems.staff && (
          <img 
            src={equippedItems.staff.image} 
            alt="Staff"
            className="equipment-overlay equipment-staff"
            style={{ zIndex: 3, right: '-20px', bottom: '10px' }}
          />
        )}

        {/* Equipment: Beads (neck) */}
        {equippedItems.beads && (
          <img 
            src={equippedItems.beads.image} 
            alt="Beads"
            className="equipment-overlay equipment-beads"
            style={{ zIndex: 3, top: '40%' }}
          />        )}

        {/* Equipment: Mat (floor) */}
        {equippedItems.mat && (
          <img 
            src={equippedItems.mat.image} 
            alt="Mat"
            className="equipment-overlay equipment-mat"
            style={{ zIndex: 0, bottom: '-30px' }}
          />
        )}
      </div>

      <p className="gold-text avatar-name">{levelInfo.name}</p>
      
      {/* Equipment badges */}
      {inventory.length > 0 && (
        <div className="equipment-badges">
          {inventory.map(itemId => {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            return item ? (
              <span key={itemId} className="equipment-badge">
                {item.name}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default Avatar;
