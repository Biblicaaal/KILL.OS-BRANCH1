import { useEffect, useState, useRef } from 'react';
import { Zap, Award, TrendingUp, ShoppingBag, Timer, Gift, CheckCircle, Sparkles } from 'lucide-react';
import type { Notification } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  task: <CheckCircle size={14} />,
  combo: <Zap size={14} />,
  rank: <TrendingUp size={14} />,
  purchase: <ShoppingBag size={14} />,
  achievement: <Award size={18} />,
  focus: <Timer size={14} />,
  redeem: <Gift size={14} />,
};

interface NotificationStackProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationStack({ notifications, onDismiss }: NotificationStackProps) {
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [achievementFlash, setAchievementFlash] = useState<string | null>(null);

  useEffect(() => {
    for (const n of notifications) {
      if (!timersRef.current.has(n.id)) {
        const isAchievement = n.type === 'achievement';
        const displayMs = isAchievement ? 6000 : 4000;
        const fadeStartMs = isAchievement ? 5500 : 3500;

        if (isAchievement) {
          setAchievementFlash(n.id);
          setTimeout(() => setAchievementFlash(null), 800);
        }

        const fadeTimer = setTimeout(() => {
          setFadingOut(prev => new Set(prev).add(n.id));
        }, fadeStartMs);
        const dismissTimer = setTimeout(() => {
          onDismiss(n.id);
          timersRef.current.delete(n.id);
          setFadingOut(prev => {
            const next = new Set(prev);
            next.delete(n.id);
            return next;
          });
        }, displayMs);
        timersRef.current.set(n.id, fadeTimer);
        setTimeout(() => dismissTimer, 0);
      }
    }
    for (const [id] of timersRef.current) {
      if (!notifications.find(n => n.id === id)) {
        timersRef.current.delete(id);
      }
    }
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Achievement full-screen flash */}
      {achievementFlash && (() => {
        const ach = notifications.find(n => n.id === achievementFlash);
        const flashColor = ach?.color ?? '#ffcc00';
        return (
          <div
            className="fixed inset-0 z-[94] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${flashColor}15 0%, transparent 70%)`,
              animation: 'achievement-flash 0.8s ease-out forwards',
            }}
          />
        );
      })()}

      <div className="fixed top-4 right-4 z-[95] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
        {notifications.slice(0, 4).map(n => {
          const isFading = fadingOut.has(n.id);
          const isAchievement = n.type === 'achievement';
          return (
            <div
              key={n.id}
              className="pointer-events-auto rounded-lg p-3 flex items-center gap-3 cursor-pointer"
              style={{
                background: isAchievement
                  ? `linear-gradient(135deg, ${n.color}18, rgba(12,12,26,0.97))`
                  : 'rgba(12,12,26,0.95)',
                border: isAchievement
                  ? `1px solid ${n.color}88`
                  : `1px solid ${n.color}55`,
                boxShadow: isAchievement
                  ? `0 0 30px ${n.color}44, 0 0 60px ${n.color}22, inset 0 0 20px ${n.color}08`
                  : `0 0 20px ${n.color}22`,
                backdropFilter: 'blur(8px)',
                animation: isAchievement
                  ? 'achievement-slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  : 'slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isFading ? 0 : 1,
                transform: isFading ? 'translateX(100%) scale(0.9)' : 'translateX(0) scale(1)',
                transition: 'opacity 0.5s, transform 0.5s',
                padding: isAchievement ? '16px' : '12px',
              }}
              onClick={() => onDismiss(n.id)}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded"
                style={{
                  width: isAchievement ? 40 : 32,
                  height: isAchievement ? 40 : 32,
                  background: isAchievement
                    ? `linear-gradient(135deg, ${n.color}33, ${n.color}11)`
                    : `${n.color}22`,
                  border: isAchievement
                    ? `1px solid ${n.color}66`
                    : `1px solid ${n.color}44`,
                  color: n.color,
                  textShadow: isAchievement
                    ? `0 0 12px ${n.color}`
                    : `0 0 6px ${n.color}`,
                  boxShadow: isAchievement ? `0 0 16px ${n.color}33` : 'none',
                }}
              >
                {isAchievement ? <Sparkles size={20} /> : (ICON_MAP[n.type] ?? <Zap size={14} />)}
              </div>
              <div className="min-w-0">
                <div
                  className="font-bold tracking-widest"
                  style={{
                    color: n.color,
                    fontSize: isAchievement ? '11px' : '10px',
                    textShadow: isAchievement ? `0 0 10px ${n.color}` : 'none',
                  }}
                >
                  {n.title}
                </div>
                <div
                  className="truncate"
                  style={{
                    color: isAchievement ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    fontSize: isAchievement ? '13px' : '12px',
                    fontWeight: isAchievement ? 700 : 400,
                  }}
                >
                  {n.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
