import { SAINT_LEVELS } from '../data/constants';

export const getToday = () => new Date().toISOString().split('T')[0];

export const getSaintLevel = (level) => {
  const levelNum = typeof level === 'number' ? level : 1;
  for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
    if (levelNum >= SAINT_LEVELS[i].level) return SAINT_LEVELS[i];
  }
  return SAINT_LEVELS[0];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const isHabitDueOnDate = (habit, date) => {
  const dayOfWeek = date.getDay();
  
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return habit.selectedDays && habit.selectedDays.includes(dayOfWeek);
    case 'monthly':
      return date.getDate() === 1;
    case 'custom':
      return habit.selectedDays && habit.selectedDays.includes(dayOfWeek);
    default:
      return true;
  }
};

// NEW: Calculate streak for a specific habit from logs
export const calculateStreakForHabit = (habitId, logs) => {
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && log.completed.includes(habitId)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};
