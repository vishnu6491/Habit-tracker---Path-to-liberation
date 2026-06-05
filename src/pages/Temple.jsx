import React from 'react';
import { ACHIEVEMENTS } from '../data/constants';

const Temple = ({ state }) => {
  const records = state.user.templeRecords;

  return (
    <div>
      <h2 className="gold-text">Temple of Records</h2>
      <div className="card">
        <h3>Journey Start</h3>
        <p className="gold-text">{records.startDate}</p>
      </div>

      <div className="card">
        <h3>Milestones</h3>
        {Object.keys(records.milestones).length === 0 ? <p>No milestones reached yet.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(records.milestones).map(([name, date]) => (
              <li key={name} style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <span className="gold-text">{name}</span>: {date}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Achievements</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {ACHIEVEMENTS.map(ach => (
            <span key={ach.id} className={`badge ${state.user.achievements.includes(ach.id) ? 'earned' : ''}`} title={ach.desc}>
              {ach.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Temple;
