import React, { useState } from 'react';
import { getToday, isHabitDueOnDate } from '../utils/helpers';

const CalendarPage = ({ state, actions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayStats = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = state.logs[dateStr];
    const date = new Date(year, month, day);
    const dueHabits = state.habits.filter(h => h.active && isHabitDueOnDate(h, date));
    const dueCount = dueHabits.length;
    
    if (dueCount === 0) return { dateStr, due: 0, completed: 0, missed: 0, pct: 100, status: 'neutral', hasConsecutiveMiss: false };
    
    const completedCount = log ? log.completed.filter(id => dueHabits.some(h => h.id === id)).length : 0;
    const missedCount = log ? log.missed.filter(id => dueHabits.some(h => h.id === id)).length : 0;
    const pct = Math.round((completedCount / dueCount) * 100);
    
    let status = 'red';
    if (pct >= 80) status = 'green';
    else if (pct >= 50) status = 'yellow';
    
    // Direct consecutive miss check
    let hasConsecutiveMiss = false;
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayLog = state.logs[yesterdayStr];

    dueHabits.forEach(habit => {
      const missedToday = log && log.missed.includes(habit.id);
      const missedYesterday = yesterdayLog && yesterdayLog.missed.includes(habit.id);
      if (missedToday && missedYesterday) hasConsecutiveMiss = true;
    });    
    return { dateStr, due: dueCount, completed: completedCount, missed: missedCount, pct, status, hasConsecutiveMiss, dueHabits, log };
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const stats = getDayStats(day);
    setSelectedDate(stats);
    setEditMode(false);
  };

  const handleEditClick = () => setEditMode(true);

  const handleToggleHabit = (habitId, dateStr) => {
    const log = state.logs[dateStr] || { completed: [], missed: [] };
    const isCompleted = log.completed.includes(habitId);
    const isMissed = log.missed.includes(habitId);
    
    let newCompleted, newMissed;
    
    if (isCompleted) {
      newCompleted = log.completed.filter(id => id !== habitId);
      newMissed = [...log.missed, habitId];
    } else if (isMissed) {
      newCompleted = log.completed.filter(id => id !== habitId);
      newMissed = log.missed.filter(id => id !== habitId);
    } else {
      newCompleted = [...log.completed, habitId];
      newMissed = log.missed;
    }
    
    actions.updateLogsForDate(dateStr, newCompleted, newMissed);
    
    setSelectedDate(prev => ({
      ...prev,
      log: { completed: newCompleted, missed: newMissed },
      completed: newCompleted.length,
      missed: newMissed.length,
      pct: prev.due > 0 ? Math.round((newCompleted.length / prev.due) * 100) : 100
    }));
  };

  const todayStr = getToday();

  return (
    <div>
      <h2 className="gold-text">Calendar</h2>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-outline" style={{ width: 'auto' }} onClick={prevMonth}>←</button>          <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
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
                onClick={() => handleDateClick(day)}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                {stats && stats.hasConsecutiveMiss && (
                  <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '12px' }}>⚠️</div>
                )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="gold-text">{selectedDate.dateStr}</h3>
            {/* FIXED: Only show Edit button for TODAY */}
            {!editMode && selectedDate.due > 0 && selectedDate.dateStr === todayStr && (
              <button className="btn btn-outline" style={{ width: 'auto', fontSize: '12px' }} onClick={handleEditClick}>
                ✏️ Edit
              </button>
            )}
          </div>
          
          {selectedDate.hasConsecutiveMiss && (
            <div style={{ background: 'rgba(244,67,54,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #f44336' }}>
              <p style={{ color: '#f44336', fontSize: '13px', margin: 0 }}>⚠️ Consecutive misses detected!</p>
            </div>
          )}          
          {selectedDate.due === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No habits were due on this day</p>
          ) : !editMode ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
                </div>
                <div style={{ background: 'rgba(255,215,0,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Completion</p>
                  <p className="gold-text" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{selectedDate.pct}%</p>
                </div>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${selectedDate.pct}%`, background: selectedDate.status === 'green' ? '#4caf50' : selectedDate.status === 'yellow' ? '#ff9800' : '#f44336' }}></div>
              </div>
            </>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>Tap habits to toggle status</p>
              {selectedDate.dueHabits.map(habit => {
                const isCompleted = selectedDate.log?.completed.includes(habit.id);
                const isMissed = selectedDate.log?.missed.includes(habit.id);
                
                return (
                  <div 
                    key={habit.id} 
                    className={`habit-item ${isCompleted ? 'completed' : isMissed ? 'missed' : ''}`}
                    onClick={() => handleToggleHabit(habit.id, selectedDate.dateStr)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <strong style={{fontSize: '14px'}}>{habit.name}</strong>
                      <div style={{ fontSize: '11px', color: '#888' }}>{habit.difficulty} • {habit.xp} XP</div>
                    </div>
                    <div style={{ fontSize: '20px' }}>
                      {isCompleted ? '✅' : isMissed ? '❌' : '⚪'}
                    </div>
                  </div>
                );              })}
              <button className="btn" style={{ marginTop: '16px' }} onClick={() => setEditMode(false)}>Done Editing</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
