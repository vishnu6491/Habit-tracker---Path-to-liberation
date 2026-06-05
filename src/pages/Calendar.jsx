import React, { useState } from 'react';
import { getToday } from '../utils/helpers';

const CalendarPage = ({ state, actions }) => {
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

  const getDayStatus = (day) => {
    if (!day) return '';
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = state.logs[dateStr];
    if (!log) return '';
    const activeCount = state.habits.filter(h => h.active).length;
    if (activeCount === 0) return '';
    const completed = log.completedHabits?.length || 0;
    const missed = log.missedHabits?.length || 0;
    if (completed === activeCount) return 'perfect';
    if (completed > 0) return 'good';
    return 'missed';
  };

  const todayStr = getToday();

  return (
    <div>
      <h2 className="gold-text">Calendar</h2>
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
            const isToday = dateStr === todayStr;
            return (
              <div 
                key={i} 
                className={`calendar-day ${getDayStatus(day)} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && state.logs[selectedDate] && (
        <div className="card">
          <h3 className="gold-text">{selectedDate}</h3>
          <p>Mood: {state.logs[selectedDate].mood || 'Not logged'}</p>
          <p>Journal: {state.logs[selectedDate].journal || 'No entry'}</p>
          <p>Completed: {state.logs[selectedDate].completedHabits?.length || 0}</p>
          <p>Missed: {state.logs[selectedDate].missedHabits?.length || 0}</p>
          <p>XP Earned: {state.logs[selectedDate].xpEarned || 0}</p>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
