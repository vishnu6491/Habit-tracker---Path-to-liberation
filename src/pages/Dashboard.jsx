import React from 'react';
import { getToday, getSaintLevel, calculateStreak, checkLiberation } from '../utils/helpers';
import { SAINT_LEVELS } from '../data/constants';
import Avatar from '../components/Avatar';
import Environment from '../components/Environment';
import ProgressBar from '../components/ProgressBar';

const Dashboard = ({ state, actions }) => {
  const today = getToday();
  const todayLog = state.logs[today] || { completedHabits: [], missedHabits: [] };
  const activeHabits = state.habits.filter(h => h.active);
  const streak = calculateStreak(state.logs);
  const levelInfo = getSaintLevel(state.user.xp);
  const nextLevel = state.user.xp >= 15000 ? null : state.user.xp >= 10000 ? SAINT_LEVELS[6] : SAINT_LEVELS.find(l => l.minXp > state.user.xp) || SAINT_LEVELS[6];
  const isLiberated = checkLiberation(state);

  return (
  <div>
    <h1>Dashboard Debug</h1>
    <p>Today: {today}</p>
    <p>XP: {state.user.xp}</p>
    <p>Level: {levelInfo?.name}</p>
    <p>Streak: {streak}</p>
    <p>Liberated: {String(isLiberated)}</p>
  </div>
 );
};

export default Dashboard;
