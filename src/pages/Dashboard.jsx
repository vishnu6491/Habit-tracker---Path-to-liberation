import React from 'react';
import { getToday, getSaintLevel } from '../utils/helpers';
import { SAINT_LEVELS } from '../data/constants';
import Avatar from '../components/Avatar';
import Environment from '../components/Environment';
import ProgressBar from '../components/ProgressBar';
import ChakraWheel from '../components/ChakraWheel';

const Dashboard = ({ state, actions }) => {
  const today = getToday();
  const todayLog = state.logs[today] || { completed: [], missed: [] };
  const dueHabits = actions.getDueHabits();
  const levelInfo = getSaintLevel(state.user.progress);
  const nextLevel = SAINT_LEVELS.find(l => l.minProgress > state.user.progress) || SAINT_LEVELS[SAINT_LEVELS.length - 1];
  
  const completionPct = dueHabits.length > 0 ? Math.round((todayLog.completed.length / dueHabits.length) * 100) : 0;

  const getMood = (pct) => {
    if (pct === 100) return 4;
    if (pct >= 80) return 3;
    if (pct >= 50) return 2;
    if (pct >= 20) return 1;
    return 0;
  };
  const currentMood = getMood(completionPct);
  const moods = ['😫', '😟', '', '🙂', '🤩'];

  if (state.settings.isPaused) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2 className="gold-text" style={{ fontSize: '24px', marginBottom: '16px' }}>⏸️ Journey Paused</h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
          {state.settings.pauseReason || 'Taking a break from discipline'}
        </p>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Your progress is preserved. Return when ready.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '20px' }}>Habit Quest</h2>
      
      {state.settings.restDayActive && (
        <div className="card" style={{ borderColor: '#FFD700', background: 'rgba(255,215,0,0.1)' }}>
          <h3 style={{ color: '#FFD700', fontSize: '14px' }}>🌙 Rest Day Active</h3>
          <p style={{ fontSize: '12px', color: '#888' }}>Habits won't affect your progress today</p>
        </div>      )}

      <Avatar xp={state.user.xp} inventory={state.user.inventory} />
      <ChakraWheel completionPct={completionPct} />
      <Environment progress={state.user.progress} missedDays={state.settings.consecutiveMisses} />
      
      <div className="card">
        <h3 style={{fontSize: '16px'}}>Liberation Meter</h3>
        <p>Level: <span className="gold-text">{levelInfo.name}</span></p>
        <p>Shop XP: <span className="gold-text">{state.user.xp}</span></p>
        <p>Discipline: <span className="gold-text">{Math.round(state.user.progress)}%</span></p>
        
        <div className="mood-container">
          {moods.map((mood, i) => (
            <span key={i} className={`mood-item ${i === currentMood ? 'active' : ''}`}>{mood}</span>
          ))}
        </div>
        <p style={{textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '8px'}}>
          Today's Completion: {completionPct}% ({todayLog.completed.length}/{dueHabits.length})
        </p>

        {state.user.progress < 95 && <ProgressBar current={state.user.progress} max={nextLevel.minProgress} label={`Progress to ${nextLevel.name}`} />}
        {state.user.isLiberated && <h3 className="gold-text pulse" style={{textAlign: 'center', marginTop: '16px'}}> LIBERATION ACHIEVED 🌟</h3>}
      </div>

      {state.settings.currentPunishment && (
        <div className="card" style={{ borderColor: '#f44336' }}>
          <h3 style={{ color: '#f44336', fontSize: '16px' }}>⚠️ Discipline Punishment</h3>
          <p style={{fontSize: '13px'}}>You have neglected your path. Complete this to restore balance:</p>
          <h4 className="gold-text" style={{ marginTop: '8px' }}>{state.settings.currentPunishment}</h4>
          <button className="btn" onClick={actions.clearPunishment}>I Have Completed This Punishment</button>
        </div>
      )}

      <div className="card">
        <h3 style={{fontSize: '16px'}}>Today's Quests {dueHabits.length > 0 && <span style={{fontSize: '12px', color: '#888'}}>({dueHabits.length} due)</span>}</h3>
        {dueHabits.length === 0 ? (
          <p style={{fontSize: '13px', color: '#888'}}>No habits due today. Enjoy your rest! 🎉</p>
        ) : (
          dueHabits.map(habit => {
            const isDone = todayLog.completed.includes(habit.id);
            const isMissed = todayLog.missed.includes(habit.id);
            return (
              <div key={habit.id} className={`habit-item ${isDone ? 'completed' : isMissed ? 'missed' : ''}`}>
                <div>
                  <strong style={{fontSize: '14px'}}>{habit.name}</strong>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {habit.difficulty} • {habit.frequency} • {habit.xp} XP
                  </div>
                </div>                <div>
                  {!isDone && !isMissed && (
                    <>
                      <button className="btn" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={() => actions.completeHabit(habit.id)}>✓</button>
                      <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 12px', marginLeft: '8px', fontSize: '12px' }} onClick={() => actions.missHabit(habit.id)}>✗</button>
                    </>
                  )}
                  {isDone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#4caf50', fontSize: '12px' }}>✓ Done</span>
                      <button className="btn btn-outline" style={{ width: 'auto', padding: '4px 8px', fontSize: '10px' }} onClick={() => actions.undoHabit(habit.id)}>Undo</button>
                    </div>
                  )}
                  {isMissed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#f44336', fontSize: '12px' }}>✗ Missed</span>
                      <button className="btn btn-outline" style={{ width: 'auto', padding: '4px 8px', fontSize: '10px' }} onClick={() => actions.undoHabit(habit.id)}>Undo</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
