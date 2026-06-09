const STORAGE_KEY = 'habit_quest_data_v3';

export const loadState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { console.error('Failed to load state', e); }
  return getDefaultState();
};

export const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } 
  catch (e) { console.error('Failed to save state', e); }
};

export const exportData = (state) => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try { callback(JSON.parse(e.target.result)); } 
    catch (err) { alert('Invalid backup file'); }
  };
  reader.readAsText(file);
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

const getDefaultState = () => ({
  habits: [],
  logs: {},
  user: {
    xp: 0,
    lifetimeDiscipline: 0,
    levelPoints: 0,
    pendingLevelPoints: 0,
    pointsForCurrentLevel: 0,
    pointsNeededForNextLevel: 100,
    lastProgressDate: null,
    totalCompleted: 0,
    level: 1,
    inventory: [],
    achievements: [],
    templeRecords: { startDate: new Date().toISOString().split('T')[0], milestones: {} }
  },
  settings: {
    theme: 'crown',
    customPunishments: [],
    punishmentMode: 'both',
    dashboardPunishment: null,
    consecutiveMissPunishment: null,  // NEW: Separate punishment for consecutive misses
    consecutiveMissMap: {},
    isPaused: false,
    pauseReason: '',
    restDayActive: false,
    restDayExpiry: null
  }
});
