import { useRef, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { RANK_THRESHOLDS, getRank, getNextRank } from '../constants';

interface ProgressBarProps {
  completionPercent: number;
  comboMultiplier: number;
  comboTimeLeft: number;
  comboWindowMs: number;
  totalPoints: number;
  sidebarWidth: number;
}

// Get rank index (0-6) for intensity scaling
function getRankIndex(rank: string): number {
  const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  return ranks.indexOf(rank);
}

export function ProgressBar({
  completionPercent,
  comboMultiplier,
  comboTimeLeft,
  comboWindowMs,
  totalPoints,
  sidebarWidth,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const currentRank = getRank(completionPercent);
  const nextRank = getNextRank(completionPercent);
  const comboValue = Math.floor(comboMultiplier);
  const isComboActive = comboValue > 1;
  const rankIndex = getRankIndex(currentRank.rank);

  // Generate particles based on rank (more particles for higher ranks)
  const particles = useMemo(() => {
    const count = Math.max(3, rankIndex * 4); // 3 particles at F, up to 24 at S
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 2 + Math.random() * (rankIndex > 4 ? 4 : 2),
    }));
  }, [rankIndex]);

  const comboTimeSec = Math.ceil(comboTimeLeft / 1000);
  const comboMinutes = Math.floor(comboTimeSec / 60);
  const comboSecs = comboTimeSec % 60;
  const comboProgress = comboWindowMs > 0 ? (comboTimeLeft / comboWindowMs) * 100 : 0;

  // Calculate tasks needed for next rank
  const tasksToNext = (() => {
    if (!nextRank) return null;
    const pctNeeded = nextRank.minPercent - completionPercent;
    return pctNeeded;
  })();

  // Glow intensity based on rank
  const glowIntensity = 0.3 + (rankIndex / 6) * 0.7; // 0.3 at F, 1.0 at S
  const pulseSpeed = 3 - (rankIndex / 6) * 1.5; // 3s at F, 1.5s at S

  return (
    <div
      className="fixed bottom-0 z-30 flex flex-col"
      style={{
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        background: 'rgba(6,6,16,0.95)',
        borderTop: '1px solid rgba(0,224,255,0.2)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
        transition: 'left 0.3s, width 0.3s',
      }}
    >
      {/* Ambient glow that intensifies with rank */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 85% 100%, ${currentRank.color}${Math.round(glowIntensity * 25).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
          opacity: glowIntensity,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: 0,
              width: p.size,
              height: p.size,
              background: currentRank.color,
              boxShadow: `0 0 ${p.size * 2}px ${currentRank.color}`,
              animation: `float-up ${p.duration}s ease-out infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.6 + (rankIndex / 6) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Rank markers row */}
      <div className="relative h-5 mx-4 mt-3">
        {RANK_THRESHOLDS.map(r => (
          <div
            key={r.rank}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${r.minPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div
              className="w-px h-3"
              style={{ background: r.color, opacity: completionPercent >= r.minPercent ? 1 : 0.25 }}
            />
            <span
              className="text-[9px] font-bold mt-0.5"
              style={{
                color: completionPercent >= r.minPercent ? r.color : 'rgba(255,255,255,0.2)',
                textShadow: completionPercent >= r.minPercent ? `0 0 6px ${r.color}` : 'none',
                letterSpacing: '0.05em',
              }}
            >
              {r.rank}
            </span>
          </div>
        ))}
      </div>

      {/* Main bar */}
      <div className="mx-4 mt-1 mb-1">
        <div
          ref={barRef}
          className="relative h-6 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${completionPercent}%`,
              background: `linear-gradient(90deg, #ff2ed133, ${currentRank.color}cc, ${currentRank.color})`,
              boxShadow: `0 0 ${20 + rankIndex * 5}px ${currentRank.color}${Math.round(0.5 + glowIntensity * 0.5).toString(16)}8, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            {/* Liquid shimmer */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                animation: 'shimmer 2s linear infinite',
              }}
            />
          </div>

          {/* Rank marker lines on bar */}
          {RANK_THRESHOLDS.slice(1).map(r => (
            <div
              key={r.rank}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${r.minPercent}%`,
                background: 'rgba(255,255,255,0.2)',
              }}
            />
          ))}

          {/* Percent text */}
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-bold tracking-widest"
            style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', letterSpacing: '0.15em' }}
          >
            {completionPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Bottom info row */}
      <div className="mx-4 mb-3 flex items-center justify-between">
        {/* Points + proximity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>TODAY</span>
            <span className="font-bold text-sm tabular-nums" style={{ color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.5)' }}>
              {totalPoints.toLocaleString()} XP
            </span>
          </div>
          {tasksToNext !== null && tasksToNext > 0 && nextRank && (
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: nextRank.color, background: `${nextRank.color}11`, border: `1px solid ${nextRank.color}33` }}>
              {tasksToNext.toFixed(1)}% to {nextRank.rank}
            </span>
          )}
        </div>

        {/* Combo timer */}
        {isComboActive && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${comboProgress}%`,
                  background: 'linear-gradient(90deg, #ffcc00, #ff8800)',
                  boxShadow: '0 0 4px #ffcc00',
                }}
              />
            </div>
            <span className="text-xs tabular-nums" style={{ color: '#ffcc00', opacity: 0.7 }}>
              {comboMinutes}:{String(comboSecs).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Combo + Rank */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Zap
              size={16}
              style={{
                color: isComboActive ? '#ffcc00' : 'rgba(255,255,255,0.2)',
                filter: isComboActive ? 'drop-shadow(0 0 6px #ffcc00)' : 'none',
              }}
            />
            <span
              className="font-black text-lg tabular-nums"
              style={{
                color: isComboActive ? '#ffcc00' : 'rgba(255,255,255,0.2)',
                textShadow: isComboActive ? '0 0 12px rgba(255,204,0,0.8)' : 'none',
                letterSpacing: '-0.02em',
              }}
            >
              x{comboValue.toLocaleString()}
            </span>
          </div>

          {/* Big rank display */}
          <div
            className="relative flex items-center justify-center"
            style={{
              animation: rankIndex >= 4 ? `rank-pulse ${pulseSpeed}s ease-in-out infinite` : 'none',
            }}
          >
            {/* Outer glow ring for high ranks */}
            {rankIndex >= 3 && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `radial-gradient(circle, ${currentRank.color}${Math.round(glowIntensity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                  transform: 'scale(1.8)',
                  filter: `blur(${8 + rankIndex * 2}px)`,
                }}
              />
            )}
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `radial-gradient(circle, ${currentRank.color}30 0%, transparent 60%)`,
                transform: 'scale(1.3)',
                filter: 'blur(4px)',
              }}
            />
            <div
              className="relative text-6xl font-black px-5 py-1 rounded-xl"
              style={{
                color: currentRank.color,
                textShadow: `
                  0 0 20px ${currentRank.color},
                  0 0 40px ${currentRank.color}${Math.round(glowIntensity * 200).toString(16).padStart(2, '0')},
                  0 0 60px ${currentRank.color}${Math.round(glowIntensity * 150).toString(16).padStart(2, '0')},
                  0 0 80px ${currentRank.color}${Math.round(glowIntensity * 100).toString(16).padStart(2, '0')}
                `,
                background: `linear-gradient(180deg, ${currentRank.color}15 0%, ${currentRank.color}08 100%)`,
                border: `2px solid ${currentRank.color}${Math.round(0.3 + glowIntensity * 0.4).toString(16)}0`,
                letterSpacing: '0.05em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {currentRank.rank}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
