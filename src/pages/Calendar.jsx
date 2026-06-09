import React, { useState, useEffect } from 'react';
import { getToday, isHabitDueOnDate } from '../utils/helpers';

const CalendarPage = ({ state, actions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [localLog, setLocalLog] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayStr = getToday();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(new Date().getDate() - 2);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate) {
      const log = state.logs[selectedDate.dateStr] || { completed: [], missed: [] };
      setLocalLog(log);
    }
  }, [selectedDate, state.logs]);

  // Check if habit has consecutive misses ending on this date
  const checkConsecutiveMissesForDate = (habitId, logs, targetDate) => {
    const targetStr = targetDate.toISOString().split('T')[0];
    const targetLog = logs[targetStr];
    
    // Check if habit was missed on this target date
    const missedOnTarget = targetLog && targetLog.missed.includes(habitId);
    
    if (!missedOnTarget) return 0;
    
    // Check if habit was also missed yesterday
    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayLog = logs[yesterdayStr];
    const missedYesterday = yesterdayLog && yesterdayLog.missed.includes(habitId);
    
    if (missedYesterday) {
      // Count consecutive misses including target date
      let count = 2;
      let checkDate = new Date(yesterday);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (logs[checkStr] && logs[checkStr].missed.includes(habitId)) count++;
        else break;
      }
      return count;
    }
    
    return 0;
  };

  const getDayStats = (day, useLocalLog = false) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = useLocalLog && selectedDate && dateStr === selectedDate.dateStr ? localLog : (state.logs[dateStr] || { completed: [], missed: [] });
    const date = new Date(year, month, day);
    const dueHabits = state.habits.filter(h => h.active && isHabitDueOnDate(h, date));
    const dueCount = dueHabits.length;
    
    if (dueCount === 0) return { dateStr, due: 0, completed: 0, missed: 0, pct: 100, status: 'neutral', consecutiveMisses: 0, dueHabits, log };
    
    const completedCount = log.completed.filter(id => dueHabits.some(h => h.id === id)).length;
    const missedCount = log.missed.filter(id => dueHabits.some(h => h.id === id)).length;
    const pct = Math.round((completedCount / dueCount) * 100);
    
    let status = 'red';
    if (pct >= 80) status = 'green';
    else if (pct >= 50) status = 'yellow';
    
    // Check for consecutive misses (show warning on 3rd day)
    let consecutiveMisses = 0;
    dueHabits.forEach(habit => {
      const count = checkConsecutiveMissesForDate(habit.id, state.logs, date);
      if (count >= 2) {
        consecutiveMisses++;
      }
    });
    
    return { dateStr, due: dueCount, completed: completedCount, missed: missedCount, pct, status, consecutiveMisses, dueHabits, log };
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = state.logs[dateStr] || { completed: [], missed: [] };
    const stats = getDayStats(day);
    setSelectedDate({ ...stats, log });
    setEditMode(false);
    setLocalLog(log);
  };
  const handleEditClick = () => {
    if (!selectedDate) return;
    if (selectedDate.dateStr < threeDaysAgoStr) {
      alert('You can only edit habits for the last 3 days!');
      return;
    }
    if (selectedDate.dateStr > todayStr) {
      alert('You cannot edit future dates!');
      return;
    }
    setEditMode(true);
  };

  const handleToggleHabit = (habitId) => {
    if (!selectedDate) return;
    
    const currentLog = localLog || { completed: [], missed: [] };
    const isCompleted = currentLog.completed.includes(habitId);
    const isMissed = currentLog.missed.includes(habitId);
    
    let newCompleted, newMissed;
    
    if (isCompleted) {
      newCompleted = currentLog.completed.filter(id => id !== habitId);
      newMissed = [...currentLog.missed, habitId];
    } else if (isMissed) {
      newCompleted = currentLog.completed.filter(id => id !== habitId);
      newMissed = currentLog.missed.filter(id => id !== habitId);
    } else {
      newCompleted = [...currentLog.completed, habitId];
      newMissed = currentLog.missed.filter(id => id !== habitId);
    }
    
    const newLog = { completed: newCompleted, missed: newMissed };
    setLocalLog(newLog);
    
    const updatedStats = getDayStats(parseInt(selectedDate.dateStr.split('-')[2]), true);
    setSelectedDate({
      ...updatedStats,
      log: newLog,
      completed: newCompleted.length,
      missed: newMissed.length,
      pct: updatedStats.due > 0 ? Math.round((newCompleted.length / updatedStats.due) * 100) : 100
    });
    
    actions.updateLogsForDate(selectedDate.dateStr, newCompleted, newMissed);
  };

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
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const stats = getDayStats(day);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            
            return (
              <div 
                key={`${year}-${month}-${day}`}
                className={`calendar-day ${stats ? stats.status : ''} ${isToday ? 'today' : ''}`}
                onClick={() => !isFuture && handleDateClick(day)}
                style={{ 
                  position: 'relative', 
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                  opacity: isFuture ? 0.5 : 1
                }}
              >
                {stats && stats.consecutiveMisses > 0 && (
                  <div style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>⚠️</div>
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
            {!editMode && selectedDate.due > 0 && selectedDate.dateStr >= threeDaysAgoStr && selectedDate.dateStr <= todayStr && (
              <button className="btn btn-outline" style={{ width: 'auto', fontSize: '12px' }} onClick={handleEditClick}>
                ✏️ Edit
              </button>            )}
          </div>
          
          
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
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>Tap habits to toggle: ⚪ → ✅ → ❌ → </p>
              {selectedDate.dueHabits && selectedDate.dueHabits.map((habit) => {
                const isCompleted = localLog?.completed.includes(habit.id);
                const isMissed = localLog?.missed.includes(habit.id);
                
                return (
                  <div                     key={habit.id}
                    className={`habit-item ${isCompleted ? 'completed' : isMissed ? 'missed' : ''}`}
                    onClick={() => handleToggleHabit(habit.id)}
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
                );
              })}
              <button className="btn" style={{ marginTop: '16px' }} onClick={() => setEditMode(false)}>Done Editing</button>
            </div>
          )}
        </div>

/* PUNISHMENT - Moved to bottom */
{selectedDate.consecutiveMisses > 0 && state.settings.dashboardPunishment && (
  <div style={{ background: 'rgba(244,67,54,0.2)', padding: '12px', borderRadius: '8px', border: '2px solid #f44336', marginTop: '16px' }}>
    <p style={{ color: '#f44336', fontSize: '14px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
      ⚠️ Consecutive Miss Punishment
    </p>
    <p style={{ color: '#f44336', fontSize: '13px', margin: '0 0 8px 0' }}>
      You missed {selectedDate.consecutiveMisses} consecutive day(s)
    </p>
    <h4 className="gold-text" style={{ margin: '8px 0', fontSize: '16px' }}>
      {state.settings.dashboardPunishment}
    </h4>
  </div>
)}
      )}
    </div>
  );
};

export default CalendarPage;
