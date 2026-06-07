import React, { useState } from 'react';
import { CHAKRA_THEMES, REST_DAY_COST } from '../data/constants';

const Settings = ({ state, actions }) => {
  const [newPunishment, setNewPunishment] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  const handleFileImport = (e) => {
    if (e.target.files[0]) actions.importData(e.target.files[0]);
  };

  const handlePause = () => {
    if (pauseReason.trim()) {
      actions.togglePause(true, pauseReason);
      setShowPauseModal(false);
      setPauseReason('');
    }
  };

  const handleUnpause = () => {
    actions.togglePause(false, '');
  };

  return (
    <div>
      <h2 className="gold-text" style={{fontSize: '20px'}}>Settings</h2>
      
      {state.settings.isPaused ? (
        <div className="card" style={{ borderColor: '#FFD700', background: 'rgba(255,215,0,0.1)' }}>
          <h3 style={{ color: '#FFD700', fontSize: '16px' }}>⏸️ Journey Paused</h3>
          <p style={{ fontSize: '13px', color: '#888', margin: '8px 0' }}>{state.settings.pauseReason}</p>
          <button className="btn" onClick={handleUnpause}>Resume Journey</button>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontSize: '16px' }}>⏸️ Pause Journey</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
            For vacation, illness, or extended breaks. Your progress will be preserved.
          </p>
          <button className="btn btn-outline" onClick={() => setShowPauseModal(true)}>Pause All Habits</button>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '16px' }}>🌙 Rest Day</h3>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
          Take a guilt-free rest day. Habits won't affect progress today.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--theme-secondary)', marginBottom: '12px' }}>          Cost: {REST_DAY_COST} XP
        </p>
        <button 
          className="btn" 
          onClick={actions.activateRestDay}
          disabled={state.user.xp < REST_DAY_COST || state.settings.restDayActive}
        >
          {state.settings.restDayActive ? 'Rest Day Active' : `Activate Rest Day (${REST_DAY_COST} XP)`}
        </button>
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px'}}>App Theme</h3>
        <select className="select" value={state.settings.theme} onChange={e => actions.updateSettings({ theme: e.target.value })}>
          {CHAKRA_THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px'}}>Custom Punishments</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="input" style={{ marginBottom: 0 }} placeholder="Add punishment..." value={newPunishment} onChange={e => setNewPunishment(e.target.value)} />
          <button className="btn" style={{ width: 'auto', marginTop: 0 }} onClick={() => { if(newPunishment) { actions.addCustomPunishment(newPunishment); setNewPunishment(''); } }}>+</button>
        </div>
        <ul style={{ marginTop: '12px', paddingLeft: '20px', fontSize: '13px' }}>
          {state.settings.customPunishments.map((p, i) => (
            <li key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              {p}
              <button className="btn btn-danger" style={{ width: 'auto', padding: '4px 8px', margin: 0, fontSize: '12px' }} onClick={() => actions.removeCustomPunishment(p)}>×</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px'}}>Data Management</h3>
        <button className="btn" onClick={actions.exportData}>Export JSON Backup</button>
        <label className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '8px', cursor: 'pointer' }}>
          Import JSON Backup
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
        </label>
        <button className="btn btn-danger" style={{ marginTop: '16px' }} onClick={() => { if(window.confirm('ARE YOU SURE? This will erase all progress forever.')) actions.resetData(); }}>Reset All Data</button>
      </div>

      {showPauseModal && (
        <div className="modal-overlay" onClick={() => setShowPauseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="gold-text" style={{fontSize: '18px'}}>Pause Your Journey</h3>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
              Why are you pausing? (This helps you reflect when you return)            </p>
            <textarea 
              className="textarea" 
              placeholder="Vacation, illness, burnout, etc..." 
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
              rows="3"
            />
            <button className="btn" onClick={handlePause} disabled={!pauseReason.trim()}>Confirm Pause</button>
            <button className="btn btn-outline" onClick={() => setShowPauseModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
