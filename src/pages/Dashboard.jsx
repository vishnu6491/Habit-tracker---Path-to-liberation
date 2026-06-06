import React from 'react';
import { getToday, getSaintLevel, calculateStreak, checkLiberation } from '../utils/helpers';
import Avatar from '../components/Avatar';
import Environment from '../components/Environment';
import ProgressBar from '../components/ProgressBar';

const Dashboard = ({ state, actions }) => {
  const today = getToday();
  const todayLog = state.logs[today] || { completedHabits: [], missedHabits: [] };
  const activeHabits = state.habits.filter(h => h.active);
  const streak = calculateStreak(state.logs);
  const levelInfo = getSaintLevel(state.user.xp);
  const nextLevel = null;
  const isLiberated = checkLiberation(state);

  return (
    <div>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '16px' }}>Habit Quest</h2>
      <Avatar xp={state.user.xp} inventory={state.user.inventory} />
      <Environment xp={state.user.xp} missedDays={state.settings.missedDaysStreak} />
      
      <div className="card">
        <h3>Liberation Meter</h3>
        <p>Level: <span className="gold-text">{levelInfo.name}</span></p>
        <p>XP: <span className="gold-text">{state.user.xp}</span></p>
        <p>Streak: <span className="gold-text">{streak} days</span> (Longest: {state.user.longestStreak})</p>
        <p>Karma: <span className={state.user.karma >= 0 ? 'gold-text' : 'text-danger'}>{state.user.karma}</span></p>
        {nextLevel && <ProgressBar current={state.user.xp - levelInfo.minXp} max={nextLevel.minXp - levelInfo.minXp} label={`Progress to ${nextLevel.name}`} />}
        {isLiberated && <h3 className="gold-text pulse" style={{textAlign: 'center', marginTop: '16px'}}>🌟 LIBERATION ACHIEVED 🌟</h3>}
      </div>

      {state.settings.currentPunishment && (
        <div className="card" style={{ borderColor: '#f44336' }}>
          <h3 style={{ color: '#f44336' }}>⚠️ Discipline Punishment</h3>
          <p>You have neglected your path. Complete this to restore balance:</p>
          <h4 className="gold-text" style={{ marginTop: '8px' }}>{state.settings.currentPunishment}</h4>
          <button className="btn" onClick={() => actions.updateHabit('settings', { currentPunishment: null, missedDaysStreak: 0 })}>I Have Completed This Punishment</button>
        </div>
      )}

      <div className="card">
        <h3>Today's Quests</h3>
        {activeHabits.length === 0 ? <p>No active habits. Add one in the Habits tab.</p> : activeHabits.map(habit => {
          const isDone = todayLog.completedHabits.includes(habit.id);
          const isMissed = todayLog.missedHabits.includes(habit.id);
          return (
            <div key={habit.id} className={`habit-item ${isDone ? 'completed' : isMissed ? 'missed' : ''}`}>
              <div>
                <strong>{habit.name}</strong>
                <div style={{ fontSize: '12px', color: '#888' }}>{habit.difficulty} • {habit.category}</div>
              </div>
              <div>
                {!isDone && !isMissed && <button className="btn" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => actions.completeHabit(habit.id)}>✓</button>}
                {!isDone && !isMissed && <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', marginLeft: '8px' }} onClick={() => actions.missHabit(habit.id)}>✗</button>}
                {isDone && <span style={{ color: '#4caf50' }}>Completed</span>}
                {isMissed && <span style={{ color: '#f44336' }}>Missed</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
