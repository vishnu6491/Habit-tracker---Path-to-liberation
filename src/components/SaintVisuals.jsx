import React from 'react';
import { getSaintLevel } from '../utils/helpers';
import { SHOP_ITEMS } from '../data/constants';

const SaintVisuals = ({ progress, inventory }) => {
  const levelInfo = getSaintLevel(progress);
  
  // Map inventory to equipped items
  const equipped = {};
  inventory.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (item) equipped[item.slot] = item;
  });

  return (
    <div className="saint-scene">
      {/* LAYER 1: Environment Background */}
      <img 
        src={levelInfo.environment} 
        alt={levelInfo.env} 
        className="scene-env" 
      />
      
      {/* LAYER 2: Avatar (Center) */}
      <img 
        src={levelInfo.avatar} 
        alt={levelInfo.name} 
        className="scene-avatar" 
      />

      {/* LAYER 3: Equipment (Front) */}
      {equipped.wings && <img src={equipped.wings.image} className="equip equip-wings" alt="Wings" />}
      {equipped.halo && <img src={equipped.halo.image} className="equip equip-halo" alt="Halo" />}
      {equipped.staff && <img src={equipped.staff.image} className="equip equip-staff" alt="Staff" />}
      {equipped.beads && <img src={equipped.beads.image} className="equip equip-beads" alt="Beads" />}
      {equipped.robe && <img src={equipped.robe.image} className="equip equip-robe" alt="Robe" />}
      {equipped.ring && <img src={equipped.ring.image} className="equip equip-ring" alt="Ring" />}
      {equipped.throne && <img src={equipped.throne.image} className="equip equip-throne" alt="Throne" />}
      {equipped.mat && <img src={equipped.mat.image} className="equip equip-mat" alt="Mat" />}
      
      {/* Level Name Label */}
      <div className="scene-label">{levelInfo.name}</div>
    </div>
  );
};

export default SaintVisuals;
