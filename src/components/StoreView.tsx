import { useState } from 'react';
import {
  ShoppingBag, Plus, X, Lock, Clock, Coins, Pencil, Trash2,
  Tag, Scissors,
  Gamepad2, Film, Music, Coffee, Utensils, BookOpen, Dumbbell, MapPin,
  Gift, Heart, Star, Zap, Flame, Rocket, Trophy, Sparkles, Smile,
  Camera, Palette, Globe, Car, Home, Eye, MessageCircle, Video,
  Briefcase, Terminal, Cpu, Shield, Target, Crown,
  FileText, PenTool, Code,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StoreReward, ResourceAmount, StoreCategoryDefinition } from '../types';
import { RESOURCE_DEFS, getResourceDef, STORE_ICONS } from '../constants';

const iconNames: Record<string, LucideIcon> = {
  'gamepad-2': Gamepad2, 'film': Film, 'music': Music, 'coffee': Coffee,
  'utensils': Utensils, 'book-open': BookOpen, 'dumbbell': Dumbbell,
  'map-pin': MapPin, 'shopping-bag': ShoppingBag, 'gift': Gift,
  'heart': Heart, 'star': Star, 'zap': Zap, 'flame': Flame,
  'rocket': Rocket, 'trophy': Trophy, 'sparkles': Sparkles, 'smile': Smile,
  'camera': Camera, 'palette': Palette, 'globe': Globe, 'car': Car,
  'home': Home, 'eye': Eye, 'message-circle': MessageCircle, 'video': Video,
  'briefcase': Briefcase, 'terminal': Terminal, 'cpu': Cpu,
  'shield': Shield, 'target': Target, 'crown': Crown,
  'file-text': FileText, 'pen-tool': PenTool, 'code': Code,
};

interface StoreViewProps {
  rewards: StoreReward[];
  money: number;
  resources: Record<string, number>;
  cooldowns: Record<string, number>;
  onPurchase: (id: string) => boolean;
  onAddReward: (reward: StoreReward) => void;
  onRemoveReward: (id: string) => void;
  onUpdateReward: (reward: StoreReward) => void;
  redeemables: { id: string; rewardName: string; rewardDescription: string; purchasedAt: number }[];
  onRedeem: (id: string) => void;
  storeCategories: StoreCategoryDefinition[];
  onAddStoreCategory: (cat: StoreCategoryDefinition) => void;
  onRemoveStoreCategory: (id: string) => void;
  onUpdateStoreCategory: (cat: StoreCategoryDefinition) => void;
}

