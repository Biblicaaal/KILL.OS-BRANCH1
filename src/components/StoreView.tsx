import { useState } from 'react';
import { ShoppingBag, Plus, X, Lock, Check, Clock, Coins, Pencil, Trash2 } from 'lucide-react';
import type { StoreReward, ResourceAmount } from '../types';
import { RESOURCE_DEFS, getResourceDef } from '../constants';

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
}

export function StoreView({ rewards, money, resources, cooldowns, onPurchase, onAddReward, onRemoveReward, onUpdateReward, redeemables, onRedeem }: StoreViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editReward, setEditReward] = useState<StoreReward | null>(null);
  const [purchaseFlash, setPurchaseFlash] = useState<string | null>(null);
  const [showRedeemables, setShowRedeemables] = useState(false);

  const categories = [...new Set(rewards.map(r => r.category))];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          REWARD STORE
        </h2>
        <div className="flex items-center gap-2">
          {redeemables.length > 0 && (
            <button
              onClick={() => setShowRedeemables(!showRedeemables)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest"
              style={{ background: 'rgba(51,255,204,0.1)', border: '1px solid rgba(51,255,204,0.25)', color: '#33ffcc' }}
            >
              <ShoppingBag size={12} /> REDEEMABLES ({redeemables.length})
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.25)' }}>
            <Coins size={14} style={{ color: '#ffcc00' }} />
            <span className="font-bold text-sm tabular-nums" style={{ color: '#ffcc00' }}>{money.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest"
            style={{ background: 'rgba(0,224,255,0.1)', border: '1px solid rgba(0,224,255,0.25)', color: '#00e0ff' }}
          >
            <Plus size={12} /> CREATE
          </button>
        </div>
      </div>

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
                className="px-3 py-1.5 rounded text-xs font-bold"
                style={{ background: 'rgba(51,255,204,0.15)', border: '1px solid rgba(51,255,204,0.3)', color: '#33ffcc' }}
              >
                REDEEM
              </button>
            </div>
          ))}
        </div>
      )}

      {categories.map(cat => (
        <div key={cat}>
          <div className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {cat.toUpperCase()}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rewards.filter(r => r.category === cat).map(reward => {
              const affordable = canAfford(reward);
              const cooldown = isOnCooldown(reward);
              const isFlash = purchaseFlash === reward.id;

              return (
                <div
                  key={reward.id}
                  className="rounded-lg p-4 relative overflow-hidden transition-all duration-300"
                  style={{
                    background: isFlash ? 'rgba(0,224,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${affordable && !cooldown ? 'rgba(0,224,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isFlash ? '0 0 20px rgba(0,224,255,0.2)' : 'none',
                    opacity: cooldown ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} style={{ color: affordable ? '#00e0ff' : 'rgba(255,255,255,0.2)' }} />
                      <span className="font-bold text-sm tracking-wider" style={{ color: affordable ? '#ffffff' : 'rgba(255,255,255,0.4)' }}>
                        {reward.name.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditReward(reward)} className="p-1 rounded transition-opacity opacity-50 hover:opacity-100" style={{ color: '#00e0ff' }}><Pencil size={12} /></button>
                      <button onClick={() => onRemoveReward(reward.id)} className="p-1 rounded transition-opacity opacity-50 hover:opacity-100" style={{ color: '#ff4444' }}><Trash2 size={12} /></button>
                      {cooldown && <Clock size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                    </div>
                  </div>

                  <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>{reward.description}</div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: money >= reward.cost ? '#ffcc00' : '#ff4444' }}>
                      <Coins size={10} /> {reward.cost}
                    </span>
                    {reward.resources.map(r => {
                      const def = getResourceDef(r.resourceId);
                      const have = resources[r.resourceId] ?? 0;
                      const enough = have >= r.amount;
                      return (
                        <span key={r.resourceId} className="flex items-center gap-0.5 text-xs" style={{ color: enough ? def.color : '#ff4444' }}>
                          {def.icon} {r.amount}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePurchase(reward.id)}
                    disabled={!affordable || cooldown}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-bold tracking-widest transition-all duration-150"
                    style={{
                      background: affordable && !cooldown ? 'rgba(0,224,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${affordable && !cooldown ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      color: affordable && !cooldown ? '#00e0ff' : 'rgba(255,255,255,0.2)',
                      cursor: affordable && !cooldown ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {cooldown ? <><Lock size={12} /> COOLDOWN</> :
                     !affordable ? <><Lock size={12} /> LOCKED</> :
                     <><Check size={12} /> REDEEM</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {showCreate && (
        <RewardModal onClose={() => setShowCreate(false)} onSave={onAddReward} />
      )}
      {editReward && (
        <RewardModal reward={editReward} onClose={() => setEditReward(null)} onSave={r => { onUpdateReward(r); setEditReward(null); }} />
      )}
    </div>
  );
}

function RewardModal({ reward, onClose, onSave }: { reward?: StoreReward | null; onClose: () => void; onSave: (r: StoreReward) => void }) {
  const isEdit = !!reward;
  const [name, setName] = useState(reward?.name ?? '');
  const [desc, setDesc] = useState(reward?.description ?? '');
  const [cost, setCost] = useState(reward?.cost ?? 100);
  const [category, setCategory] = useState(reward?.category ?? 'Leisure');
  const [cooldown, setCooldown] = useState(reward ? reward.cooldownMs / 60000 : 0);
  const [selectedResources, setSelectedResources] = useState<ResourceAmount[]>(reward?.resources ?? []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: reward?.id ?? crypto.randomUUID(),
      name: name.trim(),
      description: desc.trim() || name.trim(),
      cost,
      resources: selectedResources,
      cooldownMs: cooldown * 60000,
      category,
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
      <div className="w-full max-w-md mx-4 rounded-xl p-6" style={{ background: '#0c0c1a', border: '1px solid rgba(0,224,255,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="font-bold text-sm tracking-widest" style={{ color: '#00e0ff' }}>{isEdit ? 'EDIT REWARD' : 'CREATE REWARD'}</span>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
          </div>
          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>DESCRIPTION</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
          </div>
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
          <div>
            <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
              <option>Leisure</option><option>Social</option><option>Premium</option><option>Custom</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-widest block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>RESOURCE COSTS</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_DEFS.map(rd => {
                const selected = selectedResources.find(r => r.resourceId === rd.id);
                return (
                  <button key={rd.id} onClick={() => toggleResource(rd.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ background: selected ? `${rd.color}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${selected ? rd.color + '55' : 'rgba(255,255,255,0.08)'}`, color: selected ? rd.color : 'rgba(255,255,255,0.3)' }}>
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
