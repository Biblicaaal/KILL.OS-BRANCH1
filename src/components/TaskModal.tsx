import { useState } from 'react';
import {
  X, Plus, Trash2, FileText, Cpu, PenTool, Code, Dumbbell, BookOpen, Music,
  Camera, Palette, Globe, Heart, Zap, Star, Shield, Target, Flame, Trophy,
  Rocket, Coffee, MessageCircle, Video, Briefcase, Terminal, ShoppingBag,
  Utensils, Car, Home, Smile, Eye,
} from 'lucide-react';
import type { TaskDefinition, ResourceDrop, CategoryDefinition } from '../types';
import { RESOURCE_DEFS, getResourceDef, TASK_ICONS } from '../constants';

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  'file-text': <FileText size={16} />,
  'cpu': <Cpu size={16} />,
  'pen-tool': <PenTool size={16} />,
  'code': <Code size={16} />,
  'dumbbell': <Dumbbell size={16} />,
  'book-open': <BookOpen size={16} />,
  'music': <Music size={16} />,
  'camera': <Camera size={16} />,
  'palette': <Palette size={16} />,
  'globe': <Globe size={16} />,
  'heart': <Heart size={16} />,
  'zap': <Zap size={16} />,
  'star': <Star size={16} />,
  'shield': <Shield size={16} />,
  'target': <Target size={16} />,
  'flame': <Flame size={16} />,
  'trophy': <Trophy size={16} />,
  'rocket': <Rocket size={16} />,
  'coffee': <Coffee size={16} />,
  'message-circle': <MessageCircle size={16} />,
  'video': <Video size={16} />,
  'briefcase': <Briefcase size={16} />,
  'terminal': <Terminal size={16} />,
  'shopping-bag': <ShoppingBag size={16} />,
  'utensils': <Utensils size={16} />,
  'car': <Car size={16} />,
  'home': <Home size={16} />,
  'smile': <Smile size={16} />,
  'eye': <Eye size={16} />,
};

