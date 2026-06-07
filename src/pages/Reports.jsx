import React, { useState } from 'react';

const Reports = ({ state }) => {
  const [view, setView] = useState('daily');
  
  const getCompletionData = (daysBack) => {
    const data = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = state.logs[dateStr];
      const activeCount = state.habits.filter(h => h.active).length;
      const completedCount = log ? log.completed.length : 0;
      const pct = activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;
      data.push({ date: dateStr, pct });
    }
    return data;
  };

  const data = view === 'daily' ? getCompletionData(7) : view === 'weekly' ? getCompletionData(28) : getCompletionData(30);
  const avgCompletion = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.pct, 0) / data.length) : 0;

  return (
    <div>
      <h2 className="gold-text" style={{fontSize: '20px'}}>Reports</h2>
      
      <div className="card">
        <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Completion Overview</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['daily', 'weekly', 'monthly'].map(v => (
            <button key={v} className={`btn ${view === v ? '' : 'btn-outline'}`} style={{ flex: 1, fontSize: '12px' }} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,215,0,0.1)', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Average Completion</p>
          <p className="gold-text" style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{avgCompletion}%</p>
        </div>
        <div style={{ marginTop: '12px' }}>
          {data.map((d, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                <span>{d.date}</span>
                <span>{d.pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${d.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Habit Streaks 🔥</h3>
        {state.habits.filter(h => h.active).length === 0 ? (
          <p style={{fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px'}}>No active habits yet</p>
        ) : (
          state.habits.filter(h => h.active).map(habit => (
            <div key={habit.id} className="report-bar">
              <div className="report-bar-label">
                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{habit.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{habit.difficulty} • {habit.frequency}</div>
              </div>
              <div className="report-bar-value">
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--theme-secondary)' }}>{habit.currentStreak}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>days</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Total Completed</p>
            <p className="gold-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{state.user.totalCompleted}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Current Level</p>
            <p className="primary-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{state.user.level}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Discipline Score</p>
            <p className="gold-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{Math.round(state.user.progress)}%</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Shop XP</p>
            <p className="primary-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{state.user.xp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
