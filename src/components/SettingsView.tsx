import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AppSettings, CategoryDefinition } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  categories: CategoryDefinition[];
  onUpdate: (s: Partial<AppSettings>) => void;
  onAddCategory: (category: CategoryDefinition) => void;
  onUpdateCategory: (category: CategoryDefinition, previousName?: string) => void;
  onDeleteCategory: (id: string) => void;
}

const COLOR_PRESETS = ['#00e0ff', '#ff2ed1', '#ffcc00', '#33ffcc', '#ff8800', '#cc44ff', '#4488ff', '#33ff99'];

export function SettingsView({ settings, categories, onUpdate, onAddCategory, onUpdateCategory, onDeleteCategory }: SettingsViewProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#00e0ff');

  const addCategory = () => {
    const name = newName.trim();
    if (!name || categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    onAddCategory({ id: crypto.randomUUID(), name, color: newColor });
    setNewName('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        SETTINGS
      </h2>

      <div className="space-y-4">
        <SettingSlider
          label="GLOW INTENSITY"
          value={settings.glowIntensity}
          onChange={v => onUpdate({ glowIntensity: v })}
          min={0}
          max={1}
          step={0.1}
        />
        <SettingSlider
          label="PARTICLE INTENSITY"
          value={settings.particleIntensity}
          onChange={v => onUpdate({ particleIntensity: v })}
          min={0}
          max={1}
          step={0.1}
        />
        <SettingSlider
          label="COMBO WINDOW (MINUTES)"
          value={settings.comboWindowMinutes}
          onChange={v => onUpdate({ comboWindowMinutes: v })}
          min={5}
          max={180}
          step={5}
          isInt
        />

        <SettingToggle
          label="SOUND EFFECTS"
          value={settings.soundEnabled}
          onChange={v => onUpdate({ soundEnabled: v })}
        />
        <SettingToggle
          label="AUTO DAY RESET"
          value={settings.autoDayReset}
          onChange={v => onUpdate({ autoDayReset: v })}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          CATEGORIES
        </h2>

        <div className="space-y-2">
          {categories.map(category => (
            <CategoryRow
              key={category.id}
              category={category}
              canDelete={categories.length > 1}
              onUpdate={onUpdateCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </div>

        <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New category..."
              className="px-3 py-2 rounded text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
            />
            <button
              onClick={addCategory}
              disabled={!newName.trim()}
              className="flex items-center justify-center gap-1 px-4 py-2 rounded text-xs font-bold tracking-widest"
              style={{
                background: newName.trim() ? `${newColor}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${newName.trim() ? newColor + '55' : 'rgba(255,255,255,0.08)'}`,
                color: newName.trim() ? newColor : 'rgba(255,255,255,0.2)',
              }}
            >
              <Plus size={13} /> ADD
            </button>
          </div>
          <ColorPicker color={newColor} onChange={setNewColor} />
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ category, canDelete, onUpdate, onDelete }: {
  category: CategoryDefinition;
  canDelete: boolean;
  onUpdate: (category: CategoryDefinition, previousName?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const dirty = name.trim() !== category.name || color !== category.color;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdate({ ...category, name: trimmed, color }, category.name);
  };

  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${category.color}22` }}>
      <div className="flex items-center gap-3">
        <div className="w-3 h-8 rounded" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={save}
          className="min-w-0 flex-1 px-3 py-2 rounded text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
        />
        <button
          onClick={save}
          disabled={!dirty || !name.trim()}
          className="px-3 py-2 rounded text-[10px] font-bold tracking-widest"
          style={{
            background: dirty ? `${color}18` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${dirty ? color + '55' : 'rgba(255,255,255,0.06)'}`,
            color: dirty ? color : 'rgba(255,255,255,0.18)',
          }}
        >
          SAVE
        </button>
        <button
          onClick={() => onDelete(category.id)}
          disabled={!canDelete}
          className="p-2 rounded"
          style={{ color: canDelete ? '#ff4444' : 'rgba(255,255,255,0.12)', background: 'rgba(255,68,68,0.08)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <ColorPicker color={color} onChange={setColor} />
    </div>
  );
}

function ColorPicker({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <input
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-7 rounded cursor-pointer"
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
        title="Custom color"
      />
      {COLOR_PRESETS.map(preset => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className="w-6 h-6 rounded transition-transform"
          style={{
            background: preset,
            border: `1px solid ${color === preset ? '#ffffff' : 'transparent'}`,
            transform: color === preset ? 'scale(1.15)' : 'scale(1)',
            boxShadow: color === preset ? `0 0 8px ${preset}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function SettingSlider({ label, value, onChange, min, max, step, isInt }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; isInt?: boolean;
}) {
  const display = isInt ? value.toString() : value.toFixed(1);
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: '#00e0ff' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: '#00e0ff' }}
      />
    </div>
  );
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="rounded-lg p-4 flex items-center justify-between cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      onClick={() => onChange(!value)}
    >
      <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <div
        className="w-10 h-5 rounded-full relative transition-all duration-200"
        style={{ background: value ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{
            left: value ? 22 : 2,
            background: value ? '#00e0ff' : 'rgba(255,255,255,0.3)',
            boxShadow: value ? '0 0 8px rgba(0,224,255,0.5)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
