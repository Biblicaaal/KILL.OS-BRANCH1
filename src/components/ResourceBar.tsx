import { Coins } from 'lucide-react';
import { RESOURCE_DEFS } from '../constants';

interface ResourceBarProps {
  money: number;
  resources: Record<string, number>;
  sidebarWidth: number;
}

export function ResourceBar({ money, resources, sidebarWidth }: ResourceBarProps) {
  const visibleResources = RESOURCE_DEFS.filter(rd => (resources[rd.id] ?? 0) > 0);

  return (
    <div
      className="fixed top-0 z-30 flex items-center gap-3 px-4 h-10 overflow-x-auto"
      style={{
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        background: 'rgba(6,6,16,0.9)',
        borderBottom: '1px solid rgba(0,224,255,0.1)',
        backdropFilter: 'blur(8px)',
        transition: 'left 0.3s, width 0.3s',
        scrollbarWidth: 'none',
      }}
    >
      {/* Money */}
      <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded" style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)' }}>
        <Coins size={12} style={{ color: '#ffcc00' }} />
        <span className="text-xs font-bold tabular-nums" style={{ color: '#ffcc00' }}>{money.toLocaleString()}</span>
      </div>

      {/* Resources */}
      {visibleResources.map(rd => (
        <div
          key={rd.id}
          className="flex items-center gap-1 shrink-0 px-2 py-1 rounded"
          style={{ background: `${rd.color}0d`, border: `1px solid ${rd.color}22` }}
        >
          <span className="text-xs" style={{ color: rd.color }}>{rd.icon}</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: rd.color }}>{resources[rd.id]}</span>
        </div>
      ))}
    </div>
  );
}
