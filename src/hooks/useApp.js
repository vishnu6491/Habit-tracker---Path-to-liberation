import { useState, useEffect } from 'react';
import { loadState, saveState, exportData, importData, resetData } from '../services/storage';
import { getToday, generateId, isHabitDueOnDate, calculateStreakForHabit } from '../utils/helpers';
import { DIFFICULTY_TYPES, BUILT_IN_PUNISHMENTS, ACHIEVEMENTS, SAINT_LEVELS, SHOP_ITEMS, CHAKRA_THEMES, REST_DAY_COST } from '../data/constants';
import { scheduleHabitNotification, sendBrowserNotification } from '../services/notifications';

export const useApp = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
    applyTheme(state.settings.theme);
    evaluateAchievements();
    checkRestDayExpiry();
    checkDayRollover();
  }, [state]);

  const applyTheme = (themeId) => {
    const theme = CHAKRA_THEMES.find(t => t.id === themeId) || CHAKRA_THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--bg-dark', theme.bg);
  };

  const checkDayRollover = () => {
    const today = getToday();
    if (state.user.lastProgressDate !== today) {
      const newProgress = Math.min(100, Math.max(0, state.user.progress + (state.user.pendingDailyGain || 0)));
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          progress: newProgress,
          pendingDailyGain: 0,
          lastProgressDate: today
        }
      }));
    }
  };

  const checkRestDayExpiry = () => {
    if (state.settings.restDayActive && state.settings.restDayExpiry) {
      const now = new Date();
      const expiry = new Date(state.settings.restDayExpiry);
      if (now > expiry) {
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, restDayActive: false, restDayExpiry: null }
        }));      }
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

  const isHabitDueToday = (habit) => {
    if (state.settings.isPaused || state.settings.restDayActive) return false;
    return isHabitDueOnDate(habit, new Date());
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

  const getPunishmentThreshold = (level) => 50 + ((level - 1) * (30 / 6));

  const checkConsecutiveMisses = (habitId, logs) => {
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const todayLog = logs[today];
    const yesterdayLog = logs[yesterdayStr];
    
    const missedToday = todayLog && todayLog.missed.includes(habitId);
    const missedYesterday = yesterdayLog && yesterdayLog.missed.includes(habitId);
    
    if (missedToday && missedYesterday) {
      let consecutiveCount = 2;
      let checkDate = new Date(yesterday);      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = checkDate.toISOString().split('T')[0];
        const checkLog = logs[checkStr];
        if (checkLog && checkLog.missed.includes(habitId)) {
          consecutiveCount++;
        } else { break; }
      }
      return consecutiveCount;
    }
    return 0;
  };

  const recalculateState = (prev) => {
    const today = getToday();
    const todayLog = prev.logs[today] || { completed: [], missed: [] };
    const dueHabits = prev.habits.filter(h => h.active && isHabitDueOnDate(h, new Date()));
    const totalDue = dueHabits.length;
    const completionPct = totalDue > 0 ? (todayLog.completed.length / totalDue) * 100 : 100;
    const threshold = getPunishmentThreshold(prev.user.level);
    
    let dashboardPunishment = prev.settings.dashboardPunishment;
    if (completionPct < threshold) {
      if (!dashboardPunishment) {
        const pool = prev.settings.punishmentMode === 'custom' ? prev.settings.customPunishments : prev.settings.punishmentMode === 'both' ? [...BUILT_IN_PUNISHMENTS, ...prev.settings.customPunishments] : BUILT_IN_PUNISHMENTS;
        dashboardPunishment = pool[Math.floor(Math.random() * pool.length)] || '20 Push-ups';
      }
    } else {
      dashboardPunishment = null; 
    }
    
    const consecutiveMissMap = {};
    dueHabits.forEach(habit => {
      const count = checkConsecutiveMisses(habit.id, prev.logs);
      if (count >= 2) consecutiveMissMap[habit.id] = count;
    });
    
    let totalXP = 0;
    let totalCompleted = 0;
    Object.values(prev.logs).forEach(log => {
      log.completed.forEach(habitId => {
        const habit = prev.habits.find(h => h.id === habitId);
        if (habit) { totalXP += habit.xp; totalCompleted++; }
      });
    });
    
    const recalculatedHabits = prev.habits.map(habit => ({
      ...habit,
      currentStreak: calculateStreakForHabit(habit.id, prev.logs)
    }));
    // FIXED PROGRESSION MATH:
    // 1. Max gain at Level 1 is 3.0%. At Level 7 it is 0.5%.
    const startOfDayLevel = prev.user.level; 
    const maxDailyGain = Math.max(0.5, 3.0 - ((startOfDayLevel - 1) * 0.4));
    
    // 2. Calculate factor based on completion. 
    // 100% completion = 1.0 factor (Max gain).
    // 80% completion = 0.8 factor.
    // 50% completion = 0 factor (No gain).
    // <50% = Negative factor (Loss).
    let factor = completionPct / 100;
    if (completionPct < 50) {
      factor = (completionPct - 50) / 50; // Range: -1 to 0
    }
    
    const newPendingGain = maxDailyGain * factor;
    const displayProgress = Math.min(100, Math.max(0, prev.user.progress + newPendingGain));
    
    let newLevel = 1;
    for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
      if (displayProgress >= SAINT_LEVELS[i].minProgress) {
        newLevel = SAINT_LEVELS[i].level;
        break;
      }
    }

    let newInventory = [...prev.user.inventory];
    newInventory = newInventory.filter(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      return item && totalXP >= item.cost;
    });
    
    return {
      dashboardPunishment,
      consecutiveMissMap,
      totalXP,
      totalCompleted,
      recalculatedHabits,
      completionPct,
      displayProgress,
      newPendingGain,
      newLevel,
      newInventory
    };
  };

  const completeHabit = (habitId) => {
    const today = getToday();
    const habit = state.habits.find(h => h.id === habitId);    if (!habit) return;

    setState(prev => {
      const todayLog = prev.logs[today] || { completed: [], missed: [] };
      if (todayLog.completed.includes(habitId)) return prev;

      const newTodayLog = { completed: [...todayLog.completed, habitId], missed: todayLog.missed.filter(id => id !== habitId) };
      const newLogs = { ...prev.logs, [today]: newTodayLog };
      const recalculated = recalculateState({ ...prev, logs: newLogs });

      return { 
        ...prev, 
        habits: recalculated.recalculatedHabits,
        logs: newLogs, 
        user: {
          ...prev.user,
          xp: recalculated.totalXP,
          totalCompleted: recalculated.totalCompleted,
          pendingDailyGain: recalculated.newPendingGain,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap } 
      };
    });
    sendBrowserNotification('Habit Completed!', `+${habit.xp} XP earned.`);
  };

  const missHabit = (habitId) => {
    const today = getToday();
    setState(prev => {
      const todayLog = prev.logs[today] || { completed: [], missed: [] };
      if (todayLog.missed.includes(habitId)) return prev;

      const newTodayLog = { completed: todayLog.completed.filter(id => id !== habitId), missed: [...todayLog.missed, habitId] };
      const newLogs = { ...prev.logs, [today]: newTodayLog };
      const recalculated = recalculateState({ ...prev, logs: newLogs });

      return {
        ...prev,
        habits: recalculated.recalculatedHabits,
        logs: newLogs,
        user: { 
          ...prev.user, 
          xp: recalculated.totalXP, 
          totalCompleted: recalculated.totalCompleted,
          pendingDailyGain: recalculated.newPendingGain,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap }
      };
    });
  };

  const undoHabit = (habitId) => {
    const today = getToday();
    setState(prev => {
      const todayLog = prev.logs[today];
      if (!todayLog) return prev;
      
      const wasCompleted = todayLog.completed.includes(habitId);
      const wasMissed = todayLog.missed.includes(habitId);
      if (!wasCompleted && !wasMissed) return prev;

      const newTodayLog = { completed: todayLog.completed.filter(id => id !== habitId), missed: todayLog.missed.filter(id => id !== habitId) };
      const newLogs = { ...prev.logs, [today]: newTodayLog };
      const recalculated = recalculateState({ ...prev, logs: newLogs });

      return {
        ...prev,
        habits: recalculated.recalculatedHabits,
        logs: newLogs,
        user: {
          ...prev.user,
          xp: Math.max(0, recalculated.totalXP),
          totalCompleted: recalculated.totalCompleted,
          pendingDailyGain: recalculated.newPendingGain,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap }
      };
    });
  };

  const activateRestDay = () => {
    if (state.user.xp < REST_DAY_COST) return;
    const expiry = new Date(); expiry.setHours(23, 59, 59, 999);
    setState(prev => ({ ...prev, user: { ...prev.user, xp: prev.user.xp - REST_DAY_COST }, settings: { ...prev.settings, restDayActive: true, restDayExpiry: expiry.toISOString() } }));
  };

  const togglePause = (isPaused, reason) => setState(prev => ({ ...prev, settings: { ...prev.settings, isPaused, pauseReason: isPaused ? reason : '' } }));
  const addCustomPunishment = (text) => setState(prev => ({ ...prev, settings: { ...prev.settings, customPunishments: [...prev.settings.customPunishments, text] } }));
  const removeCustomPunishment = (text) => setState(prev => ({ ...prev, settings: { ...prev.settings, customPunishments: prev.settings.customPunishments.filter(p => p !== text) } }));
  
  const buyItem = (item) => {
    if (state.user.xp >= item.cost && !state.user.inventory.includes(item.id)) {
      setState(prev => ({ ...prev, user: { ...prev.user, xp: prev.user.xp - item.cost, inventory: [...prev.user.inventory, item.id] } }));
    }  };

  const updateSettings = (updates) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
    if (updates.theme) applyTheme(updates.theme);
  };

  const clearPunishment = () => setState(prev => ({ ...prev, settings: { ...prev.settings, dashboardPunishment: null } }));

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