interface TaskModalProps {
  task?: TaskDefinition | null;
  categories: CategoryDefinition[];
  colorPresets: string[];
  onSave: (task: TaskDefinition) => void;
  onAddCategory?: (category: CategoryDefinition) => void;
  onAddColorPreset?: (color: string) => void;
  onRemoveColorPreset?: (color: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function TaskModal({
  task,
  categories,
  colorPresets,
  onSave,
  onAddCategory,
  onAddColorPreset,
  onRemoveColorPreset,
  onDelete,
  onClose,
}: TaskModalProps) {
  const isEdit = !!task;
  const [name, setName] = useState(task?.name ?? '');
  const [dailyTarget, setDailyTarget] = useState(task?.dailyTarget ?? 1);
  const [baseValue, setBaseValue] = useState(task?.baseValue ?? 40);
  const defaultCategory = categories[0]?.name ?? 'Custom';
  const [category, setCategory] = useState(task?.category ?? defaultCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [icon, setIcon] = useState(task?.icon ?? 'file-text');
  const [color, setColor] = useState(task?.color ?? '#00e0ff');
  const [drops, setDrops] = useState<ResourceDrop[]>(task?.resourceDrops ?? []);

  const allCategories = [...categories];
  const activeCategory = category === '__custom__' ? (customCategory.trim() || 'Custom') : category;

  const addDrop = () => {
    setDrops(prev => [...prev, { resourceId: RESOURCE_DEFS[0].id, min: 1, max: 1, chance: 0.5 }]);
  };

  const removeDrop = (idx: number) => {
    setDrops(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDrop = (idx: number, field: keyof ResourceDrop, value: number | string) => {
    setDrops(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (category === '__custom__' && activeCategory.trim() && !categories.some(c => c.name.toLowerCase() === activeCategory.toLowerCase())) {
      onAddCategory?.({ id: crypto.randomUUID(), name: activeCategory, color });
    }
    onSave({
      id: task?.id ?? crypto.randomUUID(),
      name: name.trim(),
      dailyTarget,
      baseValue,
      icon,
      color,
      category: activeCategory,
      resourceDrops: drops,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg mx-4 rounded-xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: '#0c0c1a', border: '1px solid rgba(0,224,255,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold text-sm tracking-widest" style={{ color: '#00e0ff' }}>
            {isEdit ? 'EDIT TASK' : 'ADD TASK'}
          </span>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <Field label="NAME" value={name} onChange={setName} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>DAILY QUOTA</label>
              <input type="number" value={dailyTarget} onChange={e => setDailyTarget(Number(e.target.value))} min={1}
                className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>BASE VALUE</label>
              <input type="number" value={baseValue} onChange={e => setBaseValue(Number(e.target.value))} min={1}
                className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffcc00' }} />
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>CATEGORY</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allCategories.map(c => {
                const isActive = category === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.name); setCustomCategory(''); setColor(c.color); }}
                    className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-150"
                    style={{
                      background: isActive ? `${c.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? c.color + '60' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? c.color : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {c.name.toUpperCase()}
                  </button>
                );
              })}
              <button
                onClick={() => setCategory('__custom__')}
                className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-150"
                style={{
                  background: category === '__custom__' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${category === '__custom__' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  color: category === '__custom__' ? '#ffffff' : 'rgba(255,255,255,0.35)',
                }}
              >
                + CUSTOM
              </button>
            </div>
            {category === '__custom__' && (
              <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Enter category name..."
                className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
            )}
          </div>

          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>ICON</label>
            <div className="flex flex-wrap gap-1.5">
              {TASK_ICONS.map(ic => {
                const isActive = icon === ic;
                return (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className="flex items-center justify-center w-8 h-8 rounded transition-all duration-150"
                    style={{
                      background: isActive ? `${color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? color + '55' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? color : 'rgba(255,255,255,0.3)',
                      boxShadow: isActive ? `0 0 8px ${color}33` : 'none',
                    }}
                  >
                    {ICON_COMPONENTS[ic] ?? <FileText size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>COLOR</label>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button
                onClick={() => onAddColorPreset?.(color)}
                className="px-2.5 py-1.5 rounded text-[10px] font-bold tracking-widest"
                style={{ background: `${color}18`, border: `1px solid ${color}55`, color }}
              >
                SAVE QUICK
              </button>
              <div className="flex gap-1.5 flex-wrap">
                {colorPresets.map(c => (
                  <span key={c} className="relative inline-flex">
                  <button
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded transition-transform"
                    style={{
                      background: c,
                      border: `1px solid ${color === c ? '#ffffff' : 'transparent'}`,
                      transform: color === c ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                    }}
                  />
                    {colorPresets.length > 1 && (
                      <button
                        onClick={() => onRemoveColorPreset?.(c)}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: '#0c0c1a', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.65)' }}
                        title="Remove quick color"
                      >
                        <X size={9} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resource drops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>RESOURCE DROPS</label>
              <button onClick={addDrop} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#00e0ff' }}>
                <Plus size={10} /> ADD
              </button>
            </div>
            <div className="space-y-2">
              {drops.map((drop, i) => {
                const def = getResourceDef(drop.resourceId);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <select
                      value={drop.resourceId}
                      onChange={e => updateDrop(i, 'resourceId', e.target.value)}
                      className="px-2 py-1 rounded text-xs flex-1"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: def.color }}
                    >
                      {RESOURCE_DEFS.map(rd => <option key={rd.id} value={rd.id}>{rd.icon} {rd.name}</option>)}
                    </select>
                    <input type="number" value={drop.min} onChange={e => updateDrop(i, 'min', Number(e.target.value))} min={1} placeholder="Min"
                      className="w-12 px-1 py-1 rounded text-xs text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>
                    <input type="number" value={drop.max} onChange={e => updateDrop(i, 'max', Number(e.target.value))} min={1} placeholder="Max"
                      className="w-12 px-1 py-1 rounded text-xs text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <input type="number" value={drop.chance} onChange={e => updateDrop(i, 'chance', Number(e.target.value))} min={0} max={1} step={0.05} placeholder="%"
                      className="w-12 px-1 py-1 rounded text-xs text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffcc00' }} />
                    <button onClick={() => removeDrop(i)} style={{ color: 'rgba(255,255,255,0.2)' }}><Trash2 size={12} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded font-bold text-sm tracking-widest"
              style={{
                background: name.trim() ? 'rgba(0,224,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${name.trim() ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: name.trim() ? '#00e0ff' : 'rgba(255,255,255,0.2)',
              }}
            >
              {isEdit ? 'SAVE CHANGES' : 'CREATE TASK'}
            </button>
            {isEdit && onDelete && (
              <button
                onClick={() => { onDelete(task.id); onClose(); }}
                className="px-4 py-2.5 rounded font-bold text-sm"
                style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444' }}
              >
                DELETE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
    </div>
  );
}
