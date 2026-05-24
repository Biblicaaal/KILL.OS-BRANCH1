import type { RankThreshold, TaskDefinition, ResourceDef, StoreReward, Achievement, AppSettings, StreakData, CategoryDefinition, DashboardWidgetConfig } from './types';

export const COMBO_WINDOW_MS = 60 * 60 * 1000;

export const RANK_THRESHOLDS: RankThreshold[] = [
  { rank: 'F', minPercent: 0, color: '#666666' },
  { rank: 'E', minPercent: 10, color: '#888888' },
  { rank: 'D', minPercent: 20, color: '#aaaaaa' },
  { rank: 'C', minPercent: 35, color: '#00b4cc' },
  { rank: 'B', minPercent: 50, color: '#00e0ff' },
  { rank: 'A', minPercent: 65, color: '#33ffcc' },
  { rank: 'S', minPercent: 80, color: '#ffcc00' },
  { rank: 'SS', minPercent: 90, color: '#ff8800' },
  { rank: 'SSS', minPercent: 100, color: '#ff2ed1' },
];

export const RANK_MONEY_REWARD: Record<string, number> = {
  F: 10, E: 25, D: 50, C: 100, B: 200, A: 350, S: 500, SS: 750, SSS: 1000,
};

export const RESOURCE_DEFS: ResourceDef[] = [
  { id: 'neon_shard', name: 'Neon Shard', icon: '◆', color: '#00e0ff', rarity: 'common' },
  { id: 'pulse_crystal', name: 'Pulse Crystal', icon: '◇', color: '#ff8800', rarity: 'common' },
  { id: 'void_fragment', name: 'Void Fragment', icon: '◈', color: '#cc44ff', rarity: 'uncommon' },
  { id: 'alloy_core', name: 'Alloy Core', icon: '⚙', color: '#aaaaaa', rarity: 'uncommon' },
  { id: 'synthetic_fiber', name: 'Synthetic Fiber', icon: '⬡', color: '#33ffcc', rarity: 'uncommon' },
  { id: 'orichalcum', name: 'Orichalcum', icon: '★', color: '#ffcc00', rarity: 'rare' },
  { id: 'titanium', name: 'Titanium', icon: '▲', color: '#4488ff', rarity: 'rare' },
  { id: 'quantum_alloy', name: 'Quantum Alloy', icon: '✦', color: '#ff2ed1', rarity: 'epic' },
];

export const DEFAULT_TASKS: TaskDefinition[] = [
  {
    id: 'posts', name: 'Posts', dailyTarget: 3, baseValue: 40, icon: 'file-text', color: '#ff2ed1',
    category: 'Creative',
    resourceDrops: [
      { resourceId: 'neon_shard', min: 1, max: 3, chance: 0.7 },
      { resourceId: 'pulse_crystal', min: 1, max: 2, chance: 0.4 },
      { resourceId: 'orichalcum', min: 1, max: 1, chance: 0.1 },
    ],
  },
  {
    id: 'bots', name: 'Bots', dailyTarget: 1, baseValue: 80, icon: 'cpu', color: '#00e0ff',
    category: 'Work',
    resourceDrops: [
      { resourceId: 'alloy_core', min: 1, max: 2, chance: 0.6 },
      { resourceId: 'void_fragment', min: 1, max: 2, chance: 0.5 },
      { resourceId: 'titanium', min: 1, max: 1, chance: 0.15 },
    ],
  },
];

export const DEFAULT_REWARDS: StoreReward[] = [
  { id: 'gaming_1h', name: '1 Hour Gaming', description: 'Enjoy a gaming session', cost: 500, resources: [{ resourceId: 'neon_shard', amount: 5 }, { resourceId: 'alloy_core', amount: 2 }], cooldownMs: 3600000, category: 'Leisure', custom: false },
  { id: 'movie', name: 'Watch Movie', description: 'Relax with a movie', cost: 300, resources: [{ resourceId: 'pulse_crystal', amount: 3 }], cooldownMs: 7200000, category: 'Leisure', custom: false },
  { id: 'go_out', name: 'Go Out', description: 'Take a break outside', cost: 800, resources: [{ resourceId: 'synthetic_fiber', amount: 3 }, { resourceId: 'void_fragment', amount: 2 }], cooldownMs: 0, category: 'Social', custom: false },
  { id: 'snack', name: 'Snack Break', description: 'Grab a treat', cost: 150, resources: [], cooldownMs: 1800000, category: 'Leisure', custom: false },
  { id: 'craft_special', name: 'Special Crafting', description: 'Unlock a special reward', cost: 2000, resources: [{ resourceId: 'orichalcum', amount: 3 }, { resourceId: 'titanium', amount: 2 }, { resourceId: 'quantum_alloy', amount: 1 }], cooldownMs: 0, category: 'Premium', custom: false },
];

