import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Flame, Crown } from 'lucide-react';
import type { CalendarDay, StreakData } from '../types';
import { RANK_THRESHOLDS } from '../constants';

interface CalendarViewProps {
  calendar: Record<string, CalendarDay>;
  streak: StreakData;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function CalendarView({ calendar, streak }: CalendarViewProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getRankColor = (rank: string): string => {
    const def = RANK_THRESHOLDS.find(r => r.rank === rank);
    return def ? def.color : '#333333';
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Count SSS days this month
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const sssDaysThisMonth = Object.entries(calendar).filter(([d, v]) => d.startsWith(monthPrefix) && v.rank === 'SSS').length;
  const totalDaysThisMonth = Object.entries(calendar).filter(([d]) => d.startsWith(monthPrefix)).length;

  return (
    <div className="space-y-5">
      <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        CALENDAR
      </h2>

      {/* Streak display */}
      <div className="flex gap-3">
        <div
          className="flex-1 rounded-lg p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,136,0,0.06)', border: '1px solid rgba(255,136,0,0.2)' }}
        >
          <Flame size={18} style={{ color: '#ff8800' }} />
          <div>
            <div className="text-[9px] tracking-widest" style={{ color: 'rgba(255,136,0,0.6)' }}>DAILY STREAK</div>
            <div className="text-xl font-black tabular-nums" style={{ color: '#ff8800', textShadow: '0 0 8px rgba(255,136,0,0.5)' }}>
              {streak.dailyStreak}
            </div>
          </div>
        </div>
        <div
          className="flex-1 rounded-lg p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,46,209,0.06)', border: '1px solid rgba(255,46,209,0.2)' }}
        >
          <Crown size={18} style={{ color: '#ff2ed1' }} />
          <div>
            <div className="text-[9px] tracking-widest" style={{ color: 'rgba(255,46,209,0.6)' }}>SSS STREAK</div>
            <div className="text-xl font-black tabular-nums" style={{ color: '#ff2ed1', textShadow: '0 0 8px rgba(255,46,209,0.5)' }}>
              {streak.sssStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={18} /></button>
        <div className="text-center">
          <span className="font-bold text-sm tracking-widest" style={{ color: '#ffffff' }}>
            {MONTHS[viewMonth].toUpperCase()} {viewYear}
          </span>
          {totalDaysThisMonth > 0 && (
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {sssDaysThisMonth} SSS / {totalDaysThisMonth} days
            </div>
          )}
        </div>
        <button onClick={nextMonth} style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronRight size={18} /></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold tracking-widest py-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const calDay = calendar[dateStr];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const rankColor = calDay ? getRankColor(calDay.rank) : 'transparent';

          return (
            <button
              key={i}
              onClick={() => calDay && setSelectedDay(calDay)}
              className="aspect-square rounded flex flex-col items-center justify-center text-xs font-bold transition-all duration-200"
              style={{
                background: calDay ? `${rankColor}18` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${calDay ? rankColor + '44' : isToday ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.04)'}`,
                color: calDay ? rankColor : 'rgba(255,255,255,0.25)',
                textShadow: calDay ? `0 0 6px ${rankColor}` : 'none',
                cursor: calDay ? 'pointer' : 'default',
              }}
            >
              <span>{day}</span>
              {calDay && <span className="text-[9px] font-black mt-0.5">{calDay.rank}</span>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {RANK_THRESHOLDS.map(r => (
          <div key={r.rank} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: r.color, boxShadow: `0 0 4px ${r.color}` }} />
            <span className="text-[10px]" style={{ color: r.color }}>{r.rank}</span>
          </div>
        ))}
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm mx-4 rounded-xl p-6" style={{ background: '#0c0c1a', border: `1px solid ${getRankColor(selectedDay.rank)}44` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm tracking-widest" style={{ color: getRankColor(selectedDay.rank) }}>
                {selectedDay.date}
              </span>
              <button onClick={() => setSelectedDay(null)} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={18} /></button>
            </div>
            <div className="text-5xl font-black text-center mb-4" style={{ color: getRankColor(selectedDay.rank), textShadow: `0 0 20px ${getRankColor(selectedDay.rank)}` }}>
              {selectedDay.rank}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Tasks" value={`${selectedDay.tasksCompleted}/${selectedDay.totalTasks}`} />
              <DetailItem label="Combo Peak" value={`x${Math.floor(selectedDay.comboPeak).toLocaleString()}`} />
              <DetailItem label="Total XP" value={selectedDay.totalXP.toLocaleString()} />
              <DetailItem label="Completion" value={`${selectedDay.totalTasks > 0 ? Math.round((selectedDay.tasksCompleted / selectedDay.totalTasks) * 100) : 0}%`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-[10px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <div className="font-bold text-sm" style={{ color: '#ffffff' }}>{value}</div>
    </div>
  );
}
