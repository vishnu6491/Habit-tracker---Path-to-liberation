import { useState, useEffect } from 'react';
import { loadState, saveState, exportData, importData, resetData } from '../services/storage';
import { getToday, calculateStreak, calculateLongestStreak, getSaintLevel, checkLiberation, generateId } from '../utils/helpers';
import { DIFFICULTY_XP, BUILT_IN_PUNISHMENTS, ACHIEVEMENTS, MASTERY_QUESTS } from '../data/constants';
import { scheduleHabitNotification, sendBrowserNotification } from '../services/notifications';

export const useApp = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
    evaluateAchievements();
  }, [state]);

  const evaluateAchievements = () => {
    const newAchievements = [...state.user.achievements];
    let changed = false;
    ACHIEVEMENTS.forEach(ach => {
      if (!newAchievements.includes(ach.id) && ach.condition(state.user)) {
        newAchievements.push(ach.id);
        changed = true;
        if (ach.id === 'liberation') {
          setState(prev => ({ ...prev, user: { ...prev.user, isLiberated: true } }));
        }
      }
    });
    if (changed) {
      setState(prev => ({ ...prev, user: { ...prev.user, achievements: newAchievements } }));
    }
  };

  const addHabit = (habit) => {
    const newHabit = { ...habit, id: generateId(), active: true };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
    scheduleHabitNotification(newHabit);
  };

  const updateHabit = (id, updates) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  };

  const deleteHabit = (id) => {
    setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  };

  const toggleHabitArchive = (id) => {
    setState(prev => ({      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, active: !h.active } : h)
    }));
  };

  const completeHabit = (habitId) => {
    const today = getToday();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const xpGain = DIFFICULTY_XP[habit.difficulty] || 10;
    const isPerfectDay = checkPerfectDay(today, habitId, true);

    setState(prev => {
      const todayLog = prev.logs[today] || { completedHabits: [], missedHabits: [], xpEarned: 0 };
      const newCompleted = [...todayLog.completedHabits, habitId];
      
      let bonusXp = 0;
      if (isPerfectDay) bonusXp += 50;

      const newUser = {
        ...prev.user,
        xp: prev.user.xp + xpGain + bonusXp,
        karma: prev.user.karma + 1,
        totalCompleted: prev.user.totalCompleted + 1,
        settings: { ...prev.settings, missedDaysStreak: 0, currentPunishment: null }
      };

      const newLogs = {
        ...prev.logs,
        [today]: { ...todayLog, completedHabits: newCompleted, xpEarned: todayLog.xpEarned + xpGain + bonusXp }
      };

      const streak = calculateStreak(newLogs);
      newUser.longestStreak = Math.max(newUser.longestStreak, streak);

      if (habit.category) {
        const catLower = habit.category.toLowerCase();
        const qIndex = newUser.masteryQuests.findIndex(q => q.id === catLower);
        if (qIndex !== -1) {
          newUser.masteryQuests[qIndex].progress += 1;
        }
      }

      const levelInfo = getSaintLevel(newUser.xp);
      if (levelInfo.level > prev.user.level && !prev.user.templeRecords.milestones[levelInfo.name]) {
        newUser.templeRecords.milestones[levelInfo.name] = today;
      }

      return { ...prev, logs: newLogs, user: newUser };    });

    sendBrowserNotification('Habit Completed!', `+${xpGain} XP earned for ${habit.name}`);
  };

  const missHabit = (habitId) => {
    const today = getToday();
    setState(prev => {
      const todayLog = prev.logs[today] || { completedHabits: [], missedHabits: [], xpEarned: 0 };
      const newMissed = [...todayLog.missedHabits, habitId];
      
      const newMissedStreak = (prev.settings?.missedDaysStreak || 0) + 1;
      let punishment = prev.settings?.currentPunishment;
      
      if (newMissedStreak >= 2 && !punishment) {
        const pool = prev.settings.punishmentMode === 'custom' 
          ? prev.settings.customPunishments 
          : prev.settings.punishmentMode === 'both' 
            ? [...BUILT_IN_PUNISHMENTS, ...prev.settings.customPunishments]
            : BUILT_IN_PUNISHMENTS;
        punishment = pool[Math.floor(Math.random() * pool.length)] || '20 Push-ups';
      }

      return {
        ...prev,
        logs: { ...prev.logs, [today]: { ...todayLog, missedHabits: newMissed } },
        user: { ...prev.user, karma: prev.user.karma - 1 },
        settings: { ...prev.settings, missedDaysStreak: newMissedStreak, currentPunishment: punishment }
      };
    });
  };

  // --- NEW UNDO LOGIC ---
  const undoHabit = (habitId) => {
    const today = getToday();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    setState(prev => {
      const todayLog = prev.logs[today];
      if (!todayLog) return prev;

      const wasCompleted = todayLog.completedHabits.includes(habitId);
      const wasMissed = todayLog.missedHabits.includes(habitId);

      if (!wasCompleted && !wasMissed) return prev;

      const newCompleted = todayLog.completedHabits.filter(id => id !== habitId);
      const newMissed = todayLog.missedHabits.filter(id => id !== habitId);
            let xpToAdjust = 0;
      let karmaToAdjust = 0;

      if (wasCompleted) {
        xpToAdjust = -(DIFFICULTY_XP[habit.difficulty] || 10);
        karmaToAdjust = -1;
      } else if (wasMissed) {
        karmaToAdjust = 1; // Reverses the -1 karma penalty
      }

      const newUser = {
        ...prev.user,
        xp: Math.max(0, prev.user.xp + xpToAdjust),
        karma: prev.user.karma + karmaToAdjust,
        totalCompleted: wasCompleted ? Math.max(0, prev.user.totalCompleted - 1) : prev.user.totalCompleted
      };

      // Reverse mastery quest progress if it was completed
      if (wasCompleted && habit.category) {
        const catLower = habit.category.toLowerCase();
        const qIndex = newUser.masteryQuests.findIndex(q => q.id === catLower);
        if (qIndex !== -1 && newUser.masteryQuests[qIndex].progress > 0) {
          newUser.masteryQuests[qIndex].progress -= 1;
        }
      }

      const newLogs = {
        ...prev.logs,
        [today]: { 
          ...todayLog, 
          completedHabits: newCompleted, 
          missedHabits: newMissed,
          xpEarned: Math.max(0, (todayLog.xpEarned || 0) + xpToAdjust)
        }
      };

      return { ...prev, logs: newLogs, user: newUser };
    });
  };

  const checkPerfectDay = (date, habitId, isCompleting) => {
    const log = state.logs[date];
    if (!log) return isCompleting && state.habits.filter(h => h.active).length === 1;
    const activeHabits = state.habits.filter(h => h.active).map(h => h.id);
    const completed = isCompleting ? [...log.completedHabits, habitId] : log.completedHabits;
    return activeHabits.every(id => completed.includes(id));
  };

  const addCustomPunishment = (text) => {
    setState(prev => ({      ...prev,
      settings: { ...prev.settings, customPunishments: [...prev.settings.customPunishments, text] }
    }));
  };

  const removeCustomPunishment = (text) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, customPunishments: prev.settings.customPunishments.filter(p => p !== text) }
    }));
  };

  const buyItem = (item) => {
    if (state.user.xp >= item.cost && !state.user.inventory.includes(item.id)) {
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          xp: prev.user.xp - item.cost,
          inventory: [...prev.user.inventory, item.id]
        }
      }));
    }
  };

  const addJournalEntry = (date, text, mood) => {
    setState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [date]: { ...(prev.logs[date] || {}), journal: text, mood }
      }
    }));
  };

  const completeTrial = () => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, trialCompleted: true }
    }));
  };

  const updateSettings = (updates) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const clearPunishment = () => {    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, currentPunishment: null, missedDaysStreak: 0 }
    }));
  };

  const actions = {
    addHabit, updateHabit, deleteHabit, toggleHabitArchive,
    completeHabit, missHabit, undoHabit, // <--- ADDED UNDO ACTION
    addCustomPunishment, removeCustomPunishment,
    buyItem, addJournalEntry, completeTrial, updateSettings, clearPunishment,
    exportData: () => exportData(state),
    importData: (file) => importData(file, (data) => setState(data)),
    resetData: () => resetData()
  };

  return { state, actions };
};