function a(id: string, name: string, description: string, icon: string, color: string, category: string, condition: Achievement['condition'], progressTarget?: number): Achievement {
  return { id, name, description, icon, color, category, unlockedAt: null, condition, progress: 0, progressTarget };
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // === PRODUCTIVITY (20) ===
  a('prod_10', 'First Step', 'Complete 10 tasks', 'target', '#00e0ff', 'Productivity', { type: 'tasks', value: 10 }, 10),
  a('prod_25', 'Getting Started', 'Complete 25 tasks', 'target', '#00e0ff', 'Productivity', { type: 'tasks', value: 25 }, 25),
  a('prod_50', 'Dedicated', 'Complete 50 tasks', 'target', '#00e0ff', 'Productivity', { type: 'tasks', value: 50 }, 50),
  a('prod_100', 'Grinder', 'Complete 100 tasks', 'target', '#33ffcc', 'Productivity', { type: 'tasks', value: 100 }, 100),
  a('prod_250', 'Half Century', 'Complete 250 tasks', 'target', '#33ffcc', 'Productivity', { type: 'tasks', value: 250 }, 250),
  a('prod_500', 'Centurion', 'Complete 500 tasks', 'target', '#ffcc00', 'Productivity', { type: 'tasks', value: 500 }, 500),
  a('prod_1000', 'Double Century', 'Complete 1,000 tasks', 'target', '#ffcc00', 'Productivity', { type: 'tasks', value: 1000 }, 1000),
  a('prod_2500', 'Unstoppable', 'Complete 2,500 tasks', 'target', '#ff8800', 'Productivity', { type: 'tasks', value: 2500 }, 2500),
  a('prod_5000', 'Millennium', 'Complete 5,000 tasks', 'target', '#ff2ed1', 'Productivity', { type: 'tasks', value: 5000 }, 5000),
  a('prod_10000', 'Task God', 'Complete 10,000 tasks', 'target', '#ff2ed1', 'Productivity', { type: 'tasks', value: 10000 }, 10000),
  a('prod_25000', 'Infinite Grind', 'Complete 25,000 tasks', 'target', '#ff2ed1', 'Productivity', { type: 'tasks', value: 25000 }, 25000),
  a('prod_allday_1', 'Perfect Day', 'Complete all tasks in a day', 'check-circle', '#ffcc00', 'Productivity', { type: 'rank', value: 100 }, 1),
  a('prod_allday_5', 'Five Perfect', '5 perfect days', 'check-circle', '#ff8800', 'Productivity', { type: 'consistency', value: 5 }, 5),
  a('prod_allday_10', 'Deca Perfect', '10 perfect days', 'check-circle', '#ff2ed1', 'Productivity', { type: 'consistency', value: 10 }, 10),
  a('prod_allday_30', 'Monthly Perfection', '30 perfect days', 'check-circle', '#ff2ed1', 'Productivity', { type: 'consistency', value: 30 }, 30),
  a('prod_rank_d', 'Above Average', 'Reach D rank on any day', 'trending-up', '#aaaaaa', 'Productivity', { type: 'special', value: 40 }),
  a('prod_rank_c', 'Solid', 'Reach C rank on any day', 'trending-up', '#00b4cc', 'Productivity', { type: 'special', value: 41 }),
  a('prod_rank_b', 'Skilled', 'Reach B rank on any day', 'trending-up', '#00e0ff', 'Productivity', { type: 'special', value: 42 }),
  a('prod_rank_a', 'Elite', 'Reach A rank on any day', 'trending-up', '#33ffcc', 'Productivity', { type: 'special', value: 43 }),
  a('prod_rank_s', 'Superior', 'Reach S rank on any day', 'trending-up', '#ffcc00', 'Productivity', { type: 'special', value: 44 }),

  // === COMBO (15) ===
  a('combo_x1.5', 'Combo Initiate', 'Reach x1.5 combo', 'zap', '#ffcc00', 'Combo', { type: 'combo', value: 1.5 }, 1),
  a('combo_x2', 'Combo Striker', 'Reach x2.0 combo', 'zap', '#ffcc00', 'Combo', { type: 'combo', value: 2 }, 1),
  a('combo_x2.5', 'Combo Surge', 'Reach x2.5 combo', 'zap', '#ff8800', 'Combo', { type: 'combo', value: 2.5 }, 1),
  a('combo_x3', 'Combo Master', 'Reach x3.0 combo', 'zap', '#ff8800', 'Combo', { type: 'combo', value: 3 }, 1),
  a('combo_x3.5', 'Combo Lord', 'Reach x3.5 combo', 'zap', '#ff2ed1', 'Combo', { type: 'combo', value: 3.5 }, 1),
  a('combo_x4', 'Combo King', 'Reach x4.0 combo', 'zap', '#ff2ed1', 'Combo', { type: 'combo', value: 4 }, 1),
  a('combo_x5', 'Combo Emperor', 'Reach x5.0 combo', 'zap', '#ff2ed1', 'Combo', { type: 'combo', value: 5 }, 1),
  a('combo_3chain', 'Chain Starter', '3 tasks in one combo chain', 'link', '#00e0ff', 'Combo', { type: 'special', value: 20 }),
  a('combo_5chain', 'Chain Master', '5 tasks in one combo chain', 'link', '#ffcc00', 'Combo', { type: 'special', value: 21 }),
  a('combo_10chain', 'Chain Legend', '10 tasks in one combo chain', 'link', '#ff2ed1', 'Combo', { type: 'special', value: 22 }),
  a('combo_nobreak_1', 'Combo Guardian', 'No combo break for 1 day', 'shield', '#33ffcc', 'Combo', { type: 'special', value: 23 }),
  a('combo_nobreak_3', 'Combo Sentinel', 'No combo break for 3 days', 'shield', '#ffcc00', 'Combo', { type: 'special', value: 24 }),
  a('combo_nobreak_7', 'Combo Fortress', 'No combo break for 7 days', 'shield', '#ff2ed1', 'Combo', { type: 'special', value: 25 }),
  a('combo_maintain_5', 'Sustained Flow', 'Maintain combo for 5 minutes', 'clock', '#00e0ff', 'Combo', { type: 'special', value: 26 }),
  a('combo_maintain_15', 'Deep Flow', 'Maintain combo for 15 minutes', 'clock', '#ff2ed1', 'Combo', { type: 'special', value: 27 }),

  // === STREAKS (20) ===
  a('streak_3', 'Two Timer', '3-day login streak', 'flame', '#ff8800', 'Streaks', { type: 'streak', value: 3 }, 3),
  a('streak_5', 'Hat Trick', '5-day login streak', 'flame', '#ff8800', 'Streaks', { type: 'streak', value: 5 }, 5),
  a('streak_7', 'Work Week', '7-day login streak', 'flame', '#ffcc00', 'Streaks', { type: 'streak', value: 7 }, 7),
  a('streak_10', 'Week Warrior', '10-day login streak', 'flame', '#ffcc00', 'Streaks', { type: 'streak', value: 10 }, 10),
  a('streak_14', 'Tenacious', '14-day login streak', 'flame', '#ff8800', 'Streaks', { type: 'streak', value: 14 }, 14),
  a('streak_21', 'Two Weeks', '21-day login streak', 'flame', '#ff8800', 'Streaks', { type: 'streak', value: 21 }, 21),
  a('streak_30', 'Habit Formed', '30-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 30 }, 30),
  a('streak_60', 'Monthly Master', '60-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 60 }, 60),
  a('streak_90', 'Bimonthly Beast', '90-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 90 }, 90),
  a('streak_120', 'Quarterly King', '120-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 120 }, 120),
  a('streak_180', 'Half Year Hero', '180-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 180 }, 180),
  a('streak_365', 'Year Legend', '365-day login streak', 'flame', '#ff2ed1', 'Streaks', { type: 'streak', value: 365 }, 365),
  a('sss_streak_3', 'Triple SSS', '3-day SSS streak', 'crown', '#ff8800', 'Streaks', { type: 'sss_streak', value: 3 }, 3),
  a('sss_streak_5', 'SSS Penta', '5-day SSS streak', 'crown', '#ffcc00', 'Streaks', { type: 'sss_streak', value: 5 }, 5),
  a('sss_streak_7', 'SSS Week', '7-day SSS streak', 'crown', '#ff8800', 'Streaks', { type: 'sss_streak', value: 7 }, 7),
  a('sss_streak_14', 'SSS Fortnight', '14-day SSS streak', 'crown', '#ff2ed1', 'Streaks', { type: 'sss_streak', value: 14 }, 14),
  a('sss_streak_30', 'SSS Month', '30-day SSS streak', 'crown', '#ff2ed1', 'Streaks', { type: 'sss_streak', value: 30 }, 30),
  a('sss_streak_60', 'SSS Two Months', '60-day SSS streak', 'crown', '#ff2ed1', 'Streaks', { type: 'sss_streak', value: 60 }, 60),
  a('consistency_5', 'Consistent', '5 days with all tasks done', 'calendar-check', '#00e0ff', 'Streaks', { type: 'consistency', value: 5 }, 5),
  a('consistency_14', 'Reliable', '14 days with all tasks done', 'calendar-check', '#ffcc00', 'Streaks', { type: 'consistency', value: 14 }, 14),

  // === ECONOMY (20) ===
  a('money_500', 'Pocket Change', 'Earn 500 money total', 'coins', '#aaaaaa', 'Economy', { type: 'money', value: 500 }, 500),
  a('money_1k', 'Saver', 'Earn 1,000 money total', 'coins', '#00e0ff', 'Economy', { type: 'money', value: 1000 }, 1000),
  a('money_5k', 'Thousandaire', 'Earn 5,000 money total', 'coins', '#00e0ff', 'Economy', { type: 'money', value: 5000 }, 5000),
  a('money_10k', 'Well Off', 'Earn 10,000 money total', 'coins', '#33ffcc', 'Economy', { type: 'money', value: 10000 }, 10000),
  a('money_25k', 'Wealthy', 'Earn 25,000 money total', 'coins', '#ffcc00', 'Economy', { type: 'money', value: 25000 }, 25000),
  a('money_50k', 'Rich', 'Earn 50,000 money total', 'coins', '#ff8800', 'Economy', { type: 'money', value: 50000 }, 50000),
  a('money_100k', 'Tycoon', 'Earn 100,000 money total', 'coins', '#ff2ed1', 'Economy', { type: 'money', value: 100000 }, 100000),
  a('money_500k', 'Mogul', 'Earn 500,000 money total', 'coins', '#ff2ed1', 'Economy', { type: 'money', value: 500000 }, 500000),
  a('spend_500', 'Shopper', 'Spend 500 money total', 'shopping-bag', '#aaaaaa', 'Economy', { type: 'spend', value: 500 }, 500),
  a('spend_1k', 'Spender', 'Spend 1,000 money total', 'shopping-bag', '#00e0ff', 'Economy', { type: 'spend', value: 1000 }, 1000),
  a('spend_5k', 'Big Spender', 'Spend 5,000 money total', 'shopping-bag', '#ffcc00', 'Economy', { type: 'spend', value: 5000 }, 5000),
  a('spend_25k', 'Whale', 'Spend 25,000 money total', 'shopping-bag', '#ff2ed1', 'Economy', { type: 'spend', value: 25000 }, 25000),
  a('purchase_1', 'First Purchase', 'Buy your first reward', 'shopping-cart', '#00e0ff', 'Economy', { type: 'purchase', value: 1 }, 1),
  a('purchase_5', 'Regular', 'Buy 5 rewards', 'shopping-cart', '#33ffcc', 'Economy', { type: 'purchase', value: 5 }, 5),
  a('purchase_10', 'Frequent Buyer', 'Buy 10 rewards', 'shopping-cart', '#ffcc00', 'Economy', { type: 'purchase', value: 10 }, 10),
  a('purchase_25', 'Shopaholic', 'Buy 25 rewards', 'shopping-cart', '#ff8800', 'Economy', { type: 'purchase', value: 25 }, 25),
  a('purchase_50', 'Patron', 'Buy 50 rewards', 'shopping-cart', '#ff2ed1', 'Economy', { type: 'purchase', value: 50 }, 50),
  a('purchase_100', 'Connoisseur', 'Buy 100 rewards', 'shopping-cart', '#ff2ed1', 'Economy', { type: 'purchase', value: 100 }, 100),

  // === FOCUS (15) ===
  a('focus_1', 'First Focus', 'Complete 1 focus session', 'timer', '#00e0ff', 'Focus', { type: 'focus', value: 1 }, 1),
  a('focus_5', 'Focused Mind', 'Complete 5 focus sessions', 'timer', '#33ffcc', 'Focus', { type: 'focus', value: 5 }, 5),
  a('focus_10', 'Deep Thinker', 'Complete 10 focus sessions', 'timer', '#ffcc00', 'Focus', { type: 'focus', value: 10 }, 10),
  a('focus_25', 'Focus Adept', 'Complete 25 focus sessions', 'timer', '#ff8800', 'Focus', { type: 'focus', value: 25 }, 25),
  a('focus_50', 'Focus Master', 'Complete 50 focus sessions', 'timer', '#ff2ed1', 'Focus', { type: 'focus', value: 50 }, 50),
  a('focus_100', 'Zen Master', 'Complete 100 focus sessions', 'timer', '#ff2ed1', 'Focus', { type: 'focus', value: 100 }, 100),
  a('focus_time_15m', 'Quarter Hour', '15 minutes total focus time', 'clock', '#aaaaaa', 'Focus', { type: 'special', value: 30 }),
  a('focus_time_1h', 'One Hour', '1 hour total focus time', 'clock', '#00e0ff', 'Focus', { type: 'special', value: 31 }),
  a('focus_time_5h', 'Five Hours', '5 hours total focus time', 'clock', '#33ffcc', 'Focus', { type: 'special', value: 32 }),
  a('focus_time_10h', 'Ten Hours', '10 hours total focus time', 'clock', '#ffcc00', 'Focus', { type: 'special', value: 33 }),
  a('focus_time_24h', 'Full Day', '24 hours total focus time', 'clock', '#ff8800', 'Focus', { type: 'special', value: 34 }),
  a('focus_time_50h', 'Fifty Hours', '50 hours total focus time', 'clock', '#ff2ed1', 'Focus', { type: 'special', value: 35 }),
  a('focus_time_100h', 'Hundred Hours', '100 hours total focus time', 'clock', '#ff2ed1', 'Focus', { type: 'special', value: 36 }),
  a('focus_pomodoro_1', 'Pomodoro Starter', 'Complete 1 Pomodoro', 'timer', '#00e0ff', 'Focus', { type: 'special', value: 37 }),
  a('focus_deepwork_1', 'Deep Worker', 'Complete 1 Deep Work session', 'brain', '#ff2ed1', 'Focus', { type: 'special', value: 38 }),

  // === SPECIAL / RARE (15) ===
  a('special_perfect_week', 'Perfect Week', '7 SSS days in a row', 'sparkles', '#ff2ed1', 'Special', { type: 'special', value: 1 }),
  a('special_perfect_month', 'Perfect Month', '30 SSS days in a row', 'sparkles', '#ff2ed1', 'Special', { type: 'special', value: 2 }),
  a('special_combo_sss', 'Overdrive', 'x3+ combo on SSS day', 'zap', '#ff2ed1', 'Special', { type: 'special', value: 3 }),
  a('special_nobreak_week', 'Unbreakable', 'No combo break for 7 days', 'shield', '#ff2ed1', 'Special', { type: 'special', value: 4 }),
  a('special_all_resources', 'Collector', 'Own 50+ of every resource', 'gem', '#ff2ed1', 'Special', { type: 'special', value: 5 }),
  a('special_rare_drop', 'Lucky Find', 'Get a rare resource drop', 'sparkles', '#ffcc00', 'Special', { type: 'special', value: 6 }),
  a('special_epic_drop', 'Mythic Find', 'Get an epic resource drop', 'sparkles', '#ff2ed1', 'Special', { type: 'special', value: 7 }),
  a('special_first_purchase', 'Treat Yourself', 'Redeem your first reward', 'gift', '#00e0ff', 'Special', { type: 'special', value: 8 }),
  a('special_5_redeemables', 'Hoarder', 'Have 5 unredeemed rewards', 'package', '#ffcc00', 'Special', { type: 'special', value: 9 }),
  a('special_early_bird', 'Early Bird', 'Complete a task before 9 AM', 'sun', '#ffcc00', 'Special', { type: 'special', value: 10 }),
  a('special_night_owl', 'Night Owl', 'Complete a task after midnight', 'moon', '#cc44ff', 'Special', { type: 'special', value: 11 }),
  a('special_speed_demon', 'Speed Demon', 'Complete all tasks in under 1 hour', 'zap', '#ff2ed1', 'Special', { type: 'special', value: 12 }),
  a('special_comeback', 'Comeback Kid', 'Go from F rank to SSS in one day', 'trending-up', '#ff2ed1', 'Special', { type: 'special', value: 13 }),
  a('special_dedication', 'Dedication', 'Play for 30 consecutive days', 'heart', '#ff2ed1', 'Special', { type: 'special', value: 14 }),
  a('special_legend', 'KILL.OS Legend', 'Unlock 50 other achievements', 'award', '#ff2ed1', 'Special', { type: 'special', value: 15 }),
];

export const DEFAULT_SETTINGS: AppSettings = {
  glowIntensity: 0.8,
  comboWindowMinutes: 60,
  soundEnabled: false,
  autoDayReset: true,
  particleIntensity: 0.8,
};

export const DEFAULT_STREAK: StreakData = {
  dailyStreak: 0,
  sssStreak: 0,
  lastActiveDate: '',
};

export const COMBO_STEP = 1;

export const TASK_ICONS = [
  'file-text', 'cpu', 'pen-tool', 'code', 'dumbbell', 'book-open',
  'music', 'camera', 'palette', 'globe', 'heart', 'zap',
  'star', 'shield', 'target', 'flame', 'trophy', 'rocket',
  'coffee', 'message-circle', 'video', 'briefcase', 'terminal',
  'shopping-bag', 'utensils', 'car', 'home', 'smile', 'eye',
] as const;

export type TaskIcon = typeof TASK_ICONS[number];

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'creative', name: 'Creative', color: '#ff2ed1' },
  { id: 'work', name: 'Work', color: '#00e0ff' },
  { id: 'fitness', name: 'Fitness', color: '#ff8800' },
  { id: 'learning', name: 'Learning', color: '#33ffcc' },
  { id: 'social', name: 'Social', color: '#ffcc00' },
  { id: 'health', name: 'Health', color: '#33ff99' },
  { id: 'finance', name: 'Finance', color: '#ffcc00' },
  { id: 'home', name: 'Home', color: '#aaaaaa' },
  { id: 'spiritual', name: 'Spiritual', color: '#cc44ff' },
  { id: 'custom', name: 'Custom', color: '#4488ff' },
];

export const DEFAULT_TASK_COLOR_PRESETS = ['#00e0ff', '#ff2ed1', '#ffcc00', '#33ffcc', '#ff8800', '#cc44ff', '#4488ff', '#33ff99'];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'telemetry', enabled: true },
  { id: 'targets', enabled: true },
  { id: 'focus', enabled: true },
  { id: 'unlocks', enabled: true },
];

export const TASK_CATEGORIES = DEFAULT_CATEGORIES.map(c => c.name);

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map(c => [c.name, c.color]),
);

export function getRank(percent: number): RankThreshold {
  let current = RANK_THRESHOLDS[0];
  for (const threshold of RANK_THRESHOLDS) {
    if (percent >= threshold.minPercent) {
      current = threshold;
    }
  }
  return current;
}

export function getNextRank(percent: number): RankThreshold | null {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (percent < RANK_THRESHOLDS[i].minPercent) {
      return RANK_THRESHOLDS[i];
    }
  }
  return null;
}

export function getResourceDef(id: string): ResourceDef {
  return RESOURCE_DEFS.find(r => r.id === id) ?? RESOURCE_DEFS[0];
}

export function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'common': return 'Common';
    case 'uncommon': return 'Uncommon';
    case 'rare': return 'Rare';
    case 'epic': return 'Epic';
    default: return 'Common';
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#aaaaaa';
    case 'uncommon': return '#33ffcc';
    case 'rare': return '#ffcc00';
    case 'epic': return '#ff2ed1';
    default: return '#aaaaaa';
  }
}
