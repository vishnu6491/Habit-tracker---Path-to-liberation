import { SAINT_LEVELS } from '../data/constants';

export const getToday = () => new Date().toISOString().split('T')[0];

export const getSaintLevel = (progress) => {
  for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
    if (progress >= SAINT_LEVELS[i].minProgress) return SAINT_LEVELS[i];
  }
  return SAINT_LEVELS[0];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
