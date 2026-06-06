import { SAINT_LEVELS, MASTERY_QUESTS } from '../data/constants';
export const getToday = () => new Date().toISOString().split('T')[0];

export const calculateStreak = (logs) => {
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && log.completedHabits && log.completedHabits.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const calculateLongestStreak = (logs) => {
  let maxStreak = 0;
  let currentStreak = 0;
  const dates = Object.keys(logs).sort();
  
  for (let i = 0; i < dates.length; i++) {
    const log = logs[dates[i]];
    if (log && log.completedHabits && log.completedHabits.length > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
};

export const getSaintLevel = (xp) => {
  for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= SAINT_LEVELS[i].minXp) return SAINT_LEVELS[i];
  }
  return SAINT_LEVELS[0];
};

export const checkLiberation = (state) => {
  const { xp, longestStreak, karma, masteryQuests, trialCompleted, logs } = state;
  if (xp < 15000) return false;
  if (longestStreak < 90) return false;
  if (karma <= 0) return false;
  
  const allMastery = MASTERY_QUESTS.every(q => {
    const quest = masteryQuests.find(mq => mq.id === q.id);
    return quest && quest.progress >= q.target;
  });
  if (!allMastery) return false;
  if (!trialCompleted) return false;

  const dates = Object.keys(logs).sort();
  const last365 = dates.slice(-365);
  if (last365.length < 365) return false;
  
  let totalPossible = 0;
  let totalCompleted = 0;
  last365.forEach(date => {
    const log = logs[date];
    if (log) {
      totalCompleted += log.completedHabits.length;
      totalPossible += (log.completedHabits.length + (log.missedHabits?.length || 0));
    }
  });
  
  return totalPossible > 0 && (totalCompleted / totalPossible) >= 0.8;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
