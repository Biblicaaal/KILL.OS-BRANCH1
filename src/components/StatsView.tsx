import { TrendingUp, Award, Zap, Flame, Coins, Clock } from 'lucide-react';
import { RANK_THRESHOLDS, getRank } from '../constants';
import type { AppState } from '../types';

interface StatsViewProps {
  state: AppState;
  completionPercent: number;
  totalTasks?: number;
  completedTasks?: number;
}

export function StatsView({ state, completionPercent }: StatsViewProps) {
  const currentRank = getRank(completionPercent);
  const totalHours = (state.focusTotalMs / 3600000).toFixed(1);

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        STATISTICS
      </h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={<Award size={18} />} label="RANK" value={currentRank.rank} color={currentRank.color} />
        <StatCard icon={<TrendingUp size={18} />} label="COMPLETION" value={`${completionPercent.toFixed(0)}%`} color="#00e0ff" />
        <StatCard icon={<Zap size={18} />} label="TOTAL XP" value={state.totalPointsToday.toLocaleString()} color="#ffcc00" />
        <StatCard icon={<Flame size={18} />} label="STREAK" value={`${state.streak.dailyStreak}d`} color="#ff8800" />
        <StatCard icon={<Coins size={18} />} label="MONEY" value={state.money.toLocaleString()} color="#ffcc00" />
        <StatCard icon={<Clock size={18} />} label="FOCUS" value={`${totalHours}h`} color="#00e0ff" />
      </div>

      {/* Task breakdown */}
      <div>
        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          TASK BREAKDOWN
        </div>
        <div className="space-y-3">
          {state.tasks.map(task => {
            const done = Math.min(state.progress[task.id] ?? 0, task.dailyTarget);
            const p = (done / task.dailyTarget) * 100;
            return (
              <div key={task.id} className="rounded p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm tracking-wider" style={{ color: task.color }}>
                    {task.name.toUpperCase()}
                  </span>
                  <span className="text-sm font-black tabular-nums" style={{ color: '#ffffff' }}>
                    {done}/{task.dailyTarget}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${p}%`,
                      background: task.color,
                      boxShadow: `0 0 6px ${task.color}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rank progression */}
      <div>
        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          RANK PROGRESSION
        </div>
        <div className="space-y-2">
          {RANK_THRESHOLDS.map(r => {
            const achieved = completionPercent >= r.minPercent;
            return (
              <div
                key={r.rank}
                className="flex items-center gap-3 rounded p-2.5"
                style={{
                  background: achieved ? `${r.color}0d` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${achieved ? r.color + '33' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div
                  className="font-black text-base w-10 text-center"
                  style={{
                    color: achieved ? r.color : 'rgba(255,255,255,0.2)',
                    textShadow: achieved ? `0 0 8px ${r.color}` : 'none',
                  }}
                >
                  {r.rank}
                </div>
                <div className="flex-1">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: achieved ? '100%' : '0%',
                        background: r.color,
                        boxShadow: `0 0 4px ${r.color}`,
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs tabular-nums" style={{ color: achieved ? r.color : 'rgba(255,255,255,0.2)', width: 32, textAlign: 'right' }}>
                  {r.minPercent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>TOTAL TASKS EVER</div>
          <div className="text-2xl font-black" style={{ color: '#ffffff' }}>{state.totalTasksCompleted}</div>
        </div>
        <div className="rounded p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>TOTAL MONEY EARNED</div>
          <div className="text-2xl font-black" style={{ color: '#ffcc00' }}>{state.totalMoneyEarned.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="rounded p-3 flex flex-col gap-1"
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}33`,
        boxShadow: `0 0 12px ${color}11`,
      }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <div className="font-black text-lg" style={{ color, textShadow: `0 0 10px ${color}` }}>{value}</div>
    </div>
  );
}
