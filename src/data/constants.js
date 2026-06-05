export const SAINT_LEVELS = [
  { level: 1, name: 'Wanderer', minXp: 0, env: 'Dusty Path' },
  { level: 2, name: 'Disciplined Seeker', minXp: 500, env: 'Forest' },
  { level: 3, name: 'Yogi', minXp: 1500, env: 'Hermitage' },
  { level: 4, name: 'Sage', minXp: 3000, env: 'Ashram' },
  { level: 5, name: 'Master', minXp: 6000, env: 'Temple' },
  { level: 6, name: 'Enlightened One', minXp: 10000, env: 'Celestial Realm' },
  { level: 7, name: 'Liberation', minXp: 15000, env: 'Liberation Realm' }
];

export const DIFFICULTY_XP = { Easy: 10, Medium: 20, Hard: 40 };

export const BUILT_IN_PUNISHMENTS = [
  '20 Push-ups', '50 Push-ups', '100 Squats', '5 Minute Plank',
  '30 Minute Walk', 'Cold Shower', 'No Junk Food Today',
  'No Social Media For 2 Hours', 'No Entertainment Apps Tonight',
  'Deep Clean Your Room', '30 Minutes Reading'
];

export const SHOP_ITEMS = [
  { id: 'mat', name: 'Meditation Mat', cost: 200, slot: 'floor', desc: 'A sacred space for reflection.' },
  { id: 'staff', name: 'Wooden Staff', cost: 500, slot: 'hand', desc: 'Support for the long journey.' },
  { id: 'beads', name: 'Prayer Beads', cost: 800, slot: 'neck', desc: 'For counting mantras.' },
  { id: 'ring', name: 'Aura Ring', cost: 1500, slot: 'aura', desc: 'Amplifies spiritual presence.' },
  { id: 'robe', name: 'Sacred Robe', cost: 2500, slot: 'body', desc: 'Garment of the disciplined.' },
  { id: 'halo', name: 'Golden Halo', cost: 5000, slot: 'head', desc: 'Sign of inner light.' },
  { id: 'throne', name: 'Lotus Throne', cost: 8000, slot: 'seat', desc: 'Seat of the Masters.' },
  { id: 'wings', name: 'Divine Wings', cost: 12000, slot: 'back', desc: 'Transcendence made visible.' }
];

export const ACHIEVEMENTS = [
  { id: 'first_habit', name: 'First Step', desc: 'Complete your first habit', condition: (s) => s.totalCompleted >= 1 },
  { id: 'streak_7', name: '7 Day Streak', desc: 'Maintain a 7-day streak', condition: (s) => s.longestStreak >= 7 },
  { id: 'streak_30', name: '30 Day Streak', desc: 'Maintain a 30-day streak', condition: (s) => s.longestStreak >= 30 },
  { id: 'streak_90', name: '90 Day Streak', desc: 'Maintain a 90-day streak', condition: (s) => s.longestStreak >= 90 },
  { id: 'hundred', name: 'Century', desc: 'Complete 100 habits total', condition: (s) => s.totalCompleted >= 100 },
  { id: 'perfect_week', name: 'Perfect Week', desc: '100% completion for 7 days', condition: (s) => s.perfectWeeks >= 1 },
  { id: 'perfect_month', name: 'Perfect Month', desc: '100% completion for 30 days', condition: (s) => s.perfectMonths >= 1 },
  { id: 'master', name: 'Master Achieved', desc: 'Reach Level 5', condition: (s) => s.level >= 5 },
  { id: 'enlightened', name: 'Enlightened', desc: 'Reach Level 6', condition: (s) => s.level >= 6 },
  { id: 'liberation', name: 'Liberation', desc: 'Achieve final liberation', condition: (s) => s.isLiberated }
];

export const MASTERY_QUESTS = [
  { id: 'health', name: 'Health Mastery', desc: 'Complete 100 health-related habits', target: 100, category: 'Health' },
  { id: 'mind', name: 'Mind Mastery', desc: 'Complete 100 mind-related habits', target: 100, category: 'Mind' },
  { id: 'learning', name: 'Learning Mastery', desc: 'Complete 100 learning-related habits', target: 100, category: 'Learning' },
  { id: 'spiritual', name: 'Spiritual Mastery', desc: 'Complete 100 spiritual-related habits', target: 100, category: 'Spiritual' }
];
