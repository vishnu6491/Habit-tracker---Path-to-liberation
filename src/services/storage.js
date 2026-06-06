const STORAGE_KEY = 'habit_quest_data';

export const loadState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return getDefaultState();
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
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
    try {
      const data = JSON.parse(e.target.result);
      callback(data);
    } catch (err) {
      alert('Invalid backup file');
    }
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
    karma: 0,
    totalCompleted: 0,
    longestStreak: 0,
    perfectWeeks: 0,
    perfectMonths: 0,
    level: 1,
    inventory: [],
    achievements: [],
    masteryQuests: [
      { id: 'health', progress: 0 },
      { id: 'mind', progress: 0 },
      { id: 'learning', progress: 0 },
      { id: 'spiritual', progress: 0 } // FIXED: Removed syntax error "and:"
    ],
    trialCompleted: false,
    isLiberated: false,
    templeRecords: {
      startDate: new Date().toISOString().split('T')[0],
      milestones: {}
    }
  },
  settings: {
    customPunishments: [],
    punishmentMode: 'both',
    currentPunishment: null,
    missedDaysStreak: 0
  }
});
