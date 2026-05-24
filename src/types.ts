export interface TaskDefinition {
  id: string;
  name: string;
  dailyTarget: number;
  baseValue: number;
  icon: string;
  color: string;
  category: string;
  resourceDrops: ResourceDrop[];
}

export interface ResourceDrop {
  resourceId: string;
  min: number;
  max: number;
  chance: number;
}

export interface ComboState {
  multiplier: number;
  lastActionAt: number | null;
  comboWindowMs: number;
  peakToday: number;
}

export type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface RankThreshold {
  rank: Rank;
  minPercent: number;
  color: string;
}

export interface TimelineEntry {
  id: string;
  taskName: string;
  taskColor: string;
  completedAt: number;
  pointsEarned: number;
  comboMultiplier: number;
  resourcesEarned: ResourceAmount[];
}

export interface ResourceAmount {
  resourceId: string;
  amount: number;
}

export interface ResourceDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface StoreReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  resources: ResourceAmount[];
  cooldownMs: number;
  category: string;
  icon: string;
  custom: boolean;
}

export interface StoreCategoryDefinition {
  id: string;
  name: string;
  color: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
}

export type DashboardWidgetId =
  | 'daily_progress' | 'telemetry' | 'targets' | 'focus' | 'unlocks'
  | 'streak' | 'economy' | 'resources' | 'timeline';

export type WidgetSize = 'big' | 'normal';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  enabled: boolean;
}

export interface Redeemable {
  id: string;
  rewardName: string;
  rewardDescription: string;
  purchasedAt: number;
}

export interface DaySummary {
  date: string;
  rank: Rank;
  tasksCompleted: number;
  totalTasks: number;
  comboPeak: number;
  totalXP: number;
  moneyEarned: number;
  resourcesEarned: ResourceAmount[];
  streakDay: number;
  sssStreak: number;
}

export interface CalendarDay {
  date: string;
  rank: Rank;
  tasksCompleted: number;
  totalTasks: number;
  comboPeak: number;
  totalXP: number;
}

export interface StreakData {
  dailyStreak: number;
  sssStreak: number;
  lastActiveDate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  unlockedAt: number | null;
  condition: AchievementCondition;
  progress?: number;
  progressTarget?: number;
}

export interface AchievementCondition {
  type: 'streak' | 'sss_streak' | 'rank' | 'tasks' | 'combo' | 'money' | 'spend' | 'resource' | 'focus' | 'purchase' | 'consistency' | 'special';
  value: number;
  resourceId?: string;
}

export interface InsightPlatform {
  id: string;
  name: string;
  color: string;
  metrics: InsightMetric[];
}

export interface InsightMetric {
  id: string;
  name: string;
  unit: string;
}

export interface InsightEntry {
  platformId: string;
  metricId: string;
  date: string;
  value: number;
}

export interface AppSettings {
  glowIntensity: number;
  comboWindowMinutes: number;
  soundEnabled: boolean;
  autoDayReset: boolean;
  particleIntensity: number;
}

export type TabId = 'dashboard' | 'stats' | 'store' | 'calendar' | 'insights' | 'inventory' | 'achievements' | 'settings' | 'devtools' | 'focus';

export interface FocusSession {
  type: 'pomodoro' | 'deepwork' | 'custom';
  durationMs: number;
  startedAt: number | null;
  pausedAt: number | null;
  elapsedMs: number;
  isRunning: boolean;
  isComplete: boolean;
}

export interface Notification {
  id: string;
  type: 'task' | 'combo' | 'rank' | 'purchase' | 'achievement' | 'focus' | 'redeem';
  title: string;
  message: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface AppState {
  tasks: TaskDefinition[];
  categories: CategoryDefinition[];
  storeCategories: StoreCategoryDefinition[];
  taskColorPresets: string[];
  dashboardWidgets: DashboardWidgetConfig[];
  progress: Record<string, number>;
  combo: ComboState;
  timeline: TimelineEntry[];
  totalPointsToday: number;
  money: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  resources: Record<string, number>;
  streak: StreakData;
  rewards: StoreReward[];
  redeemables: Redeemable[];
  rewardCooldowns: Record<string, number>;
  calendar: Record<string, CalendarDay>;
  achievements: Achievement[];
  totalTasksCompleted: number;
  insightPlatforms: InsightPlatform[];
  insightEntries: InsightEntry[];
  settings: AppSettings;
  daySummarized: boolean;
  focusSession: FocusSession;
  focusTotalMs: number;
  notifications: Notification[];
}
