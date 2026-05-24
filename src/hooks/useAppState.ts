import { useState, useCallback, useEffect, useRef } from 'react';
import type { AppState, TimelineEntry, ResourceAmount, TaskDefinition, StoreReward, InsightPlatform, InsightEntry, Achievement, CalendarDay, DaySummary, Notification, FocusSession, Redeemable, CategoryDefinition, DashboardWidgetConfig } from '../types';
import { DEFAULT_TASKS, DEFAULT_REWARDS, DEFAULT_ACHIEVEMENTS, DEFAULT_SETTINGS, DEFAULT_STREAK, DEFAULT_CATEGORIES, DEFAULT_TASK_COLOR_PRESETS, DEFAULT_DASHBOARD_WIDGETS, RANK_MONEY_REWARD, COMBO_STEP, getRank, RESOURCE_DEFS } from '../constants';
import { playTaskComplete, playComboIncrease, playRankUp, playPurchase, playAchievement, playFocusComplete, playRedeem } from './useSounds';
import { useAutoSave, loadStateFromCloud } from './useAutoSave';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function rollResourceDrops(drops: TaskDefinition['resourceDrops'], comboMultiplier: number): ResourceAmount[] {
  const results: ResourceAmount[] = [];
  for (const drop of drops) {
    const adjustedChance = Math.min(drop.chance * (0.5 + comboMultiplier * 0.5), 1);
    if (Math.random() < adjustedChance) {
      const range = drop.max - drop.min;
      const amount = drop.min + Math.round(Math.random() * range);
      if (amount > 0) results.push({ resourceId: drop.resourceId, amount });
    }
  }
  return results;
}

function pushNotification(prev: Notification[], n: Omit<Notification, 'id' | 'createdAt'>): Notification[] {
  const newN: Notification = { ...n, id: crypto.randomUUID(), createdAt: Date.now() };
  return [...prev, newN].slice(-10);
}

function getBestRankEver(calendar: Record<string, { rank: string; tasksCompleted: number; totalTasks: number }>): number {
  let bestPercent = 0;
  for (const day of Object.values(calendar)) {
    if (day.totalTasks > 0) {
      const pct = (day.tasksCompleted / day.totalTasks) * 100;
      if (pct > bestPercent) bestPercent = pct;
    }
  }
  return bestPercent;
}

