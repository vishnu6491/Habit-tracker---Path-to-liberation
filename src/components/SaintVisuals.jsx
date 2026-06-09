import React from 'react';
import { getSaintLevel } from '../utils/helpers';
import { SHOP_ITEMS } from '../data/constants';

const SaintVisuals = ({ level, inventory }) => {
  const levelInfo = getSaintLevel(level);
  const equipped = {};
  inventory.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (item) equipped[item.slot] = item;
  });

  return (
    <div className="saint-scene">
      <div className="scene-bg-fallback" />
      <img src={levelInfo.environment} alt="" className="scene-env" onError={e => e.target.style.display = 'none'} />
      <img src={levelInfo.avatar} alt="" className="scene-avatar" onError={e => e.target.style.display = 'none'} />
      
      {equipped.wings && <img src={equipped.wings.image} className="equip equip-wings" alt="" />}
      {equipped.halo && <img src={equipped.halo.image} className="equip equip-halo" alt="" />}
      {equipped.staff && <img src={equipped.staff.image} className="equip equip-staff" alt="" />}
      {equipped.beads && <img src={equipped.beads.image} className="equip equip-beads" alt="" />}
      {equipped.robe && <img src={equipped.robe.image} className="equip equip-robe" alt="" />}
      {equipped.ring && <img src={equipped.ring.image} className="equip equip-ring" alt="" />}
      {equipped.throne && <img src={equipped.throne.image} className="equip equip-throne" alt="" />}
      {equipped.mat && <img src={equipped.mat.image} className="equip equip-mat" alt="" />}
      
      <div className="scene-label">{levelInfo.name}</div>
    </div>
  );
};

export default SaintVisuals;
