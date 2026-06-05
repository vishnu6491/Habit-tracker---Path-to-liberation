import React, { useState } from 'react';
import { BarChart, LineChart } from '../components/SVGCharts';

const Reports = ({ state }) => {
  const [view, setView] = useState('weekly');
  
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = state.logs[dateStr];
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        value: log ? log.completedHabits?.length || 0 : 0
      });
    }
    return days;
  };

  const data = getLast7Days();
  const totalCompleted = data.reduce((sum, d) => sum + d.value, 0);
  const activeHabits = state.habits.filter(h => h.active).length;
  const completionRate = activeHabits > 0 ? Math.round((totalCompleted / (activeHabits * 7)) * 100) : 0;

  return (
    <div>
      <h2 className="gold-text">Reports</h2>
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['daily', 'weekly', 'monthly'].map(v => (
            <button key={v} className={`btn ${view === v ? '' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <h3>Completion Rate: {completionRate}%</h3>
        <BarChart data={data} />
      </div>

      <div className="card">
        <h3>Mastery Quests</h3>
        {state.user.masteryQuests.map(q => {
          const def = MASTERY_QUESTS.find(m => m.id === q.id);
          return (
            <div key={q.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{def.name}</span>
                <span className="gold-text">{q.progress}/{def.target}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (q.progress / def.target) * 100)}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {!state.user.trialCompleted && state.user.level >= 6 && (
        <div className="card" style={{ borderColor: '#FFD700' }}>
          <h3 className="gold-text">Final Liberation Trial</h3>
          <p>Complete 30 consecutive days with 90%+ completion and no punishments to unlock Liberation.</p>
          <button className="btn" onClick={() => { if(window.confirm('Begin Trial?')) actions.completeTrial(); }}>I Accept the Trial</button>
        </div>
      )}
    </div>
  );
};

export default Reports;
