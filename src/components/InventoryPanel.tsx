import { Package, Coins, Gift } from 'lucide-react';
import { RESOURCE_DEFS, getRarityColor, getRarityLabel } from '../constants';
import type { Redeemable } from '../types';

interface InventoryPanelProps {
  money: number;
  resources: Record<string, number>;
  redeemables: Redeemable[];
  onRedeem: (id: string) => void;
}

export function InventoryPanel({ money, resources, redeemables, onRedeem }: InventoryPanelProps) {
  const grouped = RESOURCE_DEFS.reduce((acc, rd) => {
    const rarity = rd.rarity;
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(rd);
    return acc;
  }, {} as Record<string, typeof RESOURCE_DEFS>);

  const rarityOrder = ['common', 'uncommon', 'rare', 'epic'];

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        INVENTORY
      </h2>

      {/* Money */}
      <div
        className="rounded-lg p-5 flex items-center gap-4"
        style={{
          background: 'rgba(255,204,0,0.06)',
          border: '1px solid rgba(255,204,0,0.2)',
          boxShadow: '0 0 16px rgba(255,204,0,0.05)',
        }}
      >
        <Coins size={24} style={{ color: '#ffcc00' }} />
        <div>
          <div className="text-xs tracking-widest" style={{ color: 'rgba(255,204,0,0.6)' }}>MONEY</div>
          <div className="text-2xl font-black tabular-nums" style={{ color: '#ffcc00', textShadow: '0 0 12px rgba(255,204,0,0.5)' }}>
            {money.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Redeemables */}
      {redeemables.length > 0 && (
        <div>
          <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#33ffcc' }}>
            REDEEMABLES ({redeemables.length})
          </div>
          <div className="space-y-2">
            {redeemables.map(r => (
              <div
                key={r.id}
                className="rounded p-3 flex items-center justify-between"
                style={{ background: 'rgba(51,255,204,0.05)', border: '1px solid rgba(51,255,204,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <Gift size={14} style={{ color: '#33ffcc' }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: '#ffffff' }}>{r.rewardName}</div>
                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(r.purchasedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRedeem(r.id)}
                  className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest"
                  style={{ background: 'rgba(51,255,204,0.15)', border: '1px solid rgba(51,255,204,0.3)', color: '#33ffcc' }}
                >
                  USE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources by rarity */}
      {rarityOrder.map(rarity => {
        const items = grouped[rarity];
        if (!items || items.length === 0) return null;
        const rarityColor = getRarityColor(rarity);

        return (
          <div key={rarity}>
            <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: rarityColor }}>
              {getRarityLabel(rarity).toUpperCase()}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {items.map(rd => {
                const count = resources[rd.id] ?? 0;
                return (
                  <div
                    key={rd.id}
                    className="rounded p-3 flex items-center gap-3"
                    style={{
                      background: count > 0 ? `${rd.color}0d` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${count > 0 ? rd.color + '33' : 'rgba(255,255,255,0.05)'}`,
                      opacity: count > 0 ? 1 : 0.4,
                    }}
                  >
                    <div
                      className="text-xl flex items-center justify-center w-8 h-8 rounded"
                      style={{
                        color: rd.color,
                        background: `${rd.color}15`,
                        textShadow: count > 0 ? `0 0 8px ${rd.color}` : 'none',
                      }}
                    >
                      {rd.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: count > 0 ? rd.color : 'rgba(255,255,255,0.3)' }}>
                        {rd.name}
                      </div>
                      <div className="text-lg font-black tabular-nums" style={{ color: count > 0 ? '#ffffff' : 'rgba(255,255,255,0.2)' }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(resources).length === 0 && redeemables.length === 0 && (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Package size={32} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
          <div className="text-sm">No resources yet</div>
          <div className="text-xs mt-1">Complete tasks to earn resources</div>
        </div>
      )}
    </div>
  );
}
