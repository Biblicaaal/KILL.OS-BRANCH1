import { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, BarChart3, ShoppingBag, Calendar, Lightbulb, Package, Award, Settings, Bug, RotateCcw, Zap, Flame, Timer } from 'lucide-react';
import type { TabId } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onReset: () => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  rank: string;
  rankColor: string;
  completionPercent: number;
  dailyStreak: number;
  money: number;
}

const TAB_CONFIG: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'focus', label: 'Focus', icon: <Timer size={16} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
  { id: 'store', label: 'Store', icon: <ShoppingBag size={16} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
  { id: 'insights', label: 'Insights', icon: <Lightbulb size={16} /> },
  { id: 'inventory', label: 'Inventory', icon: <Package size={16} /> },
  { id: 'achievements', label: 'Awards', icon: <Award size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  { id: 'devtools', label: 'DevTools', icon: <Bug size={16} /> },
];

export function Sidebar({
  collapsed,
  onToggle,
  onReset,
  activeTab,
  onTabChange,
  rank,
  rankColor,
  completionPercent,
  dailyStreak,
  money,
}: SidebarProps) {
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    if (resetConfirm) {
      onReset();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const w = collapsed ? 70 : 220;

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: w,
        background: 'linear-gradient(180deg, #0a0a0f 0%, #060610 100%)',
        borderRight: '1px solid rgba(0,224,255,0.15)',
        boxShadow: '2px 0 20px rgba(0,224,255,0.05)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,224,255,0.1)' }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded"
          style={{
            width: 34,
            height: 34,
            background: 'rgba(255,46,209,0.15)',
            border: '1px solid rgba(255,46,209,0.4)',
            boxShadow: '0 0 12px rgba(255,46,209,0.3)',
          }}
        >
          <Zap size={16} color="#ff2ed1" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-xs tracking-widest" style={{ color: '#ff2ed1', textShadow: '0 0 8px rgba(255,46,209,0.6)' }}>
              KILL.OS
            </div>
            <div className="text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              PRODUCTIVITY
            </div>
          </div>
        )}
      </div>

      {/* Rank + streak + money */}
      {!collapsed && (
        <div className="mx-3 my-3 space-y-2 shrink-0">
          <div
            className="px-3 py-2.5 rounded flex items-center gap-3"
            style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${rankColor}44` }}
          >
            <div className="text-xl font-black" style={{ color: rankColor, textShadow: `0 0 12px ${rankColor}` }}>
              {rank}
            </div>
            <div className="flex-1">
              <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>RANK</div>
              <div className="h-1 rounded-full overflow-hidden mt-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completionPercent}%`,
                    background: `linear-gradient(90deg, ${rankColor}, ${rankColor}aa)`,
                    boxShadow: `0 0 4px ${rankColor}`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded" style={{ background: 'rgba(255,136,0,0.08)', border: '1px solid rgba(255,136,0,0.2)' }}>
              <Flame size={10} style={{ color: '#ff8800' }} />
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#ff8800' }}>{dailyStreak}</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded" style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)' }}>
              <span className="text-[10px]" style={{ color: '#ffcc00' }}>$</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#ffcc00' }}>{money.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 mt-1 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {TAB_CONFIG.map(tab => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            collapsed={collapsed}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            isDev={tab.id === 'devtools'}
          />
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 pb-3 shrink-0 flex flex-col gap-1.5">
        <button
          onClick={handleReset}
          className="flex items-center gap-3 w-full px-3 py-2 rounded transition-all duration-200"
          style={{
            background: resetConfirm ? 'rgba(255,46,46,0.15)' : 'rgba(255,255,255,0.04)',
            border: resetConfirm ? '1px solid rgba(255,46,46,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: resetConfirm ? '#ff4444' : 'rgba(255,255,255,0.35)',
            fontSize: 11,
          }}
        >
          <RotateCcw size={14} className={resetConfirm ? 'animate-spin' : ''} style={{ animationDuration: '1s' }} />
          {!collapsed && <span>{resetConfirm ? 'CONFIRM?' : 'RESET DAY'}</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-1.5 rounded transition-all duration-200"
          style={{
            background: 'rgba(0,224,255,0.05)',
            border: '1px solid rgba(0,224,255,0.15)',
            color: 'rgba(0,224,255,0.5)',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  isDev?: boolean;
}

function NavItem({ icon, label, collapsed, active, onClick, isDev }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded transition-all duration-200 w-full text-left"
      style={{
        background: active ? 'rgba(0,224,255,0.1)' : 'transparent',
        border: active ? '1px solid rgba(0,224,255,0.2)' : '1px solid transparent',
        color: active ? '#00e0ff' : isDev ? 'rgba(255,68,68,0.4)' : 'rgba(255,255,255,0.4)',
        boxShadow: active ? '0 0 8px rgba(0,224,255,0.08)' : 'none',
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.05em',
      }}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span>{label.toUpperCase()}</span>}
    </button>
  );
}
