export const SAINT_LEVELS = [
  { 
    level: 1, 
    name: 'Wanderer', 
    minProgress: 0, 
    env: 'Dusty Path', 
    avatar: '/avatars/wanderer.png', 
    environment: '/environments/dusty-path.png' 
  },
  { 
    level: 2, 
    name: 'Disciplined Seeker', 
    minProgress: 15, 
    env: 'Forest', 
    avatar: '/avatars/seeker.png', 
    environment: '/environments/forest.png' 
  },
  { 
    level: 3, 
    name: 'Yogi', 
    minProgress: 30, 
    env: 'Hermitage', 
    avatar: '/avatars/yogi.png', 
    environment: '/environments/hermitage.png' 
  },
  { 
    level: 4, 
    name: 'Sage', 
    minProgress: 50, 
    env: 'Ashram', 
    avatar: '/avatars/sage.png', 
    environment: '/environments/ashram.png' 
  },
  { 
    level: 5, 
    name: 'Master', 
    minProgress: 70, 
    env: 'Temple', 
    avatar: '/avatars/master.png', 
    environment: '/environments/temple.png' 
  },
  { 
    level: 6, 
    name: 'Enlightened One', 
    minProgress: 85, 
    env: 'Celestial Realm', 
    avatar: '/avatars/enlightened.png', 
    environment: '/environments/celestial.png' 
  },
  {     level: 7, 
    name: 'Liberation', 
    minProgress: 95, 
    env: 'Liberation Realm', 
    avatar: '/avatars/liberation.png', 
    environment: '/environments/liberation-realm.png' 
  }
];

export const DIFFICULTY_TYPES = {
  Important: { max: 10, default: 10 },
  'Less Important': { max: 5, default: 5 }
};

export const FREQUENCY_TYPES = {
  daily: { name: 'Daily', xpMultiplier: 1 },
  weekly: { name: 'Weekly', xpMultiplier: 3 },
  monthly: { name: 'Monthly', xpMultiplier: 10 },
  custom: { name: 'Custom Days', xpMultiplier: 1 }
};

export const WEEK_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export const BUILT_IN_PUNISHMENTS = [
  '20 Push-ups', '50 Push-ups', '100 Squats', '5 Minute Plank',
  '30 Minute Walk', 'Cold Shower', 'No Junk Food Today',
  'No Social Media For 2 Hours', 'No Entertainment Apps Tonight',
  'Deep Clean Your Room', '30 Minutes Reading'
];

export const SHOP_ITEMS = [
  { id: 'mat', name: 'Meditation Mat', cost: 200, slot: 'floor', desc: 'A sacred space for reflection.', image: './equipment/mat.png' },
  { id: 'staff', name: 'Wooden Staff', cost: 500, slot: 'hand', desc: 'Support for the long journey.', image: './equipment/staff.png' },
  { id: 'beads', name: 'Prayer Beads', cost: 800, slot: 'neck', desc: 'For counting mantras.', image: './equipment/beads.png' },
  { id: 'ring', name: 'Aura Ring', cost: 1500, slot: 'aura', desc: 'Amplifies spiritual presence.', image: './equipment/aura-ring.png' },
  { id: 'robe', name: 'Sacred Robe', cost: 2500, slot: 'body', desc: 'Garment of the disciplined.', image: './equipment/robe.png' },
  { id: 'halo', name: 'Golden Halo', cost: 5000, slot: 'head', desc: 'Sign of inner light.', image: './equipment/halo.png' },
  { id: 'throne', name: 'Lotus Throne', cost: 8000, slot: 'seat', desc: 'Seat of the Masters.', image: './equipment/throne.png' },
  { id: 'wings', name: 'Divine Wings', cost: 12000, slot: 'back', desc: 'Transcendence made visible.', image: './equipment/wings.png' }
];

export const ACHIEVEMENTS = [  { id: 'first_habit', name: 'First Step', desc: 'Complete your first habit', condition: (s) => s.totalCompleted >= 1 },
  { id: 'hundred', name: 'Century', desc: 'Complete 100 habits total', condition: (s) => s.totalCompleted >= 100 },
  { id: 'master', name: 'Master Achieved', desc: 'Reach Level 5', condition: (s) => s.level >= 5 },
  { id: 'liberation', name: 'Liberation', desc: 'Achieve final liberation', condition: (s) => s.isLiberated }
];

export const CHAKRA_THEMES = [
  { id: 'crown', name: 'Crown Chakra (Violet/Gold)', primary: '#8A2BE2', secondary: '#FFD700', bg: '#1a0b2e' },
  { id: 'third-eye', name: 'Third Eye (Indigo/Silver)', primary: '#4B0082', secondary: '#C0C0C0', bg: '#0f0518' },
  { id: 'throat', name: 'Throat Chakra (Blue/Turquoise)', primary: '#00BFFF', secondary: '#E0FFFF', bg: '#001a33' },
  { id: 'heart', name: 'Heart Chakra (Green/Emerald)', primary: '#2E8B57', secondary: '#98FB98', bg: '#001a0f' }
];

export const CHAKRAS = [
  { id: 'root', name: 'Root', color: '#FF0000', threshold: 15, icon: '🔴' },
  { id: 'sacral', name: 'Sacral', color: '#FF7F00', threshold: 30, icon: '🟠' },
  { id: 'solar', name: 'Solar Plexus', color: '#FFD700', threshold: 45, icon: '🟡' },
  { id: 'heart', name: 'Heart', color: '#00FF00', threshold: 60, icon: '🟢' },
  { id: 'throat', name: 'Throat', color: '#0000FF', threshold: 75, icon: '🔵' },
  { id: 'third-eye', name: 'Third Eye', color: '#4B0082', threshold: 90, icon: '🟣' },
  { id: 'crown', name: 'Crown', color: '#9400D3', threshold: 100, icon: '⚪' }
];

export const REST_DAY_COST = 100;
