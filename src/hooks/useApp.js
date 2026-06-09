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
        setState(prev => ({ ...prev, settings: { ...prev.settings, restDayActive: false, restDayExpiry: null } }));
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

  const getPunishmentThreshold = (level) => Math.min(80, 50 + ((level - 1) * 5)); // 50% to 80%

  const checkConsecutiveMisses = (habitId, logs) => {
    const today = getToday();
    const todayLog = logs[today];
    
    // Check if habit was missed today
    const missedToday = todayLog && todayLog.missed.includes(habitId);
    
    if (!missedToday) return 0;
    
    // Check if habit was also missed yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayLog = logs[yesterdayStr];
    const missedYesterday = yesterdayLog && yesterdayLog.missed.includes(habitId);
    
    if (missedYesterday) {
      // Count consecutive misses including today
      let count = 2;
      let checkDate = new Date(yesterday);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = checkDate.toISOString().split('T')[0];
        if (logs[checkStr] && logs[checkStr].missed.includes(habitId)) count++;
        else break;
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
        if (log.completed.includes(habit.id)) totalCompleted++;
      });
    });    return totalDue > 0 ? (totalCompleted / totalDue) * 100 : 0;
  };

  const calculateDailyPoints = (completionPct, level) => {
    const maxPoints = Math.max(0.5, 4.0 - ((level - 1) * 0.5));
    const negThreshold = getPunishmentThreshold(level);
    if (completionPct >= negThreshold) {
      return maxPoints * (completionPct / 100);
    } else {
      return maxPoints * ((completionPct - negThreshold) / negThreshold);
    }
  };

  // COMPLETE REWRITE OF RECALCULATE STATE
  const recalculateState = (prev) => {
    let totalXP = 0;
    let totalCompletedCount = 0;
    let totalLevelPoints = 0;
    let lifetimeTotalDue = 0;
    let lifetimeTotalCompleted = 0;
    const today = getToday();
    const todayLog = prev.logs[today] || { completed: [], missed: [] };
    const dueHabitsToday = prev.habits.filter(h => h.active && isHabitDueOnDate(h, new Date()));
    const todayCompletionPct = dueHabitsToday.length > 0 ? (todayLog.completed.length / dueHabitsToday.length) * 100 : 100;

    // 1. Iterate through ALL logs to calculate lifetime stats and total level points
    Object.keys(prev.logs).forEach(dateStr => {
      const log = prev.logs[dateStr];
      const dateObj = new Date(dateStr);
      const dueOnDay = prev.habits.filter(h => h.active && isHabitDueOnDate(h, dateObj));
      
      dueOnDay.forEach(habit => {
        lifetimeTotalDue++;
        if (log.completed.includes(habit.id)) {
          lifetimeTotalCompleted++;
          totalXP += habit.xp;
          totalCompletedCount++;
        }
      });

      const dayPct = dueOnDay.length > 0 ? (log.completed.length / dueOnDay.length) * 100 : 100;
      // Use level 1 for historical points calculation to keep it consistent, or current level. 
      // Let's use current level for simplicity as requested.
      totalLevelPoints += calculateDailyPoints(dayPct, prev.user.level);
    });

    const lifetimeDiscipline = lifetimeTotalDue > 0 ? (lifetimeTotalCompleted / lifetimeTotalDue) * 100 : 0;

    // 2. Calculate Level based on Total Points
    let newLevel = 1;    for (let i = SAINT_LEVELS.length - 1; i >= 0; i--) {
      if (totalLevelPoints >= (i * 100)) { 
        newLevel = i + 1;
        break;
      }
    }
    newLevel = Math.min(7, newLevel);

    const pointsForCurrentLevel = totalLevelPoints - ((newLevel - 1) * 100);

    // 3. Punishment Logic (Dashboard)
    let dashboardPunishment = prev.settings.dashboardPunishment;
    const threshold = getPunishmentThreshold(newLevel);
    if (todayCompletionPct < threshold) {
      if (!dashboardPunishment) {
        const pool = prev.settings.punishmentMode === 'custom' ? prev.settings.customPunishments : prev.settings.punishmentMode === 'both' ? [...BUILT_IN_PUNISHMENTS, ...prev.settings.customPunishments] : BUILT_IN_PUNISHMENTS;
        dashboardPunishment = pool[Math.floor(Math.random() * pool.length)] || '20 Push-ups';
      }
    } else {
      dashboardPunishment = null; 
    }

    // 4. Consecutive Misses Logic (Calendar)
    const consecutiveMissMap = {};
    dueHabitsToday.forEach(habit => {
      const count = checkConsecutiveMisses(habit.id, prev.logs, new Date());
      if (count >= 2) consecutiveMissMap[habit.id] = count;
    });

    // 5. Inventory Check
    let newInventory = [...prev.user.inventory];
    newInventory = newInventory.filter(itemId => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      return item && totalXP >= item.cost;
    });

    const recalculatedHabits = prev.habits.map(habit => ({
      ...habit,
      currentStreak: calculateStreakForHabit(habit.id, prev.logs)
    }));

    return {
      dashboardPunishment,
      consecutiveMissMap,
      totalXP,
      totalCompletedCount,
      recalculatedHabits,
      todayCompletionPct,
      lifetimeDiscipline,
      totalLevelPoints,      pointsForCurrentLevel,
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
          totalCompleted: recalculated.totalCompletedCount,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          levelPoints: recalculated.totalLevelPoints,
          pointsForCurrentLevel: recalculated.pointsForCurrentLevel,
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

      return {        ...prev,
        habits: recalculated.recalculatedHabits,
        logs: newLogs,
        user: { 
          ...prev.user, 
          xp: recalculated.totalXP, 
          totalCompleted: recalculated.totalCompletedCount,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          levelPoints: recalculated.totalLevelPoints,
          pointsForCurrentLevel: recalculated.pointsForCurrentLevel,
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
          totalCompleted: recalculated.totalCompletedCount,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          levelPoints: recalculated.totalLevelPoints,
          pointsForCurrentLevel: recalculated.pointsForCurrentLevel,
          level: recalculated.newLevel,
          inventory: recalculated.newInventory
        },
        settings: { ...prev.settings, dashboardPunishment: recalculated.dashboardPunishment, consecutiveMissMap: recalculated.consecutiveMissMap }
      };
    });
  };
  const updateLogsForDate = (dateStr, completed, missed) => {
    setState(prev => {
      const newLogs = { ...prev.logs, [dateStr]: { completed, missed } };
      const recalculated = recalculateState({ ...prev, logs: newLogs });
      
      return {
        ...prev,
        logs: newLogs,
        habits: recalculated.recalculatedHabits,
        user: {
          ...prev.user,
          xp: recalculated.totalXP,
          totalCompleted: recalculated.totalCompletedCount,
          lifetimeDiscipline: recalculated.lifetimeDiscipline,
          levelPoints: recalculated.totalLevelPoints,
          pointsForCurrentLevel: recalculated.pointsForCurrentLevel,
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
