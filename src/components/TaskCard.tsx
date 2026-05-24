import { useState } from 'react';
import {
  FileText, Cpu, PenTool, Code, Dumbbell, BookOpen, Music, Camera, Palette,
  Globe, Heart, Zap, Star, Shield, Target, Flame, Trophy, Rocket,
  Coffee, MessageCircle, Video, Briefcase, Terminal, ShoppingBag,
  Utensils, Car, Home, Smile, Eye, Plus, Check, Pencil, Trash2,
} from 'lucide-react';
import type { TaskDefinition, ResourceAmount } from '../types';
import { getResourceDef } from '../constants';

const ICON_MAP: Record<string, React.ReactNode> = {
  'file-text': <FileText size={20} />,
  'cpu': <Cpu size={20} />,
  'pen-tool': <PenTool size={20} />,
  'code': <Code size={20} />,
  'dumbbell': <Dumbbell size={20} />,
  'book-open': <BookOpen size={20} />,
  'music': <Music size={20} />,
  'camera': <Camera size={20} />,
  'palette': <Palette size={20} />,
  'globe': <Globe size={20} />,
  'heart': <Heart size={20} />,
  'zap': <Zap size={20} />,
  'star': <Star size={20} />,
  'shield': <Shield size={20} />,
  'target': <Target size={20} />,
  'flame': <Flame size={20} />,
  'trophy': <Trophy size={20} />,
  'rocket': <Rocket size={20} />,
  'coffee': <Coffee size={20} />,
  'message-circle': <MessageCircle size={20} />,
  'video': <Video size={20} />,
  'briefcase': <Briefcase size={20} />,
  'terminal': <Terminal size={20} />,
  'shopping-bag': <ShoppingBag size={20} />,
  'utensils': <Utensils size={20} />,
  'car': <Car size={20} />,
  'home': <Home size={20} />,
  'smile': <Smile size={20} />,
  'eye': <Eye size={20} />,
};

interface TaskCardProps {
  task: TaskDefinition;
  completed: number;
  comboMultiplier: number;
  categoryColor: string;
  onComplete: (taskId: string) => void;
  onEdit: (task: TaskDefinition) => void;
  onDelete: (taskId: string) => void;
  lastDrop?: ResourceAmount[];
}

export function TaskCard({ task, completed, comboMultiplier, categoryColor, onComplete, onEdit, onDelete, lastDrop }: TaskCardProps) {
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDone = completed >= task.dailyTarget;
  const percent = Math.min((completed / task.dailyTarget) * 100, 100);
  const effectiveValue = Math.round(task.baseValue * comboMultiplier);
  const catColor = categoryColor;

  const handleClick = () => {
    if (isDone) return;
    setPressed(true);
    setFlash(true);
    setTimeout(() => setPressed(false), 150);
    setTimeout(() => setFlash(false), 400);
    onComplete(task.id);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden transition-all duration-300"
      style={{
        background: flash
          ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, ${task.color}22 100%)`
          : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${isDone ? task.color + '66' : task.color + '33'}`,
        boxShadow: isDone
          ? `0 0 20px ${task.color}33, inset 0 0 20px ${task.color}11`
          : flash
          ? `0 0 30px ${task.color}55`
          : `0 0 8px ${task.color}11`,
        padding: '20px',
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: 40,
              height: 40,
              background: `${task.color}18`,
              border: `1px solid ${task.color}44`,
              color: task.color,
              boxShadow: isDone ? `0 0 12px ${task.color}44` : 'none',
            }}
          >
            {ICON_MAP[task.icon] ?? <FileText size={20} />}
          </div>
          <div>
            <div
              className="font-bold text-base tracking-wider"
              style={{ color: isDone ? task.color : '#ffffff', textShadow: isDone ? `0 0 8px ${task.color}` : 'none' }}
            >
              {task.name.toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded"
                style={{ color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30` }}
              >
                {task.category.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-black tabular-nums" style={{ color: task.color, textShadow: `0 0 10px ${task.color}` }}>
              {completed}
              <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                /{task.dailyTarget}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded transition-opacity opacity-40 hover:opacity-100"
              style={{ color: '#00e0ff' }}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded transition-opacity"
              style={{ color: confirmDelete ? '#ff4444' : 'rgba(255,68,68,0.5)', opacity: confirmDelete ? 1 : 0.4 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = confirmDelete ? '1' : '0.4'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full mb-4 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${task.color}99, ${task.color})`,
            boxShadow: `0 0 8px ${task.color}`,
          }}
        />
      </div>

      {/* Value breakdown */}
      <div className="flex items-center justify-between mb-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>Base: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{task.baseValue}</span></span>
        <span>
          Combo{' '}
          <span style={{ color: comboMultiplier > 1 ? '#ffcc00' : 'rgba(255,255,255,0.6)' }}>
            x{Math.floor(comboMultiplier).toLocaleString()}
          </span>
        </span>
        <span>
          Total:{' '}
          <span style={{ color: task.color, fontWeight: 700 }}>{effectiveValue}</span>
        </span>
      </div>

      {/* Resource drops display */}
      {task.resourceDrops.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>DROPS:</span>
          {task.resourceDrops.map(drop => {
            const def = getResourceDef(drop.resourceId);
            return (
              <span
                key={drop.resourceId}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ color: def.color, background: `${def.color}11`, border: `1px solid ${def.color}22` }}
              >
                {def.icon} {Math.round(drop.chance * 100)}%
              </span>
            );
          })}
        </div>
      )}

      {/* Last drop flash */}
      {lastDrop && lastDrop.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap animate-pulse">
          {lastDrop.map((r, i) => {
            const def = getResourceDef(r.resourceId);
            return (
              <span key={i} className="text-xs font-bold" style={{ color: def.color, textShadow: `0 0 6px ${def.color}` }}>
                +{r.amount} {def.icon}
              </span>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mb-3 text-xs font-bold text-center py-1.5 rounded" style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}>
          CLICK AGAIN TO DELETE
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleClick}
        disabled={isDone}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-bold text-sm tracking-widest transition-all duration-150"
        style={{
          background: isDone
            ? `${task.color}22`
            : `linear-gradient(135deg, ${task.color}33, ${task.color}22)`,
          border: `1px solid ${task.color}${isDone ? '66' : '44'}`,
          color: isDone ? task.color : '#ffffff',
          textShadow: isDone ? `0 0 8px ${task.color}` : 'none',
          boxShadow: isDone ? `0 0 12px ${task.color}33` : 'none',
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          cursor: isDone ? 'not-allowed' : 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        {isDone ? (
          <>
            <Check size={15} />
            <span>COMPLETE</span>
          </>
        ) : (
          <>
            <Plus size={15} />
            <span>+ {task.name.toUpperCase()}</span>
          </>
        )}
      </button>
    </div>
  );
}
