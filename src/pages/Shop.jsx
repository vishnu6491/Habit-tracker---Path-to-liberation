import React from 'react';
import { SHOP_ITEMS } from '../data/constants';

const Shop = ({ state, actions }) => {
  return (
    <div>
      <h2 className="gold-text">Spiritual Shop</h2>
      <p style={{ marginBottom: '16px' }}>Your XP: <span className="gold-text">{state.user.xp}</span></p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {SHOP_ITEMS.map(item => {
          const owned = state.user.inventory.includes(item.id);
          const canAfford = state.user.xp >= item.cost;
          return (
            <div key={item.id} className="card" style={{ marginBottom: 0 }}>
              <h4>{item.name}</h4>
              <p style={{ fontSize: '12px', color: '#888', height: '40px' }}>{item.desc}</p>
              <p className="gold-text">{item.cost} XP</p>
              {owned ? (
                <button className="btn" disabled>Owned</button>
              ) : (
                <button className="btn" disabled={!canAfford} onClick={() => actions.buyItem(item)}>
                  {canAfford ? 'Purchase' : 'Need More XP'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
