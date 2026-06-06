import React, { useState } from 'react';

const Settings = ({ state, actions }) => {
  const [newPunishment, setNewPunishment] = useState('');
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalText, setJournalText] = useState(state.logs[journalDate]?.journal || '');
  const [mood, setMood] = useState(state.logs[journalDate]?.mood || 'Neutral');

  const handleJournalSave = () => {
    actions.addJournalEntry(journalDate, journalText, mood);
    alert('Journal saved');
  };

  const handleFileImport = (e) => {
    if (e.target.files[0]) {
      actions.importData(e.target.files[0]);
    }
  };

  return (
    <div>
      <h2 className="gold-text">Settings</h2>
      
      <div className="card">
        <h3>Daily Journal & Mood</h3>
        <input type="date" className="input" value={journalDate} onChange={e => { setJournalDate(e.target.value); setJournalText(state.logs[e.target.value]?.journal || ''); setMood(state.logs[e.target.value]?.mood || 'Neutral'); }} />
        <select className="select" value={mood} onChange={e => setMood(e.target.value)}>
          <option value="Great">😀 Great</option>
          <option value="Good">🙂 Good</option>
          <option value="Neutral">😐 Neutral</option>
          <option value="Difficult">☹ Difficult</option>
        </select>
        <textarea className="textarea" rows="4" placeholder="Reflections..." value={journalText} onChange={e => setJournalText(e.target.value)} />
        <button className="btn" onClick={handleJournalSave}>Save Entry</button>
      </div>

      <div className="card">
        <h3>Custom Punishments</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="input" style={{ marginBottom: 0 }} placeholder="Add punishment..." value={newPunishment} onChange={e => setNewPunishment(e.target.value)} />
          <button className="btn" style={{ width: 'auto', marginTop: 0 }} onClick={() => { if(newPunishment) { actions.addCustomPunishment(newPunishment); setNewPunishment(''); } }}>+</button>
        </div>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          {state.settings.customPunishments.map((p, i) => (
            <li key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              {p}
              <button className="btn btn-danger" style={{ width: 'auto', padding: '4px 8px', margin: 0 }} onClick={() => actions.removeCustomPunishment(p)}>×</button>
            </li>
          ))}
        </ul>
        <select className="select" value={state.settings.punishmentMode} onChange={e => actions.updateSettings({ punishmentMode: e.target.value })}> {/* FIXED: Replaced undefined setState */}
          <option value="built-in">Built-in Only</option>
          <option value="custom">Custom Only</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="card">
        <h3>Data Management</h3>
        <button className="btn" onClick={actions.exportData}>Export JSON Backup</button>
        <label className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '8px', cursor: 'pointer' }}>
          Import JSON Backup
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
        </label>
        <button className="btn btn-danger" style={{ marginTop: '16px' }} onClick={() => { if(window.confirm('ARE YOU SURE? This will erase all progress forever.')) actions.resetData(); }}>Reset All Data</button>
      </div>
    </div>
  );
};

export default Settings;
