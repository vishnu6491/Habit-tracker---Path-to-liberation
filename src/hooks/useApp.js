import { useState, useEffect } from 'react';
import { loadState, saveState, exportData, importData, resetData } from '../services/storage';
import { getToday, generateId, isHabitDueOnDate, calculateStreakForHabit } from '../utils/helpers';
import { BUILT_IN_PUNISHMENTS, ACHIEVEMENTS, SAINT_LEVELS, SHOP_ITEMS, CHAKRA_THEMES, REST_DAY_COST } from '../data/constants';
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
      const newPoints = state.user.levelPoints + (state.user.pendingLevelPoints || 0);
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          levelPoints: newPoints,
          pendingLevelPoints: 0,
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

  const getPunishmentThreshold = (level) => 50 + ((level - 1) * 5);

  const checkConsecutiveMisses = (habitId, logs) => {
    const today = getToday();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayLog = logs[today];
    const yesterdayLog = logs[yesterdayStr];
    const missedToday = todayLog && todayLog.missed.includes(habitId);
    const missedYesterday = yesterdayLog && yesterdayLog.missed.includes(habitId);
    if (missedToday && missedYesterday) {
      let count = 2;
      let checkDate = new Date(yesterday);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (logs[checkStr] && logs[checkStr].missed.includes(habitId)) count++;        else break;
      }
      return count;
    }
    return 0;
  };

  const calculateLifetimeDiscipline = (logs, habits) => {
    let totalDue = 0;
    let totalCompleted = 0;
    const dates = Object.keys(logs).sort();
    
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const log = logs[dateStr];
      const dueOnDay = habits.filter(h => h.active && isHabitDueOnDate(h, date));
      
      dueOnDay.forEach(habit => {
        totalDue++;
        if (log.completed.includes(habit.id)) {
          totalCompleted++;
        }
      });
    });
    
    return totalDue > 0 ? (totalCompleted / totalDue) * 100 : 0;
  };

  const calculateDailyPoints = (completionPct, level) => {
    const maxPoints = Math.max(0.5, 4.0 - ((level - 1) * 0.5));
    const negThreshold = 50 + ((level - 1) * 5);

    if (completionPct >= negThreshold) {
      return maxPoints * (completionPct / 100);
    } else {
      return maxPoints * ((completionPct - negThreshold) / negThreshold);
    }
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
      if (!dashboardPunishment) {        const pool = prev.settings.punishmentMode === 'custom' ? prev.settings.customPunishments : prev.settings.punishmentMode === 'both' ? [...BUILT_IN_PUNISHMENTS, ...prev.settings.customPunishments] : BUILT_IN_PUNISHMENTS;
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

    const lifetimeDiscipline = calculateLifetimeDiscipline(prev.logs, prev.habits);
    const pendingLevelPoints = calculateDailyPoints(completionPct, prev.user.level);
    const displayLevelPoints = prev.user.levelPoints + pendingLevelPoints;

    let newLevel = 1;
    for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
      if (displayLevelPoints >= (i * 100)) { 
        newLevel = i + 1;
        break;
      }
    }
    newLevel = Math.min(7, newLevel);

    let newInventory = [...prev.user.inventory];
    newInventory = newInventory.filter(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      return item && totalXP >= item.cost;
    });
    
    return {
      dashboardPunishment,
      consecutiveMissMap,
      totalXP,      totalCompleted,
      recalculatedHabits,
      completionPct,
      lifetimeDiscipline,
      pendingLevelPoints,
      displayLevelPoints,
      newLevel,
      newInventory
    };
  };

  const completeHabit = (habitId) => {
    const today = getToday();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

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
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          pendingLevelPoints: recalculated.pendingLevelPoints,
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

      const newTodayLog = { completed: todayLog.completed.filter(id => id !== habitId), missed: [...todayLog.missed, habitId] };      const newLogs = { ...prev.logs, [today]: newTodayLog };
      const recalculated = recalculateState({ ...prev, logs: newLogs });

      return {
        ...prev,
        habits: recalculated.recalculatedHabits,
        logs: newLogs,
        user: { 
          ...prev.user, 
          xp: recalculated.totalXP, 
          totalCompleted: recalculated.totalCompleted,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          pendingLevelPoints: recalculated.pendingLevelPoints,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap }
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
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          pendingLevelPoints: recalculated.pendingLevelPoints,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap }
      };    });
  };

  const updateLogsForDate = (dateStr, completed, missed) => {
    setState(prev => {
      const newLogs = {
        ...prev.logs,
        [dateStr]: { completed, missed }
      };
      
      const recalculated = recalculateState({ ...prev, logs: newLogs });
      
      return {
        ...prev,
        logs: newLogs,
        habits: recalculated.recalculatedHabits,
        user: {
          ...prev.user,
          xp: recalculated.totalXP,
          totalCompleted: recalculated.totalCompleted,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          levelPoints: prev.user.levelPoints,
          pendingLevelPoints: recalculated.pendingLevelPoints,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { 
          ...prev.settings, 
          dashboardPunishment: recalculated.dashboardPunishment, 
          consecutiveMissMap: recalculated.consecutiveMissMap 
        }
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
    }
  };
  const updateSettings = (updates) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
    if (updates.theme) applyTheme(updates.theme);
  };

  const clearPunishment = () => setState(prev => ({ ...prev, settings: { ...prev.settings, dashboardPunishment: null } }));

  const actions = {
    addHabit, updateHabit, deleteHabit, toggleHabitArchive,
    completeHabit, missHabit, undoHabit,
    updateLogsForDate,
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