export function StoreView({
  rewards, money, resources, cooldowns, onPurchase, onAddReward,
  onRemoveReward, onUpdateReward, redeemables, onRedeem,
  storeCategories, onAddStoreCategory, onRemoveStoreCategory, onUpdateStoreCategory,
}: StoreViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editReward, setEditReward] = useState<StoreReward | null>(null);
  const [purchaseFlash, setPurchaseFlash] = useState<string | null>(null);
  const [showRedeemables, setShowRedeemables] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const now = Date.now();

  const handlePurchase = (id: string) => {
    const ok = onPurchase(id);
    if (ok) {
      setPurchaseFlash(id);
      setTimeout(() => setPurchaseFlash(null), 600);
    }
  };

  const canAfford = (reward: StoreReward): boolean => {
    if (money < reward.cost) return false;
    for (const r of reward.resources) {
      if ((resources[r.resourceId] ?? 0) < r.amount) return false;
    }
    return true;
  };

  const isOnCooldown = (reward: StoreReward): boolean => {
    const cd = cooldowns[reward.id];
    return cd !== undefined && cd > now;
  };

  const getCatColor = (catName: string): string => {
    return storeCategories.find(c => c.name === catName)?.color ?? '#00e0ff';
  };

  const filteredRewards = activeCategory
    ? rewards.filter(r => r.category === activeCategory)
    : rewards;

  const displayCategories = [...new Set(filteredRewards.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Tag size={14} style={{ color: '#00e0ff' }} />
          <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            REWARD STORE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {redeemables.length > 0 && (
            <button
              onClick={() => setShowRedeemables(!showRedeemables)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest transition-all duration-200 hover:brightness-125"
              style={{ background: 'rgba(51,255,204,0.1)', border: '1px solid rgba(51,255,204,0.25)', color: '#33ffcc' }}
            >
              <ShoppingBag size={12} /> {redeemables.length}
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.25)' }}>
            <Coins size={14} style={{ color: '#ffcc00' }} />
            <span className="font-bold text-sm tabular-nums" style={{ color: '#ffcc00' }}>{money.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowCatManager(!showCatManager)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest transition-all duration-200 hover:brightness-125"
            style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.25)', color: '#ffcc00' }}
          >
            <Tag size={12} /> CATEGORIES
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest transition-all duration-200 hover:brightness-125"
            style={{ background: 'rgba(0,224,255,0.1)', border: '1px solid rgba(0,224,255,0.25)', color: '#00e0ff' }}
          >
            <Plus size={12} /> CREATE
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className="px-3 py-1.5 rounded text-[10px] font-bold tracking-widest transition-all duration-200"
          style={{
            background: activeCategory === null ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeCategory === null ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: activeCategory === null ? '#ffffff' : 'rgba(255,255,255,0.3)',
          }}
        >
          ALL
        </button>
        {storeCategories.map(cat => {
          const isActive = activeCategory === cat.name;
          const count = rewards.filter(r => r.category === cat.name).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.name)}
              className="px-3 py-1.5 rounded text-[10px] font-bold tracking-widest transition-all duration-200"
              style={{
                background: isActive ? `${cat.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? cat.color + '55' : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? cat.color : 'rgba(255,255,255,0.3)',
                boxShadow: isActive ? `0 0 8px ${cat.color}22` : 'none',
              }}
            >
              {cat.name.toUpperCase()} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Category manager */}
      {showCatManager && (
        <CategoryManager
          categories={storeCategories}
          onAdd={onAddStoreCategory}
          onRemove={onRemoveStoreCategory}
          onUpdate={onUpdateStoreCategory}
          onClose={() => setShowCatManager(false)}
        />
      )}

      {/* Redeemables panel */}
      {showRedeemables && redeemables.length > 0 && (
        <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(51,255,204,0.05)', border: '1px solid rgba(51,255,204,0.2)' }}>
          <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#33ffcc' }}>YOUR REDEEMABLES</div>
          {redeemables.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div className="text-xs font-bold" style={{ color: '#ffffff' }}>{r.rewardName}</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{r.rewardDescription}</div>
              </div>
              <button
                onClick={() => onRedeem(r.id)}
                className="px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 hover:brightness-125"
                style={{ background: 'rgba(51,255,204,0.15)', border: '1px solid rgba(51,255,204,0.3)', color: '#33ffcc' }}
              >
                REDEEM
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Coupon grid by category */}
      {displayCategories.map(cat => {
        const catColor = getCatColor(cat);
        const catRewards = filteredRewards.filter(r => r.category === cat);
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: `${catColor}30` }} />
              <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: catColor }}>
                {cat.toUpperCase()}
              </span>
              <div className="h-px flex-1" style={{ background: `${catColor}30` }} />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {catRewards.map(reward => {
                const affordable = canAfford(reward);
                const cooldown = isOnCooldown(reward);
                const isFlash = purchaseFlash === reward.id;
                const IconComp = iconNames[reward.icon] ?? ShoppingBag;

                return (
                  <CouponCard
                    key={reward.id}
                    reward={reward}
                    affordable={affordable}
                    cooldown={cooldown}
                    isFlash={isFlash}
                    catColor={catColor}
                    IconComp={IconComp}
                    money={money}
                    resources={resources}
                    onPurchase={handlePurchase}
                    onEdit={setEditReward}
                    onRemove={onRemoveReward}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {rewards.length === 0 && (
        <div className="text-center py-12">
          <Tag size={32} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto' }} />
          <div className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>No rewards yet</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.12)' }}>Create your first reward coupon</div>
        </div>
      )}

      {showCreate && (
        <RewardModal
          storeCategories={storeCategories}
          onClose={() => setShowCreate(false)}
          onSave={onAddReward}
        />
      )}
      {editReward && (
        <RewardModal
          reward={editReward}
          storeCategories={storeCategories}
          onClose={() => setEditReward(null)}
          onSave={r => { onUpdateReward(r); setEditReward(null); }}
        />
      )}
    </div>
  );
}

/* ── Coupon Card ── */

function CouponCard({
  reward, affordable, cooldown, isFlash, catColor, IconComp,
  money, resources, onPurchase, onEdit, onRemove,
}: {
  reward: StoreReward;
  affordable: boolean;
  cooldown: boolean;
  isFlash: boolean;
  catColor: string;
  IconComp: LucideIcon;
  money: number;
  resources: Record<string, number>;
  onPurchase: (id: string) => void;
  onEdit: (r: StoreReward) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg transition-all duration-300 group"
      style={{
        background: isFlash ? 'rgba(0,224,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${affordable && !cooldown ? `${catColor}35` : 'rgba(255,255,255,0.06)'}`,
        opacity: cooldown ? 0.45 : 1,
      }}
    >
      {/* Perforated left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col justify-around items-center py-1"
        style={{ background: 'rgba(0,0,0,0.4)' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-1 h-1 rounded-full" style={{ background: '#0c0c1a' }} />
        ))}
      </div>

      {/* Main content */}
      <div className="pl-4 pr-3 pt-3 pb-2.5">
        {/* Top row: icon + name + actions */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
              style={{
                background: affordable && !cooldown ? `${catColor}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${affordable && !cooldown ? `${catColor}40` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <IconComp
                size={14}
                style={{ color: affordable && !cooldown ? catColor : 'rgba(255,255,255,0.2)' }}
              />
            </div>
            <span className="font-bold text-xs tracking-wider truncate" style={{ color: affordable ? '#ffffff' : 'rgba(255,255,255,0.35)' }}>
              {reward.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={() => onEdit(reward)} className="p-1 rounded" style={{ color: '#00e0ff' }}>
              <Pencil size={11} />
            </button>
            <button onClick={() => onRemove(reward.id)} className="p-1 rounded" style={{ color: '#ff4444' }}>
              <Trash2 size={11} />
            </button>
            {cooldown && <Clock size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />}
          </div>
        </div>

        {/* Description */}
        <div className="text-[10px] mb-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {reward.description}
        </div>

        {/* Cost row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              color: money >= reward.cost ? '#ffcc00' : '#ff4444',
              background: money >= reward.cost ? 'rgba(255,204,0,0.08)' : 'rgba(255,68,68,0.08)',
            }}
          >
            <Coins size={10} /> {reward.cost}
          </span>
          {reward.resources.map(r => {
            const def = getResourceDef(r.resourceId);
            const have = resources[r.resourceId] ?? 0;
            const enough = have >= r.amount;
            return (
              <span
                key={r.resourceId}
                className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  color: enough ? def.color : '#ff4444',
                  background: enough ? `${def.color}10` : 'rgba(255,68,68,0.06)',
                }}
              >
                {def.icon} {r.amount}
              </span>
            );
          })}
        </div>

        {/* Buy button - dashed coupon bottom */}
        <div className="border-t border-dashed pt-2" style={{ borderColor: `${catColor}20` }}>
          <button
            onClick={() => onPurchase(reward.id)}
            disabled={!affordable || cooldown}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-bold tracking-widest transition-all duration-150"
            style={{
              background: affordable && !cooldown ? `${catColor}12` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${affordable && !cooldown ? `${catColor}30` : 'rgba(255,255,255,0.06)'}`,
              color: affordable && !cooldown ? catColor : 'rgba(255,255,255,0.15)',
              cursor: affordable && !cooldown ? 'pointer' : 'not-allowed',
            }}
          >
            {cooldown ? <><Lock size={10} /> COOLDOWN</>
              : !affordable ? <><Lock size={10} /> LOCKED</>
              : <><Scissors size={10} /> CLAIM</>}
          </button>
        </div>
      </div>

      {/* Flash overlay */}
      {isFlash && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{ background: `linear-gradient(135deg, ${catColor}15, transparent)` }}
        />
      )}
    </div>
  );
}

/* ── Category Manager ── */

function CategoryManager({
  categories, onAdd, onRemove, onUpdate, onClose,
}: {
  categories: StoreCategoryDefinition[];
  onAdd: (cat: StoreCategoryDefinition) => void;
  onRemove: (id: string) => void;
  onUpdate: (cat: StoreCategoryDefinition) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#00e0ff');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: newName.trim(), color: newColor });
    setNewName('');
  };

  return (
    <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,204,0,0.03)', border: '1px solid rgba(255,204,0,0.15)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest" style={{ color: '#ffcc00' }}>MANAGE CATEGORIES</span>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={14} /></button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2">
            <input
              type="color" value={cat.color}
              onChange={e => onUpdate({ ...cat, color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer shrink-0"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <input
              type="text" value={cat.name}
              onChange={e => onUpdate({ ...cat, name: e.target.value })}
              className="flex-1 px-2 py-1 rounded text-xs"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: cat.color }}
            />
            <button onClick={() => onRemove(cat.id)} className="shrink-0 p-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer shrink-0"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <input
          type="text" value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="New category..."
          className="flex-1 px-2 py-1 rounded text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd} disabled={!newName.trim()}
          className="shrink-0 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest"
          style={{
            background: newName.trim() ? 'rgba(255,204,0,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${newName.trim() ? 'rgba(255,204,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: newName.trim() ? '#ffcc00' : 'rgba(255,255,255,0.2)',
          }}
        >
          ADD
        </button>
      </div>
    </div>
  );
}

/* ── Reward Modal ── */

function RewardModal({
  reward, storeCategories, onClose, onSave,
}: {
  reward?: StoreReward | null;
  storeCategories: StoreCategoryDefinition[];
  onClose: () => void;
  onSave: (r: StoreReward) => void;
}) {
  const isEdit = !!reward;
  const [name, setName] = useState(reward?.name ?? '');
  const [desc, setDesc] = useState(reward?.description ?? '');
  const [cost, setCost] = useState(reward?.cost ?? 100);
  const [category, setCategory] = useState(reward?.category ?? (storeCategories[0]?.name ?? 'Leisure'));
  const [customCategory, setCustomCategory] = useState('');
  const [cooldown, setCooldown] = useState(reward ? reward.cooldownMs / 60000 : 0);
  const [selectedResources, setSelectedResources] = useState<ResourceAmount[]>(reward?.resources ?? []);
  const [icon, setIcon] = useState(reward?.icon ?? 'gift');

  const activeCategory = category === '__custom__' ? (customCategory.trim() || 'Custom') : category;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: reward?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: desc.trim() || name.trim(),
      cost,
      resources: selectedResources,
      cooldownMs: cooldown * 60000,
      category: activeCategory,
      icon,
      custom: reward?.custom ?? true,
    });
    onClose();
  };

  const toggleResource = (resourceId: string) => {
    const existing = selectedResources.find(r => r.resourceId === resourceId);
    if (existing) {
      setSelectedResources(prev => prev.filter(r => r.resourceId !== resourceId));
    } else {
      setSelectedResources(prev => [...prev, { resourceId, amount: 1 }]);
    }
  };

  const setResourceAmount = (resourceId: string, amount: number) => {
    setSelectedResources(prev => prev.map(r => r.resourceId === resourceId ? { ...r, amount: Math.max(1, amount) } : r));
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md mx-4 rounded-xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: '#0c0c1a', border: '1px solid rgba(0,224,255,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold text-sm tracking-widest" style={{ color: '#00e0ff' }}>{isEdit ? 'EDIT REWARD' : 'CREATE REWARD'}</span>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>DESCRIPTION</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-[10px] tracking-widest block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>ICON</label>
            <div className="flex flex-wrap gap-1.5">
              {STORE_ICONS.map(ic => {
                const isActive = icon === ic;
                const IcComp = iconNames[ic] ?? ShoppingBag;
                return (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className="flex items-center justify-center w-8 h-8 rounded transition-all duration-150"
                    style={{
                      background: isActive ? 'rgba(0,224,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(0,224,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: isActive ? '#00e0ff' : 'rgba(255,255,255,0.3)',
                      boxShadow: isActive ? '0 0 8px rgba(0,224,255,0.2)' : 'none',
                    }}
                  >
                    <IcComp size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost + Cooldown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>COST</label>
              <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} min={1}
                className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffcc00' }} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>COOLDOWN (MIN)</label>
              <input type="number" value={cooldown} onChange={e => setCooldown(Number(e.target.value))} min={0}
                className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] tracking-widest block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>CATEGORY</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {storeCategories.map(c => {
                const isActive = category === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.name); setCustomCategory(''); }}
                    className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-150"
                    style={{
                      background: isActive ? `${c.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? c.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      color: isActive ? c.color : 'rgba(255,255,255,0.3)',
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
                  background: category === '__custom__' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${category === '__custom__' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  color: category === '__custom__' ? '#ffffff' : 'rgba(255,255,255,0.3)',
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

          {/* Resource costs */}
          <div>
            <label className="text-[10px] tracking-widest block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>RESOURCE COSTS</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_DEFS.map(rd => {
                const selected = selectedResources.find(r => r.resourceId === rd.id);
                return (
                  <button key={rd.id} onClick={() => toggleResource(rd.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ background: selected ? `${rd.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${selected ? rd.color + '44' : 'rgba(255,255,255,0.06)'}`, color: selected ? rd.color : 'rgba(255,255,255,0.25)' }}>
                    {rd.icon} {rd.name}
                    {selected && <input type="number" value={selected.amount} onChange={e => { e.stopPropagation(); setResourceAmount(rd.id, Number(e.target.value)); }} onClick={e => e.stopPropagation()} min={1}
                      className="w-8 text-center rounded px-1" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: rd.color, fontSize: 10 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleSave} disabled={!name.trim()}
            className="w-full py-2.5 rounded font-bold text-sm tracking-widest"
            style={{ background: name.trim() ? 'rgba(0,224,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${name.trim() ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: name.trim() ? '#00e0ff' : 'rgba(255,255,255,0.2)' }}>
            {isEdit ? 'SAVE CHANGES' : 'CREATE REWARD'}
          </button>
        </div>
      </div>
    </div>
  );
}
