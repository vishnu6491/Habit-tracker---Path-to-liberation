import { useState, useEffect } from 'react';
import { loadState, saveState, exportData, importData, resetData } from '../services/storage';
import { getToday, generateId } from '../utils/helpers';
import { DIFFICULTY_TYPES, BUILT_IN_PUNISHMENTS, ACHIEVEMENTS, SAINT_LEVELS, SHOP_ITEMS, CHAKRA_THEMES, REST_DAY_COST } from '../data/constants';
import { scheduleHabitNotification, sendBrowserNotification } from '../services/notifications';

export const useApp = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
    applyTheme(state.settings.theme);
    evaluateAchievements();
    checkRestDayExpiry();
  }, [state]);

  const applyTheme = (themeId) => {
    const theme = CHAKRA_THEMES.find(t => t.id === themeId) || CHAKRA_THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--bg-dark', theme.bg);
  };

  const checkRestDayExpiry = () => {
    if (state.settings.restDayActive && state.settings.restDayExpiry) {
      const now = new Date();
      const expiry = new Date(state.settings.restDayExpiry);
      if (now > expiry) {
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, restDayActive: false, restDayExpiry: null }
        }));
      }
    }
  };

  const evaluateAchievements = () => {
    const newAchievements = [...state.user.achievements];
    let changed = false;
    ACHIEVEMENTS.forEach(ach => {
      if (!newAchievements.includes(ach.id) && ach.condition(state.user)) {
        newAchievements.push(ach.id);
        changed = true;
      }
    });
    if (changed) setState(prev => ({ ...prev, user: { ...prev.user, achievements: newAchievements } }));
  };

  const isHabitDueToday = (habit) => {    if (state.settings.isPaused || state.settings.restDayActive) return false;
    const today = new Date();
    const dayOfWeek = today.getDay();
    switch (habit.frequency) {
      case 'daily': return true;
      case 'weekly': return habit.selectedDays && habit.selectedDays.includes(dayOfWeek);
      case 'monthly': return today.getDate() === 1;
      case 'custom': return habit.selectedDays && habit.selectedDays.includes(dayOfWeek);
      default: return true;
    }
  };

  const getDueHabits = () => state.habits.filter(h => h.active && isHabitDueToday(h));

  const addHabit = (habit) => {
    const newHabit = { ...habit, id: generateId(), active: true, currentStreak: 0, frequency: habit.frequency || 'daily', selectedDays: habit.selectedDays || [] };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
    scheduleHabitNotification(newHabit);
  };

  const updateHabit = (id, updates) => setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h) }));
  const deleteHabit = (id) => setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  const toggleHabitArchive = (id) => setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === id ? { ...h, active: !h.active } : h) }));

  // FIXED: Progress is now calculated dynamically based on today's completion vs a baseline
  const calculateRealTimeProgress = (currentProgress, todayCompletionPct, baseProgress) => {
    // Base progress is what you had at the start of the day.
    // We add a temporary boost based on how well you are doing *today*.
    // Max boost for 100% completion is +0.5% (takes 30 days of 100% to gain 15% progress)
    const dailyGain = 0.5; 
    const factor = (todayCompletionPct - 50) / 50; // Range: -1 (0%) to +1 (100%)
    const tempGain = dailyGain * factor;
    return Math.max(0, Math.min(100, baseProgress + tempGain));
  };

  const getPunishmentThreshold = (level) => 50 + ((level - 1) * (40 / 6));

  const processEndOfDayLogic = (prev, todayLog, dueHabits) => {
    const totalDue = dueHabits.length;
    const completionPct = totalDue > 0 ? (todayLog.completed.length / totalDue) * 100 : 100;
    const threshold = getPunishmentThreshold(prev.user.level);

    let newConsecutiveMisses = { ...prev.settings.consecutiveMisses };
    let punishment = prev.settings.currentPunishment;
    let xpAdjustment = 0;

    dueHabits.forEach(habit => {
      const wasMissedToday = todayLog.missed.includes(habit.id);
      const wasCompletedToday = todayLog.completed.includes(habit.id);
      if (wasMissedToday && !wasCompletedToday) {
        newConsecutiveMisses[habit.id] = (newConsecutiveMisses[habit.id] || 0) + 1;
        if (newConsecutiveMisses[habit.id] >= 2) xpAdjustment -= habit.xp;
      } else if (wasCompletedToday) {
        newConsecutiveMisses[habit.id] = 0;
      }
    });

    if (completionPct < threshold && !punishment) {
      const pool = prev.settings.punishmentMode === 'custom' ? prev.settings.customPunishments : prev.settings.punishmentMode === 'both' ? [...BUILT_IN_PUNISHMENTS, ...prev.settings.customPunishments] : BUILT_IN_PUNISHMENTS;
      punishment = pool[Math.floor(Math.random() * pool.length)] || '20 Push-ups';
    }

    // Calculate new level based on the *temporary* real-time progress
    const realTimeProgress = calculateRealTimeProgress(prev.user.progress, completionPct, prev.user.baseProgress || prev.user.progress);
    
    let newLevel = 1;
    for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
      if (realTimeProgress >= SAINT_LEVELS[i].minProgress) {
        newLevel = SAINT_LEVELS[i].level;
        break;
      }
    }

    let newInventory = [...prev.user.inventory];
    const finalXp = prev.user.xp + xpAdjustment;
    newInventory = newInventory.filter(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      return item && finalXp >= item.cost;
    });

    return { newConsecutiveMisses, punishment, xpAdjustment, realTimeProgress, newLevel, newInventory, finalXp, completionPct };
  };

  const completeHabit = (habitId) => {
    const today = getToday();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    setState(prev => {
      const todayLog = prev.logs[today] || { completed: [], missed: [] };
      if (todayLog.completed.includes(habitId)) return prev;

      const newTodayLog = { 
        completed: [...todayLog.completed, habitId], 
        missed: todayLog.missed.filter(id => id !== habitId) 
      };
      
      const dueHabits = getDueHabits();
      const newHabits = prev.habits.map(h => {        if (h.id === habitId) {
          const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
          const wasDoneYesterday = prev.logs[yesterday.toISOString().split('T')[0]]?.completed.includes(habitId);
          return { ...h, currentStreak: wasDoneYesterday ? h.currentStreak + 1 : 1 };
        }
        return h;
      });

      const { newConsecutiveMisses, punishment, xpAdjustment, realTimeProgress, newLevel, newInventory, finalXp } = processEndOfDayLogic({ ...prev, habits: newHabits }, newTodayLog, dueHabits);

      const newUser = {
        ...prev.user,
        xp: finalXp + habit.xp,
        progress: realTimeProgress, // Update display progress
        baseProgress: prev.user.baseProgress || prev.user.progress, // Keep base for calculation
        level: newLevel,
        totalCompleted: prev.user.totalCompleted + 1,
        inventory: newInventory
      };

      if (newLevel > prev.user.level && !prev.user.templeRecords.milestones[SAINT_LEVELS.find(l=>l.level===newLevel).name]) {
        newUser.templeRecords.milestones[SAINT_LEVELS.find(l=>l.level===newLevel).name] = today;
        newUser.baseProgress = realTimeProgress; // Lock in progress on level up
      }

      return { ...prev, habits: newHabits, logs: { ...prev.logs, [today]: newTodayLog }, user: newUser, settings: { ...prev.settings, consecutiveMisses: newConsecutiveMisses, currentPunishment: punishment } };
    });
    sendBrowserNotification('Habit Completed!', `+${habit.xp} XP earned.`);
  };

  const missHabit = (habitId) => {
    const today = getToday();
    setState(prev => {
      const todayLog = prev.logs[today] || { completed: [], missed: [] };
      if (todayLog.missed.includes(habitId)) return prev;

      const newTodayLog = { 
        completed: todayLog.completed.filter(id => id !== habitId), 
        missed: [...todayLog.missed, habitId] 
      };
      
      const dueHabits = getDueHabits();
      const { newConsecutiveMisses, punishment, xpAdjustment, realTimeProgress, newLevel, newInventory, finalXp } = processEndOfDayLogic(prev, newTodayLog, dueHabits);

      return {
        ...prev,
        logs: { ...prev.logs, [today]: newTodayLog },
        user: { ...prev.user, xp: finalXp, progress: realTimeProgress, baseProgress: prev.user.baseProgress || prev.user.progress, level: newLevel, inventory: newInventory },
        settings: { ...prev.settings, consecutiveMisses: newConsecutiveMisses, currentPunishment: punishment }
      };    });
  };

  // FIXED: Undo now correctly reverses XP and recalculates progress
  const undoHabit = (habitId) => {
    const today = getToday();
    setState(prev => {
      const todayLog = prev.logs[today];
      if (!todayLog) return prev;
      
      const wasCompleted = todayLog.completed.includes(habitId);
      const wasMissed = todayLog.missed.includes(habitId);
      
      if (!wasCompleted && !wasMissed) return prev;

      const newTodayLog = {
        completed: todayLog.completed.filter(id => id !== habitId),
        missed: todayLog.missed.filter(id => id !== habitId)
      };

      const dueHabits = getDueHabits();
      const habit = prev.habits.find(h => h.id === habitId);
      
      // Recalculate logic for the undone state
      const { newConsecutiveMisses, punishment, realTimeProgress, newLevel } = processEndOfDayLogic(prev, newTodayLog, dueHabits);

      let xpReversal = 0;
      if (wasCompleted) xpReversal = -habit.xp;

      return {
        ...prev,
        logs: { ...prev.logs, [today]: newTodayLog },
        user: {
          ...prev.user,
          xp: Math.max(0, prev.user.xp + xpReversal),
          progress: realTimeProgress,
          level: newLevel
        },
        settings: { ...prev.settings, consecutiveMisses: newConsecutiveMisses, currentPunishment: punishment }
      };
    });
  };

  const activateRestDay = () => {
    if (state.user.xp < REST_DAY_COST) return;
    const expiry = new Date(); expiry.setHours(23, 59, 59, 999);
    setState(prev => ({ ...prev, user: { ...prev.user, xp: prev.user.xp - REST_DAY_COST }, settings: { ...prev.settings, restDayActive: true, restDayExpiry: expiry.toISOString() } }));
  };

  const togglePause = (isPaused, reason) => setState(prev => ({ ...prev, settings: { ...prev.settings, isPaused, pauseReason: isPaused ? reason : '' } }));  const addCustomPunishment = (text) => setState(prev => ({ ...prev, settings: { ...prev.settings, customPunishments: [...prev.settings.customPunishments, text] } }));
  const removeCustomPunishment = (text) => setState(prev => ({ ...prev, settings: { ...prev.settings, customPunishments: prev.settings.customPunishments.filter(p => p !== text) } }));
  
  const buyItem = (item) => {
    if (state.user.xp >= item.cost && !state.user.inventory.includes(item.id)) {
      setState(prev => ({ ...prev, user: { ...prev.user, xp: prev.user.xp - item.cost, inventory: [...prev.user.inventory, item.id] } }));
    }
  };

  const updateSettings = (updates) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
    if (updates.theme) applyTheme(updates.theme);
  };

  const clearPunishment = () => setState(prev => ({ ...prev, settings: { ...prev.settings, currentPunishment: null } }));

  const actions = {
    addHabit, updateHabit, deleteHabit, toggleHabitArchive,
    completeHabit, missHabit, undoHabit,
    activateRestDay, togglePause,
    addCustomPunishment, removeCustomPunishment,
    buyItem, updateSettings, clearPunishment,
    exportData: () => exportData(state),
    importData: (file) => importData(file, (data) => setState(data)),
    resetData: () => resetData(),
    getDueHabits
  };

  return { state, actions };
};
