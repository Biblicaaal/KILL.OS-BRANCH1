import { useState } from 'react';
import { Award, Flame, Crown, Target, Zap, Coins, Shield, Timer, Brain, Sparkles, ShoppingBag, Hammer, CalendarCheck, TrendingUp } from 'lucide-react';
import type { Achievement } from '../types';

interface AchievementsViewProps {
  achievements: Achievement[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  flame: <Flame size={16} />,
  crown: <Crown size={16} />,
  target: <Target size={16} />,
  zap: <Zap size={16} />,
  coins: <Coins size={16} />,
  award: <Award size={16} />,
  shield: <Shield size={16} />,
  timer: <Timer size={16} />,
  brain: <Brain size={16} />,
  sparkles: <Sparkles size={16} />,
  'shopping-bag': <ShoppingBag size={16} />,
  'shopping-cart': <ShoppingBag size={16} />,
  hammer: <Hammer size={16} />,
  'calendar-check': <CalendarCheck size={16} />,
  'trending-up': <TrendingUp size={16} />,
  'check-circle': <Target size={16} />,
  link: <Zap size={16} />,
  clock: <Timer size={16} />,
  gem: <Sparkles size={16} />,
  gift: <Award size={16} />,
  package: <ShoppingBag size={16} />,
  sun: <Zap size={16} />,
  moon: <Zap size={16} />,
  heart: <Flame size={16} />,
};

const CATEGORIES = ['Productivity', 'Combo', 'Streaks', 'Economy', 'Focus', 'Special'];

export function AchievementsView({ achievements }: AchievementsViewProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const unlocked = filtered.filter(a => a.unlockedAt !== null);
  const locked = filtered.filter(a => a.unlockedAt === null);
  const totalUnlocked = achievements.filter(a => a.unlockedAt !== null).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          ACHIEVEMENTS
        </h2>
        <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {totalUnlocked}/{achievements.length}
        </span>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        {CATEGORIES.map(c => (
          <FilterBtn key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
        ))}
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <div className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#ffcc00' }}>
            UNLOCKED ({unlocked.length})
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {unlocked.map(a => <AchievementCard key={a.id} achievement={a} unlocked />)}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <div className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            LOCKED ({locked.length})
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {locked.map(a => <AchievementCard key={a.id} achievement={a} unlocked={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest transition-all duration-200"
      style={{
        background: active ? 'rgba(0,224,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#00e0ff' : 'rgba(255,255,255,0.3)',
      }}
    >
      {label.toUpperCase()}
    </button>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const icon = ICON_MAP[achievement.icon] ?? <Award size={16} />;
  const progress = achievement.progressTarget ? Math.min((achievement.progress ?? 0) / achievement.progressTarget, 1) : 0;

  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3 transition-all duration-300"
      style={{
        background: unlocked ? `${achievement.color}0d` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${unlocked ? achievement.color + '44' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: unlocked ? `0 0 12px ${achievement.color}15` : 'none',
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded"
        style={{
          background: unlocked ? `${achievement.color}22` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${unlocked ? achievement.color + '44' : 'rgba(255,255,255,0.08)'}`,
          color: unlocked ? achievement.color : 'rgba(255,255,255,0.2)',
          textShadow: unlocked ? `0 0 8px ${achievement.color}` : 'none',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs tracking-wider truncate" style={{ color: unlocked ? achievement.color : 'rgba(255,255,255,0.3)' }}>
          {achievement.name.toUpperCase()}
        </div>
        <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {achievement.description}
        </div>
        {!unlocked && achievement.progressTarget && achievement.progressTarget > 1 && (
          <div className="mt-1">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress * 100}%`,
                  background: achievement.color,
                  boxShadow: `0 0 4px ${achievement.color}`,
                }}
              />
            </div>
            <div className="text-[8px] tabular-nums mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {achievement.progress ?? 0}/{achievement.progressTarget}
            </div>
          </div>
        )}
        {unlocked && achievement.unlockedAt && (
          <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