function checkAchievements(
  achievements: Achievement[],
  state: AppState,
  totalTasksEver: number,
  totalPurchases: number,
  _totalCrafts: number,
  focusSessionsCount: number,
  trigger: 'task' | 'purchase' | 'focus' | 'redeem' | 'day' = 'task',
): { achievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const s = state;
  const newlyUnlocked: Achievement[] = [];
  const sssDaysCount = Object.values(s.calendar).filter(d => d.rank === 'SSS').length;
  const perfectDaysCount = sssDaysCount;

  const updated = achievements.map(a => {
    if (a.unlockedAt !== null) {
      // Still update progress for already-unlocked
      return a;
    }
    let unlocked = false;
    let progress = a.progress ?? 0;
    const c = a.condition;

    switch (c.type) {
      case 'streak':
        progress = s.streak.dailyStreak;
        unlocked = (trigger === 'day' || trigger === 'task') && s.streak.dailyStreak >= c.value;
        break;
      case 'sss_streak':
        progress = s.streak.sssStreak;
        unlocked = (trigger === 'day' || trigger === 'task') && s.streak.sssStreak >= c.value;
        break;
      case 'tasks':
        progress = totalTasksEver;
        unlocked = (trigger === 'task' || trigger === 'day') && totalTasksEver >= c.value;
        break;
      case 'combo':
        progress = s.combo.peakToday;
        unlocked = c.value > 0 && (trigger === 'task' || trigger === 'day') && s.combo.peakToday >= c.value;
        break;
      case 'money':
        progress = s.totalMoneyEarned;
        unlocked = (trigger === 'task' || trigger === 'purchase' || trigger === 'focus' || trigger === 'day') && s.totalMoneyEarned >= c.value;
        break;
      case 'spend':
        progress = s.totalMoneySpent;
        unlocked = (trigger === 'purchase' || trigger === 'day') && s.totalMoneySpent >= c.value;
        break;
      case 'purchase':
        progress = totalPurchases;
        unlocked = (trigger === 'purchase' || trigger === 'day') && totalPurchases >= c.value;
        break;
      case 'focus':
        progress = focusSessionsCount;
        unlocked = (trigger === 'focus' || trigger === 'day') && focusSessionsCount >= c.value;
        break;
      case 'resource': {
        const amt = s.resources[c.resourceId ?? ''] ?? 0;
        progress = amt;
        unlocked = (trigger === 'task' || trigger === 'focus' || trigger === 'purchase' || trigger === 'day') && amt >= c.value;
        break;
      }
      case 'consistency':
        progress = perfectDaysCount;
        unlocked = (trigger === 'day' || trigger === 'task') && perfectDaysCount >= c.value;
        break;
      case 'rank':
        progress = perfectDaysCount > 0 ? 1 : 0;
        unlocked = (trigger === 'day' || trigger === 'task') && perfectDaysCount >= 1;
        break;
      case 'special': {
        switch (c.value) {
          case 1: progress = sssDaysCount; unlocked = (trigger === 'day' || trigger === 'task') && sssDaysCount >= 7; break;
          case 2: progress = sssDaysCount; unlocked = (trigger === 'day' || trigger === 'task') && sssDaysCount >= 30; break;
          case 3: {
            const hasHighComboSSS = s.combo.peakToday >= 3 && sssDaysCount > 0;
            progress = hasHighComboSSS ? 1 : 0;
            unlocked = (trigger === 'task' || trigger === 'day') && hasHighComboSSS;
            break;
          }
          case 4: {
            progress = s.streak.dailyStreak >= 7 ? 1 : 0;
            unlocked = (trigger === 'day' || trigger === 'task') && s.streak.dailyStreak >= 7;
            break;
          }
          case 5: {
            const allHave50 = RESOURCE_DEFS.every(rd => (s.resources[rd.id] ?? 0) >= 50);
            progress = allHave50 ? 1 : 0;
            unlocked = (trigger === 'task' || trigger === 'focus' || trigger === 'purchase') && allHave50;
            break;
          }
          case 6: case 7: {
            const hasRare = RESOURCE_DEFS.filter(rd => rd.rarity === 'rare').some(rd => (s.resources[rd.id] ?? 0) > 0);
            const hasEpic = RESOURCE_DEFS.filter(rd => rd.rarity === 'epic').some(rd => (s.resources[rd.id] ?? 0) > 0);
            if (c.value === 6) { progress = hasRare ? 1 : 0; unlocked = (trigger === 'task' || trigger === 'focus') && hasRare; }
            else { progress = hasEpic ? 1 : 0; unlocked = (trigger === 'task' || trigger === 'focus') && hasEpic; }
            break;
          }
          case 8: progress = s.redeemables.length > 0 ? 1 : 0; unlocked = (trigger === 'purchase' || trigger === 'redeem') && s.redeemables.length > 0; break;
          case 9: progress = s.redeemables.length; unlocked = (trigger === 'purchase' || trigger === 'redeem') && s.redeemables.length >= 5; break;
          case 10: case 11: {
            const hour = new Date().getHours();
            if (c.value === 10) { progress = hour < 9 ? 1 : 0; unlocked = trigger === 'task' && hour < 9 && s.totalTasksCompleted > 0; }
            else { progress = hour >= 0 && hour < 5 ? 1 : 0; unlocked = trigger === 'task' && hour >= 0 && hour < 5 && s.totalTasksCompleted > 0; }
            break;
          }
          case 12: {
            const firstAction = s.timeline.length > 0 ? s.timeline[s.timeline.length - 1].completedAt : 0;
            const lastAction = s.timeline.length > 0 ? s.timeline[0].completedAt : 0;
            const allDone = Object.values(s.progress).reduce((s2, v) => s2 + v, 0) >= s.tasks.reduce((s2, t) => s2 + t.dailyTarget, 0);
            const withinHour = lastAction - firstAction < 3600000;
            progress = allDone && withinHour ? 1 : 0;
            unlocked = trigger === 'task' && allDone && withinHour && firstAction > 0;
            break;
          }
          case 13: {
            progress = 0;
            unlocked = false;
            break;
          }
          case 14: {
            progress = s.streak.dailyStreak;
            unlocked = (trigger === 'day' || trigger === 'task') && s.streak.dailyStreak >= 30;
            break;
          }
          case 15: {
            const unlockedCount = achievements.filter(x => x.unlockedAt !== null).length;
            progress = unlockedCount;
            unlocked = unlockedCount >= 50;
            break;
          }
          // Combo chain achievements (20-22)
          case 20: {
            const comboChainToday = s.timeline.filter(e => e.comboMultiplier > 1).length;
            progress = comboChainToday;
            unlocked = trigger === 'task' && comboChainToday >= 3;
            break;
          }
          case 21: {
            const comboChainToday = s.timeline.filter(e => e.comboMultiplier > 1).length;
            progress = comboChainToday;
            unlocked = trigger === 'task' && comboChainToday >= 5;
            break;
          }
          case 22: {
            const comboChainToday = s.timeline.filter(e => e.comboMultiplier > 1).length;
            progress = comboChainToday;
            unlocked = trigger === 'task' && comboChainToday >= 10;
            break;
          }
          // No combo break (23-25)
          case 23: {
            unlocked = trigger === 'task' && s.streak.dailyStreak >= 1 && s.combo.peakToday > 1;
            progress = unlocked ? 1 : 0;
            break;
          }
          case 24: {
            unlocked = trigger === 'task' && s.streak.dailyStreak >= 3 && s.combo.peakToday > 1;
            progress = s.streak.dailyStreak >= 3 ? 1 : 0;
            break;
          }
          case 25: {
            unlocked = trigger === 'task' && s.streak.dailyStreak >= 7 && s.combo.peakToday > 1;
            progress = s.streak.dailyStreak >= 7 ? 1 : 0;
            break;
          }
          // Maintain combo for N minutes (26-27)
          case 26: {
            const comboActive = s.combo.lastActionAt !== null && (Date.now() - s.combo.lastActionAt) < s.combo.comboWindowMs && s.combo.multiplier > 1;
            progress = comboActive ? 1 : 0;
            unlocked = trigger === 'task' && comboActive && s.combo.comboWindowMs >= 300000;
            break;
          }
          case 27: {
            const comboActive15 = s.combo.lastActionAt !== null && s.combo.comboWindowMs >= 900000 && s.combo.multiplier > 1;
            progress = comboActive15 ? 1 : 0;
            unlocked = trigger === 'task' && comboActive15;
            break;
          }
          // Focus time achievements (30-36)
          case 30: progress = Math.min(s.focusTotalMs / 900000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 900000; break;
          case 31: progress = Math.min(s.focusTotalMs / 3600000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 3600000; break;
          case 32: progress = Math.min(s.focusTotalMs / 18000000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 18000000; break;
          case 33: progress = Math.min(s.focusTotalMs / 36000000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 36000000; break;
          case 34: progress = Math.min(s.focusTotalMs / 86400000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 86400000; break;
          case 35: progress = Math.min(s.focusTotalMs / 180000000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 180000000; break;
          case 36: progress = Math.min(s.focusTotalMs / 360000000, 1); unlocked = trigger === 'focus' && s.focusTotalMs >= 360000000; break;
          // Session type achievements (37-38)
          case 37: {
            const pomodoroCount = Number(localStorage.getItem('killOs_pomodoroCount') ?? '0');
            progress = pomodoroCount;
            unlocked = trigger === 'focus' && pomodoroCount >= 1;
            break;
          }
          case 38: {
            const deepworkCount = Number(localStorage.getItem('killOs_deepworkCount') ?? '0');
            progress = deepworkCount;
            unlocked = trigger === 'focus' && deepworkCount >= 1;
            break;
          }
          // Rank-based productivity achievements (40-44)
          case 40: {
            const bestRank = getBestRankEver(s.calendar);
            progress = bestRank;
            unlocked = (trigger === 'day' || trigger === 'task') && bestRank >= 20;
            break;
          }
          case 41: {
            const bestRank = getBestRankEver(s.calendar);
            progress = bestRank;
            unlocked = (trigger === 'day' || trigger === 'task') && bestRank >= 35;
            break;
          }
          case 42: {
            const bestRank = getBestRankEver(s.calendar);
            progress = bestRank;
            unlocked = (trigger === 'day' || trigger === 'task') && bestRank >= 50;
            break;
          }
          case 43: {
            const bestRank = getBestRankEver(s.calendar);
            progress = bestRank;
            unlocked = (trigger === 'day' || trigger === 'task') && bestRank >= 65;
            break;
          }
          case 44: {
            const bestRank = getBestRankEver(s.calendar);
            progress = bestRank;
            unlocked = (trigger === 'day' || trigger === 'task') && bestRank >= 80;
            break;
          }
          default: break;
        }
        break;
      }
      default: break;
    }

    const updatedA = { ...a, progress };
    if (unlocked && a.unlockedAt === null) {
      newlyUnlocked.push({ ...updatedA, unlockedAt: Date.now() });
      return { ...updatedA, unlockedAt: Date.now() };
    }
    return updatedA;
  });
  return { achievements: updated, newlyUnlocked };
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('killOs_v3_state');
    if (saved) {
      const p = JSON.parse(saved);
      return hydrateFromPersisted(p);
    }
  } catch { /* ignore */ }
  return hydrateFromPersisted({} as Record<string, unknown>);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hydrateFromPersisted(p: any): AppState {
  const savedCategories = Array.isArray(p.categories) ? p.categories : [];
  const existingTaskCategories = (p.tasks ?? DEFAULT_TASKS).map((t: TaskDefinition) => t.category);
  const extraCategories = Array.from(new Set<string>(existingTaskCategories))
    .filter((name: string) => !DEFAULT_CATEGORIES.some(c => c.name === name) && !savedCategories.some((c: CategoryDefinition) => c.name === name))
    .map((name: string) => ({ id: crypto.randomUUID(), name, color: '#4488ff' }));
  const savedWidgets = Array.isArray(p.dashboardWidgets) ? p.dashboardWidgets : [];
  const dashboardWidgets = [
    ...savedWidgets.filter((w: DashboardWidgetConfig) => DEFAULT_DASHBOARD_WIDGETS.some(d => d.id === w.id)),
    ...DEFAULT_DASHBOARD_WIDGETS.filter(d => !savedWidgets.some((w: DashboardWidgetConfig) => w.id === d.id)),
  ];
  return {
    tasks: p.tasks ?? DEFAULT_TASKS,
    categories: savedCategories.length > 0 ? [...savedCategories, ...extraCategories] : [...DEFAULT_CATEGORIES, ...extraCategories],
    taskColorPresets: Array.isArray(p.taskColorPresets) && p.taskColorPresets.length > 0 ? p.taskColorPresets : DEFAULT_TASK_COLOR_PRESETS,
    dashboardWidgets,
    progress: p.progress ?? {},
    combo: { multiplier: 1.0, lastActionAt: null, comboWindowMs: (p.settings?.comboWindowMinutes ?? 60) * 60000, peakToday: p.combo?.peakToday ?? 1.0, ...p.combo },
    timeline: p.timeline ?? [],
    totalPointsToday: p.totalPointsToday ?? 0,
    money: p.money ?? 0,
    totalMoneyEarned: p.totalMoneyEarned ?? p.money ?? 0,
    totalMoneySpent: p.totalMoneySpent ?? 0,
    resources: p.resources ?? {},
    streak: { ...DEFAULT_STREAK, ...p.streak },
    rewards: p.rewards ?? DEFAULT_REWARDS,
    redeemables: p.redeemables ?? [],
    rewardCooldowns: p.rewardCooldowns ?? {},
    calendar: p.calendar ?? {},
    achievements: p.achievements ?? DEFAULT_ACHIEVEMENTS,
    totalTasksCompleted: p.totalTasksCompleted ?? 0,
    insightPlatforms: p.insightPlatforms ?? [],
    insightEntries: p.insightEntries ?? [],
    settings: { ...DEFAULT_SETTINGS, ...p.settings },
    daySummarized: p.daySummarized ?? false,
    focusSession: { type: 'pomodoro', durationMs: 25 * 60 * 1000, startedAt: null, pausedAt: null, elapsedMs: 0, isRunning: false, isComplete: false, ...p.focusSession },
    focusTotalMs: p.focusTotalMs ?? 0,
    notifications: [],
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [comboTimeLeft, setComboTimeLeft] = useState<number>(0);
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);

  // Auto-save to cloud + localStorage on every state change
  useAutoSave(state);

  // Persistent counters
  const [totalPurchases, setTotalPurchases] = useState(() => {
    try { return Number(localStorage.getItem('killOs_totalPurchases') ?? '0'); } catch { return 0; }
  });
  const [totalCrafts, setTotalCrafts] = useState(() => {
    try { return Number(localStorage.getItem('killOs_totalCrafts') ?? '0'); } catch { return 0; }
  });
  const [focusSessionsCount, setFocusSessionsCount] = useState(() => {
    try { return Number(localStorage.getItem('killOs_focusSessions') ?? '0'); } catch { return 0; }
  });

  // Load state from cloud on mount (overwrites localStorage if cloud is newer)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cloudState = await loadStateFromCloud();
      if (!cancelled && cloudState) {
        setState(cloudState as AppState);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Update streak on mount
  useEffect(() => {
    const today = getTodayKey();
    setState(prev => {
      if (prev.streak.lastActiveDate === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      const isConsecutive = prev.streak.lastActiveDate === yesterdayKey;
      const newStreak = isConsecutive ? prev.streak.dailyStreak + 1 : 1;
      return { ...prev, streak: { ...prev.streak, dailyStreak: newStreak, lastActiveDate: today }, daySummarized: false };
    });
  }, []);

  // Combo timer - only resets when window expires, does NOT randomly change
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setState(prev => {
        const { combo } = prev;
        if (combo.lastActionAt === null || combo.multiplier <= 1.0) {
          setComboTimeLeft(0);
          return prev;
        }
        const elapsed = Date.now() - combo.lastActionAt;
        const remaining = combo.comboWindowMs - elapsed;
        if (remaining <= 0) {
          setComboTimeLeft(0);
          return { ...prev, combo: { ...combo, multiplier: 1.0, lastActionAt: null } };
        }
        setComboTimeLeft(remaining);
        return prev;
      });
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const completeTask = useCallback((taskId: string) => {
    let soundTask = false;
    let soundCombo = false;
    let soundAchievement = false;

    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      const current = prev.progress[taskId] ?? 0;
      if (current >= task.dailyTarget) return prev;

      const now = Date.now();
      const { combo } = prev;
      const isWithinWindow = combo.lastActionAt !== null && now - combo.lastActionAt < combo.comboWindowMs;
      const prevMultiplier = combo.multiplier;
      const newMultiplier = isWithinWindow
        ? Math.min(Math.floor(combo.multiplier) + COMBO_STEP, Number.MAX_SAFE_INTEGER)
        : 1.0;
      const newPeak = Math.max(combo.peakToday, newMultiplier);
      const pointsEarned = Math.round(task.baseValue * newMultiplier);
      const resourcesEarned = rollResourceDrops(task.resourceDrops, newMultiplier);
      const moneyEarned = Math.round(task.baseValue * 0.5 * newMultiplier);

      const newResources = { ...prev.resources };
      for (const r of resourcesEarned) {
        newResources[r.resourceId] = (newResources[r.resourceId] ?? 0) + r.amount;
      }

      const entry: TimelineEntry = {
        id: crypto.randomUUID(),
        taskName: task.name,
        taskColor: task.color,
        completedAt: now,
        pointsEarned,
        comboMultiplier: newMultiplier,
        resourcesEarned,
      };

      const newTotalTasks = prev.totalTasksCompleted + 1;
      const wasComboIncrease = newMultiplier > prevMultiplier && newMultiplier > 1.0;

      let notifications = [...prev.notifications];
      notifications = pushNotification(notifications, { type: 'task', title: 'TASK COMPLETE', message: `${task.name} +${pointsEarned} XP`, color: task.color, icon: 'task' });
      if (resourcesEarned.length > 0) {
        const dropText = resourcesEarned.map(r => {
          const def = RESOURCE_DEFS.find(rd => rd.id === r.resourceId);
          return def ? `${def.icon}+${r.amount}` : '';
        }).filter(Boolean).join(' ');
        notifications = pushNotification(notifications, { type: 'task', title: 'RESOURCES', message: dropText, color: '#33ffcc', icon: 'task' });
      }
      if (wasComboIncrease) {
        notifications = pushNotification(notifications, { type: 'combo', title: 'COMBO UP', message: `x${newMultiplier.toLocaleString()}`, color: '#ffcc00', icon: 'combo' });
      }

      if (prev.settings.soundEnabled) {
        soundTask = true;
        if (wasComboIncrease) soundCombo = true;
      }

      const newState = {
        ...prev,
        progress: { ...prev.progress, [taskId]: current + 1 },
        combo: { ...combo, multiplier: newMultiplier, lastActionAt: now, peakToday: newPeak },
        timeline: [entry, ...prev.timeline].slice(0, 50),
        totalPointsToday: prev.totalPointsToday + pointsEarned,
        money: prev.money + moneyEarned,
        totalMoneyEarned: prev.totalMoneyEarned + moneyEarned,
        resources: newResources,
        totalTasksCompleted: newTotalTasks,
        notifications,
      };

      const { achievements: updatedAch, newlyUnlocked } = checkAchievements(prev.achievements, newState, newTotalTasks, totalPurchases, totalCrafts, focusSessionsCount, 'task');
      if (newlyUnlocked.length > 0) {
        for (const ua of newlyUnlocked) {
          newState.notifications = pushNotification(newState.notifications, { type: 'achievement', title: 'ACHIEVEMENT UNLOCKED', message: ua.name, color: ua.color, icon: 'achievement' });
        }
        if (prev.settings.soundEnabled) soundAchievement = true;
      }
      newState.achievements = updatedAch;

      return newState;
    });

    // Play sounds outside setState to avoid AudioContext issues
    if (soundTask) {
      playTaskComplete();
      if (soundCombo) setTimeout(() => playComboIncrease(), 100);
    }
    if (soundAchievement) setTimeout(() => playAchievement(), 200);
  }, [totalPurchases, totalCrafts, focusSessionsCount]);

  const purchaseReward = useCallback((rewardId: string): boolean => {
    let success = false;
    let soundPurchase = false;
    let soundAchievement = false;

    setState(prev => {
      const reward = prev.rewards.find(r => r.id === rewardId);
      if (!reward) return prev;
      if (prev.money < reward.cost) return prev;
      for (const r of reward.resources) {
        if ((prev.resources[r.resourceId] ?? 0) < r.amount) return prev;
      }
      const cd = prev.rewardCooldowns[rewardId];
      if (cd && cd > Date.now()) return prev;

      const newResources = { ...prev.resources };
      for (const r of reward.resources) newResources[r.resourceId] -= r.amount;
      const newCooldowns = { ...prev.rewardCooldowns };
      if (reward.cooldownMs > 0) newCooldowns[rewardId] = Date.now() + reward.cooldownMs;

      const isCraft = reward.resources.length > 0;
      const redeemable: Redeemable = {
        id: crypto.randomUUID(),
        rewardName: reward.name,
        rewardDescription: reward.description,
        purchasedAt: Date.now(),
      };

      const notifications = pushNotification(prev.notifications, {
        type: 'purchase',
        title: isCraft ? 'CRAFTED' : 'PURCHASED',
        message: reward.name,
        color: '#00e0ff',
        icon: 'purchase',
      });
      if (prev.settings.soundEnabled) soundPurchase = true;

      success = true;
      const newTotalPurchases = totalPurchases + 1;
      const newTotalCrafts = isCraft ? totalCrafts + 1 : totalCrafts;
      setTotalPurchases(newTotalPurchases);
      if (isCraft) setTotalCrafts(newTotalCrafts);
      localStorage.setItem('killOs_totalPurchases', String(newTotalPurchases));
      if (isCraft) localStorage.setItem('killOs_totalCrafts', String(newTotalCrafts));

      const newState = {
        ...prev,
        money: prev.money - reward.cost,
        totalMoneySpent: prev.totalMoneySpent + reward.cost,
        resources: newResources,
        rewardCooldowns: newCooldowns,
        redeemables: [...prev.redeemables, redeemable],
        notifications,
      };

      const { achievements: updatedAch, newlyUnlocked } = checkAchievements(prev.achievements, newState, prev.totalTasksCompleted, newTotalPurchases, newTotalCrafts, focusSessionsCount, 'purchase');
      if (newlyUnlocked.length > 0) {
        for (const ua of newlyUnlocked) {
          newState.notifications = pushNotification(newState.notifications, { type: 'achievement', title: 'ACHIEVEMENT UNLOCKED', message: ua.name, color: ua.color, icon: 'achievement' });
        }
        if (prev.settings.soundEnabled) soundAchievement = true;
      }
      newState.achievements = updatedAch;

      return newState;
    });

    if (soundPurchase) playPurchase();
    if (soundAchievement) setTimeout(() => playAchievement(), 200);
    return success;
  }, [totalPurchases, totalCrafts, focusSessionsCount]);

  const redeemItem = useCallback((redeemableId: string) => {
    let soundRedeem = false;
    let soundAchievement = false;
    setState(prev => {
      const item = prev.redeemables.find(r => r.id === redeemableId);
      if (!item) return prev;
      if (prev.settings.soundEnabled) soundRedeem = true;
      const newState = {
        ...prev,
        redeemables: prev.redeemables.filter(r => r.id !== redeemableId),
        notifications: pushNotification(prev.notifications, { type: 'redeem', title: 'REDEEMED', message: item.rewardName, color: '#33ffcc', icon: 'redeem' }),
      };
      const { achievements: updatedAch, newlyUnlocked } = checkAchievements(prev.achievements, newState, prev.totalTasksCompleted, totalPurchases, totalCrafts, focusSessionsCount, 'redeem');
      if (newlyUnlocked.length > 0) {
        for (const ua of newlyUnlocked) {
          newState.notifications = pushNotification(newState.notifications, { type: 'achievement', title: 'ACHIEVEMENT UNLOCKED', message: ua.name, color: ua.color, icon: 'achievement' });
        }
        if (prev.settings.soundEnabled) soundAchievement = true;
      }
      newState.achievements = updatedAch;
      return newState;
    });
    if (soundRedeem) playRedeem();
    if (soundAchievement) setTimeout(() => playAchievement(), 200);
  }, [totalPurchases, totalCrafts, focusSessionsCount]);

  const endDay = useCallback(() => {
    let soundRank = false;
    setState(prev => {
      const today = getTodayKey();
      const totalTasks = prev.tasks.reduce((s, t) => s + t.dailyTarget, 0);
      const completedTasks = prev.tasks.reduce((s, t) => s + Math.min(prev.progress[t.id] ?? 0, t.dailyTarget), 0);
      const percent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const rank = getRank(percent);
      const baseMoney = RANK_MONEY_REWARD[rank.rank] ?? 50;
      const comboBonus = Math.round(baseMoney * (prev.combo.peakToday - 1) * 0.3);
      const completionBonus = Math.round(baseMoney * (percent / 100) * 0.2);
      const streakBonus = prev.streak.dailyStreak * 10;
      const totalMoneyEarned = baseMoney + comboBonus + completionBonus + streakBonus;

      const summary: DaySummary = {
        date: today,
        rank: rank.rank,
        tasksCompleted: completedTasks,
        totalTasks,
        comboPeak: prev.combo.peakToday,
        totalXP: prev.totalPointsToday,
        moneyEarned: totalMoneyEarned,
        resourcesEarned: [],
        streakDay: prev.streak.dailyStreak,
        sssStreak: prev.streak.sssStreak,
      };

      const isSSS = rank.rank === 'SSS';
      const newSssStreak = isSSS ? prev.streak.sssStreak + 1 : 0;

      const calDay: CalendarDay = {
        date: today,
        rank: rank.rank,
        tasksCompleted: completedTasks,
        totalTasks,
        comboPeak: prev.combo.peakToday,
        totalXP: prev.totalPointsToday,
      };

      setDaySummary(summary);
      if (prev.settings.soundEnabled) soundRank = true;

      return {
        ...prev,
        money: prev.money + totalMoneyEarned,
        totalMoneyEarned: prev.totalMoneyEarned + totalMoneyEarned,
        streak: { ...prev.streak, sssStreak: newSssStreak },
        calendar: { ...prev.calendar, [today]: calDay },
        daySummarized: true,
        notifications: pushNotification(prev.notifications, { type: 'rank', title: 'DAY COMPLETE', message: `Rank: ${rank.rank} | +${totalMoneyEarned} money`, color: rank.color, icon: 'rank' }),
      };
    });
    if (soundRank) playRankUp();
  }, []);

  const resetDay = useCallback(() => {
    setState(prev => ({
      ...prev,
      progress: {},
      combo: { multiplier: 1.0, lastActionAt: null, comboWindowMs: prev.settings.comboWindowMinutes * 60000, peakToday: 1.0 },
      timeline: [],
      totalPointsToday: 0,
      rewardCooldowns: {},
      daySummarized: false,
    }));
    setComboTimeLeft(0);
    setDaySummary(null);
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem('killOs_v3_state');
    localStorage.removeItem('killOs_totalPurchases');
    localStorage.removeItem('killOs_totalCrafts');
    localStorage.removeItem('killOs_focusSessions');
    localStorage.removeItem('killOs_pomodoroCount');
    localStorage.removeItem('killOs_deepworkCount');
    window.location.reload();
  }, []);

  // Task management
  const addTask = useCallback((task: TaskDefinition) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setState(prev => {
      const { [taskId]: _removed, ...restProgress } = prev.progress;
      void _removed;
      return { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId), progress: restProgress };
    });
  }, []);

  const updateTask = useCallback((task: TaskDefinition) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) }));
  }, []);

  const addCategory = useCallback((category: CategoryDefinition) => {
    setState(prev => ({ ...prev, categories: [...prev.categories, category] }));
  }, []);

  const updateCategory = useCallback((category: CategoryDefinition, previousName?: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === category.id ? category : c),
      tasks: previousName && previousName !== category.name
        ? prev.tasks.map(t => t.category === previousName ? { ...t, category: category.name } : t)
        : prev.tasks,
    }));
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    setState(prev => {
      const category = prev.categories.find(c => c.id === categoryId);
      if (!category || prev.categories.length <= 1) return prev;
      const fallback = prev.categories.find(c => c.id !== categoryId) ?? prev.categories[0];
      return {
        ...prev,
        categories: prev.categories.filter(c => c.id !== categoryId),
        tasks: prev.tasks.map(t => t.category === category.name ? { ...t, category: fallback.name } : t),
      };
    });
  }, []);

  const addTaskColorPreset = useCallback((color: string) => {
    setState(prev => {
      if (prev.taskColorPresets.some(c => c.toLowerCase() === color.toLowerCase())) return prev;
      return { ...prev, taskColorPresets: [...prev.taskColorPresets, color] };
    });
  }, []);

  const removeTaskColorPreset = useCallback((color: string) => {
    setState(prev => {
      if (prev.taskColorPresets.length <= 1) return prev;
      return { ...prev, taskColorPresets: prev.taskColorPresets.filter(c => c.toLowerCase() !== color.toLowerCase()) };
    });
  }, []);

  const updateDashboardWidgets = useCallback((widgets: DashboardWidgetConfig[]) => {
    setState(prev => ({ ...prev, dashboardWidgets: widgets }));
  }, []);

  // Reward management
  const addReward = useCallback((reward: StoreReward) => {
    setState(prev => ({ ...prev, rewards: [...prev.rewards, reward] }));
  }, []);

  const removeReward = useCallback((rewardId: string) => {
    setState(prev => ({ ...prev, rewards: prev.rewards.filter(r => r.id !== rewardId) }));
  }, []);

  const updateReward = useCallback((reward: StoreReward) => {
    setState(prev => ({ ...prev, rewards: prev.rewards.map(r => r.id === reward.id ? reward : r) }));
  }, []);

  // Insights
  const addPlatform = useCallback((platform: InsightPlatform) => {
    setState(prev => ({ ...prev, insightPlatforms: [...prev.insightPlatforms, platform] }));
  }, []);

  const removePlatform = useCallback((platformId: string) => {
    setState(prev => ({
      ...prev,
      insightPlatforms: prev.insightPlatforms.filter(p => p.id !== platformId),
      insightEntries: prev.insightEntries.filter(e => e.platformId !== platformId),
    }));
  }, []);

  const addInsightEntry = useCallback((entry: InsightEntry) => {
    setState(prev => {
      const filtered = prev.insightEntries.filter(e => !(e.platformId === entry.platformId && e.metricId === entry.metricId && e.date === entry.date));
      return { ...prev, insightEntries: [...filtered, entry] };
    });
  }, []);

  // Settings
  const updateSettings = useCallback((settings: Partial<AppState['settings']>) => {
    setState(prev => {
      const newSettings = { ...prev.settings, ...settings };
      const newComboWindow = settings.comboWindowMinutes !== undefined ? settings.comboWindowMinutes * 60000 : prev.combo.comboWindowMs;
      return { ...prev, settings: newSettings, combo: { ...prev.combo, comboWindowMs: newComboWindow } };
    });
  }, []);

  // Focus
  const updateFocusSession = useCallback((session: FocusSession) => {
    setState(prev => ({ ...prev, focusSession: session }));
  }, []);

  const addFocusTime = useCallback((ms: number, sessionType: FocusSession['type'] = 'pomodoro') => {
    const moneyPerMinute = 2;
    const minutes = ms / 60000;
    const focusMoney = Math.round(moneyPerMinute * minutes);
    const newSessions = focusSessionsCount + 1;
    setFocusSessionsCount(newSessions);
    localStorage.setItem('killOs_focusSessions', String(newSessions));

    // Track session type completions
    if (sessionType === 'pomodoro') {
      const n = Number(localStorage.getItem('killOs_pomodoroCount') ?? '0') + 1;
      localStorage.setItem('killOs_pomodoroCount', String(n));
    }
    if (sessionType === 'deepwork') {
      const n = Number(localStorage.getItem('killOs_deepworkCount') ?? '0') + 1;
      localStorage.setItem('killOs_deepworkCount', String(n));
    }

    let soundFocus = false;
    let soundAchievement = false;
    setState(prev => {
      const newResources = { ...prev.resources };
      for (const rd of RESOURCE_DEFS) {
        if (rd.rarity === 'common' && Math.random() < 0.3 * (minutes / 25)) {
          newResources[rd.id] = (newResources[rd.id] ?? 0) + 1;
        } else if (rd.rarity === 'uncommon' && Math.random() < 0.1 * (minutes / 25)) {
          newResources[rd.id] = (newResources[rd.id] ?? 0) + 1;
        } else if (rd.rarity === 'rare' && Math.random() < 0.02 * (minutes / 25)) {
          newResources[rd.id] = (newResources[rd.id] ?? 0) + 1;
        }
      }
      if (prev.settings.soundEnabled) soundFocus = true;
      const newState = {
        ...prev,
        money: prev.money + focusMoney,
        totalMoneyEarned: prev.totalMoneyEarned + focusMoney,
        resources: newResources,
        focusTotalMs: prev.focusTotalMs + ms,
        notifications: pushNotification(prev.notifications, { type: 'focus', title: 'FOCUS COMPLETE', message: `+${focusMoney} money + resources`, color: '#00e0ff', icon: 'focus' }),
      };
      const { achievements: updatedAch, newlyUnlocked } = checkAchievements(prev.achievements, newState, prev.totalTasksCompleted, totalPurchases, totalCrafts, newSessions, 'focus');
      if (newlyUnlocked.length > 0) {
        for (const ua of newlyUnlocked) {
          newState.notifications = pushNotification(newState.notifications, { type: 'achievement', title: 'ACHIEVEMENT UNLOCKED', message: ua.name, color: ua.color, icon: 'achievement' });
        }
        if (prev.settings.soundEnabled) soundAchievement = true;
      }
      newState.achievements = updatedAch;
      return newState;
    });
    if (soundFocus) playFocusComplete();
    if (soundAchievement) setTimeout(() => playAchievement(), 200);
  }, [focusSessionsCount, totalPurchases, totalCrafts]);

  // Dev tools
  const devAddMoney = useCallback((amount: number) => {
    setState(prev => ({ ...prev, money: prev.money + amount, totalMoneyEarned: prev.totalMoneyEarned + amount }));
  }, []);

  const devAddResource = useCallback((resourceId: string, amount: number) => {
    setState(prev => ({ ...prev, resources: { ...prev.resources, [resourceId]: (prev.resources[resourceId] ?? 0) + amount } }));
  }, []);

  const devCompleteTask = useCallback((taskId: string) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      return { ...prev, progress: { ...prev.progress, [taskId]: task.dailyTarget } };
    });
  }, []);

  const devSetCombo = useCallback((multiplier: number) => {
    setState(prev => ({ ...prev, combo: { ...prev.combo, multiplier, lastActionAt: multiplier > 1 ? Date.now() : null, peakToday: Math.max(prev.combo.peakToday, multiplier) } }));
  }, []);

  const devResetMonth = useCallback(() => {
    setState(prev => ({ ...prev, calendar: {} }));
  }, []);

  const resetAchievements = useCallback(() => {
    setState(prev => ({
      ...prev,
      achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null, progress: 0 })),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
  }, []);

  const dismissDaySummary = useCallback(() => { setDaySummary(null); }, []);

  const totalTasks = state.tasks.reduce((s, t) => s + t.dailyTarget, 0);
  const completedTasks = state.tasks.reduce((s, t) => s + Math.min(state.progress[t.id] ?? 0, t.dailyTarget), 0);

  return {
    state, comboTimeLeft, completeTask, resetDay, endDay, resetAll,
    totalTasks, completedTasks,
    purchaseReward, addReward, removeReward, updateReward,
    redeemItem,
    addTask, removeTask, updateTask,
    addCategory, updateCategory, removeCategory,
    addTaskColorPreset, removeTaskColorPreset,
    updateDashboardWidgets,
    addPlatform, removePlatform, addInsightEntry,
    updateSettings,
    updateFocusSession, addFocusTime,
    devAddMoney, devAddResource, devCompleteTask, devSetCombo, devResetMonth, resetAchievements,
    daySummary, dismissDaySummary,
    dismissNotification,
  };
}
