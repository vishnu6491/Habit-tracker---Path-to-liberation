import { SAINT_LEVELS } from '../data/constants';

export const getToday = () => new Date().toISOString().split('T')[0];

export const getSaintLevel = (progress) => {
  for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
    if (progress >= SAINT_LEVELS[i].minProgress) return SAINT_LEVELS[i];
  }
  return SAINT_LEVELS[0];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

// NEW: Check if a habit was due on a specific date
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
