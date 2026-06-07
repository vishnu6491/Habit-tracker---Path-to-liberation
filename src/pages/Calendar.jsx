import React, { useState } from 'react';
import { getToday, isHabitDueOnDate } from '../utils/helpers';
import { SAINT_LEVELS } from '../data/constants';

const CalendarPage = ({ state }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // FIXED: Calculate completion for a specific date
  const getDayStats = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = state.logs[dateStr];
    
    // Calculate which habits were due on this date
    const date = new Date(year, month, day);
    const dueHabits = state.habits.filter(h => h.active && isHabitDueOnDate(h, date));
    const dueCount = dueHabits.length;
    
    if (dueCount === 0) return { dateStr, due: 0, completed: 0, missed: 0, pct: 100, status: 'neutral' };
    
    const completedCount = log ? log.completed.filter(id => dueHabits.some(h => h.id === id)).length : 0;
    const missedCount = log ? log.missed.filter(id => dueHabits.some(h => h.id === id)).length : 0;
    const pct = Math.round((completedCount / dueCount) * 100);
    
    // Determine color based on completion percentage
    // Green if >= 80%, Yellow if >= 50%, Red if < 50%
    let status = 'red';
    if (pct >= 80) status = 'green';
    else if (pct >= 50) status = 'yellow';
    
    return { dateStr, due: dueCount, completed: completedCount, missed: missedCount, pct, status };
  };

  const todayStr = getToday();

  return (
    <div>      <h2 className="gold-text">Calendar</h2>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-outline" style={{ width: 'auto' }} onClick={prevMonth}>←</button>
          <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button className="btn btn-outline" style={{ width: 'auto' }} onClick={nextMonth}>→</button>
        </div>
        <div className="calendar-grid">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>{d}</div>)}
          {days.map((day, i) => {
            if (!day) return <div key={i}></div>;
            const stats = getDayStats(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            
            return (
              <div 
                key={i} 
                className={`calendar-day ${stats ? stats.status : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(stats)}
                style={{ position: 'relative' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{day}</div>
                {stats && stats.due > 0 && (
                  <div style={{ fontSize: '9px', marginTop: '2px' }}>
                    {stats.completed}/{stats.due}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="card">
          <h3 className="gold-text">{selectedDate.dateStr}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Due</p>
              <p className="gold-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{selectedDate.due}</p>
            </div>
            <div style={{ background: 'rgba(76,175,80,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Completed</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>{selectedDate.completed}</p>
            </div>
            <div style={{ background: 'rgba(244,67,54,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Missed</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f44336' }}>{selectedDate.missed}</p>
            </div>            <div style={{ background: 'rgba(255,215,0,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Completion</p>
              <p className="gold-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{selectedDate.pct}%</p>
            </div>
          </div>
          
          {selectedDate.due > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${selectedDate.pct}%`, background: selectedDate.status === 'green' ? '#4caf50' : selectedDate.status === 'yellow' ? '#ff9800' : '#f44336' }}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
