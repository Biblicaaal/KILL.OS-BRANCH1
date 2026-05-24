import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import type { TimelineEntry } from '../types';

interface RightPanelProps {
  open: boolean;
  onToggle: () => void;
  timeline: TimelineEntry[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function timeSince(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function RightPanel({ open, onToggle, timeline }: RightPanelProps) {
  const PANEL_WIDTH = 280;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-1/2 z-50 flex items-center justify-center rounded-l transition-all duration-300"
        style={{
          right: open ? PANEL_WIDTH : 0,
          transform: 'translateY(-50%)',
          width: 24,
          height: 48,
          background: 'rgba(0,224,255,0.12)',
          border: '1px solid rgba(0,224,255,0.3)',
          borderRight: 'none',
          color: '#00e0ff',
        }}
      >
        {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Panel */}
      <div
        className="fixed top-0 bottom-0 z-40 flex flex-col"
        style={{
          right: 0,
          width: PANEL_WIDTH,
          transform: `translateX(${open ? 0 : PANEL_WIDTH}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(180deg, #080812 0%, #060610 100%)',
          borderLeft: '1px solid rgba(0,224,255,0.15)',
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,224,255,0.1)' }}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: '#00e0ff' }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: '#00e0ff' }}>
              ACTIVITY FEED
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,224,255,0.2) transparent' }}>
          {timeline.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <div className="text-sm">NO ACTIVITY YET</div>
              <div className="text-xs mt-1">Complete tasks to see timeline</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {timeline.map((entry, i) => (
                <TimelineItem key={entry.id} entry={entry} isLatest={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface TimelineItemProps {
  entry: TimelineEntry;
  isLatest: boolean;
}

function TimelineItem({ entry, isLatest }: TimelineItemProps) {
  return (
    <div
      className="rounded p-3 relative overflow-hidden"
      style={{
        background: isLatest ? `${entry.taskColor}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isLatest ? entry.taskColor + '44' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isLatest ? `0 0 12px ${entry.taskColor}22` : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-bold text-xs tracking-wider" style={{ color: entry.taskColor }}>
          {entry.taskName.toUpperCase()}
        </div>
        <div className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {timeSince(entry.completedAt)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {formatTime(entry.completedAt)}
        </div>
        <div className="flex items-center gap-2">
          {entry.comboMultiplier > 1 && (
            <span
              className="text-xs font-bold"
              style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.6)' }}
            >
              x{Math.floor(entry.comboMultiplier).toLocaleString()}
            </span>
          )}
          <span
            className="font-black text-sm"
            style={{ color: '#ffffff', textShadow: `0 0 8px ${entry.taskColor}` }}
          >
            +{entry.pointsEarned}
          </span>
        </div>
      </div>
    </div>
  );
}
