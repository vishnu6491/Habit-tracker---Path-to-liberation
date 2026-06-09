import React from 'react';
import { getToday } from '../utils/helpers';
import SaintVisuals from '../components/SaintVisuals';
import ProgressBar from '../components/ProgressBar';

const Dashboard = ({ state, actions }) => {
  const today = getToday();
  const todayLog = state.logs[today] || { completed: [], missed: [] };
  const dueHabits = actions.getDueHabits();
  
  const completionPct = dueHabits.length > 0 ? Math.round((todayLog.completed.length / dueHabits.length) * 100) : 0;

  // Calculate display values
  const displayLevelPoints = state.user.levelPoints + (state.user.pendingLevelPoints || 0);
  const nextLevelThreshold = (state.user.level) * 100; // Level 1 needs 100 pts to reach Level 2

  const getMood = (pct) => pct === 100 ? 4 : pct >= 80 ? 3 : pct >= 50 ? 2 : pct >= 20 ? 1 : 0;
  const currentMood = getMood(completionPct);
  const moods = ['😫', '😟', '', '🙂', '🤩'];

  if (state.settings.isPaused) {
    return <div style={{ textAlign: 'center', padding: '40px 20px' }}><h2 className="gold-text">️ Journey Paused</h2><p style={{ color: '#888' }}>{state.settings.pauseReason}</p></div>;
  }

  return (
    <div>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '20px' }}>Habit Quest</h2>
      {state.settings.restDayActive && <div className="card" style={{ borderColor: '#FFD700', background: 'rgba(255,215,0,0.1)' }}><h3 style={{ color: '#FFD700', fontSize: '14px', margin: 0 }}> Rest Day Active</h3></div>}
      
      {state.settings.dashboardPunishment && (
        <div className="card" style={{ borderColor: '#f44336', background: 'rgba(244,67,54,0.1)' }}>
          <h3 style={{ color: '#f44336', fontSize: '16px' }}>⚠️ Daily Punishment</h3>
          <p style={{ fontSize: '13px', marginBottom: '8px' }}>You missed too many habits today</p>
          <h4 className="gold-text" style={{ margin: '8px 0' }}>{state.settings.dashboardPunishment}</h4>
          <button className="btn" onClick={actions.clearPunishment}>Mark as Completed</button>
        </div>
      )}
      
      <SaintVisuals level={state.user.level} inventory={state.user.inventory} />
      
      <div className="card">
        <h3 style={{fontSize: '16px'}}>Liberation Meter</h3>
        <p>Level: <span className="gold-text">Level {state.user.level}</span></p>
        <p>Shop XP: <span className="gold-text">{state.user.xp}</span></p>
        
        {/* LIFETIME DISCIPLINE */}
        <p style={{marginBottom: '4px'}}>Lifetime Discipline: <span className="gold-text" style={{fontSize: '18px'}}>{Math.round(state.user.lifetimeDiscipline)}%</span></p>
        <p style={{fontSize: '11px', color: '#888', marginTop: '-8px', marginBottom: '12px'}}>Your historical average since day 1</p>
        
        <div className="mood-container">
          {moods.map((mood, i) => <span key={i} className={`mood-item ${i === currentMood ? 'active' : ''}`}>{mood}</span>)}
        </div>
        <p style={{textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '8px'}}>Today: {completionPct}% ({todayLog.completed.length}/{dueHabits.length})</p>
        
        {/* LEVEL PROGRESS BAR */}
        {state.user.level < 7 && (
        <ProgressBar 
        current={state.user.pointsForCurrentLevel || 0} 
        max={state.user.pointsNeededForNextLevel || 100} 
        label={`Level Progress (${Math.round(state.user.pointsForCurrentLevel || 0)} / ${state.user.pointsNeededForNextLevel || 100} pts)`} 
   />
 )}
      </div>

      <div className="card">
        <h3 style={{fontSize: '16px'}}>Today's Quests</h3>
        {dueHabits.length === 0 ? <p style={{fontSize: '13px', color: '#888'}}>No habits due today.</p> : dueHabits.map(habit => {
          const isDone = todayLog.completed.includes(habit.id);
          const isMissed = todayLog.missed.includes(habit.id);
          return (
            <div key={habit.id} className={`habit-item ${isDone ? 'completed' : isMissed ? 'missed' : ''}`}>
              <div>
                <strong style={{fontSize: '14px'}}>{habit.name}</strong>
                <div style={{ fontSize: '11px', color: '#888' }}>{habit.difficulty} • {habit.xp} XP</div>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                {!isDone && !isMissed && (
                  <>
                    <button className="btn" style={{ width: 'auto', padding: '6px 12px', fontSize: '14px' }} onClick={() => actions.completeHabit(habit.id)}>✓</button>
                    <button className="btn btn-danger" style={{ width: 'auto', padding: '6px 12px', fontSize: '16px' }} onClick={() => actions.missHabit(habit.id)}>✗</button>
                  </>
                )}
                {(isDone || isMissed) && <button className="btn btn-outline" style={{ width: 'auto', padding: '4px 8px', fontSize: '10px' }} onClick={() => actions.undoHabit(habit.id)}>Undo</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
