import React, { useState } from 'react';

const Reports = ({ state }) => {
  const [view, setView] = useState('daily');
  
  const getDailyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = state.logs[dateStr];
      const dueHabits = state.habits.filter(h => h.active); // Simplified for report
      const completedCount = log ? log.completed.length : 0;
      const totalDue = dueHabits.length;
      const pct = totalDue > 0 ? Math.round((completedCount / totalDue) * 100) : 0;
      data.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), pct, date: dateStr });
    }
    return data;
  };

  const getWeeklyData = () => {
    const weeks = [];
    const today = new Date();
    // Get last 4 weeks
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (w * 7)));
      
      let totalPct = 0;
      let daysCounted = 0;
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        if (d > today) break;
        
        const dateStr = d.toISOString().split('T')[0];
        const log = state.logs[dateStr];
        const dueHabits = state.habits.filter(h => h.active);
        const completedCount = log ? log.completed.length : 0;
        const totalDue = dueHabits.length;
        const pct = totalDue > 0 ? (completedCount / totalDue) * 100 : 0;
        
        totalPct += pct;
        daysCounted++;
      }
      
      const avgPct = daysCounted > 0 ? Math.round(totalPct / daysCounted) : 0;
      // Calculate week number of the year      const oneJan = new Date(weekStart.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((weekStart - oneJan) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      
      weeks.push({ label: `Week ${weekNum}`, pct: avgPct });
    }
    return weeks;
  };

  const getMonthlyData = () => {
    const months = [];
    const today = new Date();
    // Get last 3 months
    for (let m = 2; m >= 0; m--) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthName = d.toLocaleString('default', { month: 'long' });
      
      let totalPct = 0;
      let daysCounted = 0;
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const checkDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (checkDate > today) break;
        
        const dateStr = checkDate.toISOString().split('T')[0];
        const log = state.logs[dateStr];
        const dueHabits = state.habits.filter(h => h.active);
        const completedCount = log ? log.completed.length : 0;
        const totalDue = dueHabits.length;
        const pct = totalDue > 0 ? (completedCount / totalDue) * 100 : 0;
        
        totalPct += pct;
        daysCounted++;
      }
      
      const avgPct = daysCounted > 0 ? Math.round(totalPct / daysCounted) : 0;
      months.push({ label: monthName, pct: avgPct });
    }
    return months;
  };

  let data = [];
  if (view === 'daily') data = getDailyData();
  else if (view === 'weekly') data = getWeeklyData();
  else data = getMonthlyData();

  const avgCompletion = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.pct, 0) / data.length) : 0;

  return (    <div>
      <h2 className="gold-text" style={{fontSize: '20px'}}>Reports</h2>
      
      <div className="card">
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ccc', marginBottom: '4px' }}>
                <span style={{fontWeight: 'bold'}}>{d.label}</span>
                <span className="gold-text">{d.pct}%</span>
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
          <p style={{fontSize: '13px', color: '#888', textAlign: 'center'}}>No active habits</p>
        ) : (
          state.habits.filter(h => h.active).map(habit => (
            <div key={habit.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{fontSize: '13px'}}>{habit.name}</span>
              <span className="gold-text" style={{fontSize: '13px', fontWeight: 'bold'}}>{habit.currentStreak} days</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reports;
