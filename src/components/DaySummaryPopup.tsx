import { X, Zap, Coins, Flame, Award, TrendingUp } from 'lucide-react';
import type { DaySummary } from '../types';
import { RANK_THRESHOLDS } from '../constants';

interface DaySummaryPopupProps {
  summary: DaySummary;
  onDismiss: () => void;
}

export function DaySummaryPopup({ summary, onDismiss }: DaySummaryPopupProps) {
  const rankDef = RANK_THRESHOLDS.find(r => r.rank === summary.rank) ?? RANK_THRESHOLDS[0];
  const percent = summary.totalTasks > 0 ? Math.round((summary.tasksCompleted / summary.totalTasks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0c0c1a 0%, #080814 100%)',
          border: `1px solid ${rankDef.color}44`,
          boxShadow: `0 0 60px ${rankDef.color}33, 0 0 120px ${rankDef.color}11`,
        }}
      >
        {/* Close */}
        <button onClick={onDismiss} className="absolute top-3 right-3 z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <X size={18} />
        </button>

        {/* Header glow */}
        <div
          className="h-32 flex items-center justify-center relative"
          style={{
            background: `radial-gradient(ellipse at center, ${rankDef.color}22 0%, transparent 70%)`,
          }}
        >
          <div
            className="text-7xl font-black"
            style={{
              color: rankDef.color,
              textShadow: `0 0 40px ${rankDef.color}, 0 0 80px ${rankDef.color}66`,
              letterSpacing: '0.05em',
            }}
          >
            {summary.rank}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="font-bold text-lg tracking-widest" style={{ color: '#ffffff' }}>
              DAY COMPLETE
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {summary.date}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <SummaryStat icon={<Award size={14} />} label="Tasks" value={`${summary.tasksCompleted}/${summary.totalTasks}`} color="#00e0ff" />
            <SummaryStat icon={<TrendingUp size={14} />} label="Completion" value={`${percent}%`} color={rankDef.color} />
            <SummaryStat icon={<Zap size={14} />} label="Combo Peak" value={`x${Math.floor(summary.comboPeak).toLocaleString()}`} color="#ffcc00" />
            <SummaryStat icon={<Flame size={14} />} label="Daily Streak" value={`${summary.streakDay} days`} color="#ff8800" />
            <SummaryStat icon={<Zap size={14} />} label="Total XP" value={summary.totalXP.toLocaleString()} color="#33ffcc" />
            <SummaryStat icon={<Award size={14} />} label="SSS Streak" value={`${summary.sssStreak} days`} color="#ff2ed1" />
          </div>

          {/* Money earned */}
          <div
            className="rounded-lg p-4 text-center mb-4"
            style={{
              background: 'rgba(255,204,0,0.08)',
              border: '1px solid rgba(255,204,0,0.25)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins size={16} style={{ color: '#ffcc00' }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,204,0,0.7)' }}>
                MONEY EARNED
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: '#ffcc00', textShadow: '0 0 16px rgba(255,204,0,0.6)' }}>
              +{summary.moneyEarned}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-lg font-bold text-sm tracking-widest transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${rankDef.color}33, ${rankDef.color}22)`,
              border: `1px solid ${rankDef.color}55`,
              color: rankDef.color,
              textShadow: `0 0 8px ${rankDef.color}`,
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="rounded p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      </div>
      <div className="font-bold text-sm" style={{ color }}>{value}</div>
    </div>
  );
}
