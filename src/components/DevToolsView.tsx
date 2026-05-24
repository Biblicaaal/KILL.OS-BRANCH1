import { useState } from 'react';
import { Bug, DollarSign, Box, Zap, RotateCcw, Award } from 'lucide-react';
import { RESOURCE_DEFS } from '../constants';

interface DevToolsViewProps {
  onAddMoney: (amount: number) => void;
  onAddResource: (id: string, amount: number) => void;
  onCompleteTask: (id: string) => void;
  onSetCombo: (multiplier: number) => void;
  onResetDay: () => void;
  onResetMonth: () => void;
  onForceEndDay: () => void;
  onResetAll: () => void;
  onResetAchievements: () => void;
  tasks: { id: string; name: string }[];
}

export function DevToolsView({ onAddMoney, onAddResource, onCompleteTask, onSetCombo, onResetDay, onResetMonth, onForceEndDay, onResetAll, onResetAchievements, tasks }: DevToolsViewProps) {
  const [moneyAmount, setMoneyAmount] = useState(1000);
  const [resourceAmount, setResourceAmount] = useState(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bug size={14} style={{ color: '#ff4444' }} />
        <h2 className="text-xs font-bold tracking-widest" style={{ color: '#ff4444' }}>
          DEVELOPER TOOLS
        </h2>
      </div>

      <div className="rounded-lg p-4" style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)' }}>
        <div className="text-xs mb-3" style={{ color: 'rgba(255,68,68,0.5)' }}>
          These tools modify state directly. Use for testing only.
        </div>

        <div className="space-y-4">
          {/* Add money */}
          <DevSection icon={<DollarSign size={14} />} label="ADD MONEY">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={moneyAmount}
                onChange={e => setMoneyAmount(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffcc00' }}
              />
              <DevButton label="ADD" onClick={() => onAddMoney(moneyAmount)} />
            </div>
          </DevSection>

          {/* Add resources */}
          <DevSection icon={<Box size={14} />} label="ADD RESOURCES">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Amount:</span>
              <input
                type="number"
                value={resourceAmount}
                onChange={e => setResourceAmount(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_DEFS.map(rd => (
                <button
                  key={rd.id}
                  onClick={() => onAddResource(rd.id, resourceAmount)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: `${rd.color}18`, border: `1px solid ${rd.color}33`, color: rd.color }}
                >
                  {rd.icon} +{resourceAmount}
                </button>
              ))}
            </div>
          </DevSection>

          {/* Complete tasks */}
          <DevSection icon={<Zap size={14} />} label="COMPLETE TASK">
            <div className="flex flex-wrap gap-1.5">
              {tasks.map(t => (
                <DevButton key={t.id} label={t.name} onClick={() => onCompleteTask(t.id)} />
              ))}
            </div>
          </DevSection>

          {/* Set combo */}
          <DevSection icon={<Zap size={14} />} label="SET COMBO">
            <div className="flex flex-wrap gap-1.5">
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(v => (
                <DevButton key={v} label={`x${v}`} onClick={() => onSetCombo(v)} />
              ))}
            </div>
          </DevSection>

          {/* Reset actions */}
          <DevSection icon={<RotateCcw size={14} />} label="RESET ACTIONS">
            <div className="flex flex-wrap gap-1.5">
              <DevButton label="RESET DAY" onClick={onResetDay} danger />
              <DevButton label="RESET MONTH" onClick={onResetMonth} danger />
              <DevButton label="FORCE END DAY" onClick={onForceEndDay} danger />
              <DevButton label="RESET ALL DATA" onClick={onResetAll} danger />
            </div>
          </DevSection>

          {/* Reset achievements */}
          <DevSection icon={<Award size={14} />} label="RESET ACHIEVEMENTS">
            <div className="flex flex-wrap gap-1.5">
              <DevButton label="RESET ALL ACHIEVEMENTS" onClick={onResetAchievements} danger />
            </div>
          </DevSection>
        </div>
      </div>
    </div>
  );
}

function DevSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{icon}</span>
        <span className="text-[10px] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function DevButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-all duration-150"
      style={{
        background: danger ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.06)',
        border: danger ? '1px solid rgba(255,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
        color: danger ? '#ff4444' : 'rgba(255,255,255,0.5)',
      }}
    >
      {label}
    </button>
  );
}
