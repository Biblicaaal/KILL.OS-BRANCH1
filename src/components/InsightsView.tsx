import { useState } from 'react';
import { BarChart3, Plus, X, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { InsightPlatform, InsightMetric, InsightEntry } from '../types';

interface InsightsViewProps {
  platforms: InsightPlatform[];
  entries: InsightEntry[];
  onAddPlatform: (platform: InsightPlatform) => void;
  onRemovePlatform: (id: string) => void;
  onAddEntry: (entry: InsightEntry) => void;
}

export function InsightsView({ platforms, entries, onAddPlatform, onRemovePlatform, onAddEntry }: InsightsViewProps) {
  const [showCreatePlatform, setShowCreatePlatform] = useState(false);
  const [inputPlatform, setInputPlatform] = useState('');
  const [inputMetrics, setInputMetrics] = useState('');
  const [inputColor, setInputColor] = useState('#00e0ff');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [metricInputs, setMetricInputs] = useState<Record<string, string>>({});
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleCreatePlatform = () => {
    if (!inputPlatform.trim()) return;
    const metrics: InsightMetric[] = inputMetrics
      .split(',')
      .map(m => m.trim())
      .filter(Boolean)
      .map(m => ({ id: crypto.randomUUID(), name: m, unit: '' }));
    onAddPlatform({
      id: crypto.randomUUID(),
      name: inputPlatform.trim(),
      color: inputColor,
      metrics,
    });
    setShowCreatePlatform(false);
    setInputPlatform('');
    setInputMetrics('');
  };

  const handleMetricInput = (platformId: string, metricId: string, date: string) => {
    const val = Number(metricInputs[`${platformId}_${metricId}_${date}`]);
    if (isNaN(val)) return;
    onAddEntry({ platformId, metricId, date, value: val });
    setMetricInputs(prev => {
      const next = { ...prev };
      delete next[`${platformId}_${metricId}_${date}`];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          INTELLIGENCE FEED
        </h2>
        <button
          onClick={() => setShowCreatePlatform(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold tracking-widest"
          style={{ background: 'rgba(0,224,255,0.1)', border: '1px solid rgba(0,224,255,0.25)', color: '#00e0ff' }}
        >
          <Plus size={12} /> ADD PLATFORM
        </button>
      </div>

      {platforms.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <BarChart3 size={40} className="mx-auto mb-4" style={{ opacity: 0.2 }} />
          <div className="text-sm font-bold tracking-widest mb-1">NO INTELLIGENCE SOURCES</div>
          <div className="text-xs">Add platforms to start tracking metrics</div>
        </div>
      ) : (
        <div className="space-y-3">
          {platforms.map(platform => {
            const isSelected = selectedPlatform === platform.id;
            const platformEntries = entries.filter(e => e.platformId === platform.id);

            return (
              <div
                key={platform.id}
                className="rounded-lg overflow-hidden"
                style={{ border: `1px solid ${platform.color}33` }}
              >
                <button
                  onClick={() => setSelectedPlatform(isSelected ? null : platform.id)}
                  className="w-full flex items-center justify-between px-4 py-3"
                  style={{ background: `${platform.color}0d` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: platform.color, boxShadow: `0 0 6px ${platform.color}` }} />
                    <span className="font-bold text-sm tracking-wider" style={{ color: platform.color }}>
                      {platform.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)' }}>
                      {platform.metrics.length} metrics
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onRemovePlatform(platform.id); }}
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </button>

                {isSelected && (
                  <div className="px-4 py-4 space-y-5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {platform.metrics.map(metric => {
                      const metricEntries = platformEntries
                        .filter(e => e.metricId === metric.id)
                        .sort((a, b) => a.date.localeCompare(b.date));

                      const latestEntry = metricEntries[metricEntries.length - 1];
                      const prevEntry = metricEntries[metricEntries.length - 2];
                      const trend = latestEntry && prevEntry
                        ? latestEntry.value > prevEntry.value ? 'up' : latestEntry.value < prevEntry.value ? 'down' : 'flat'
                        : 'flat';

                      const isMetricSelected = selectedMetric === metric.id;
                      const displayEntries = metricEntries.slice(-14);

                      const maxVal = displayEntries.length > 0 ? Math.max(...displayEntries.map(e => e.value), 1) : 1;
                      const minVal = displayEntries.length > 0 ? Math.min(...displayEntries.map(e => e.value)) : 0;
                      const range = maxVal - minVal || 1;

                      return (
                        <div key={metric.id}>
                          <button
                            onClick={() => setSelectedMetric(isMetricSelected ? null : metric.id)}
                            className="w-full flex items-center justify-between mb-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {metric.name.toUpperCase()}
                              </span>
                              {latestEntry && (
                                <span className="text-sm font-black tabular-nums" style={{ color: platform.color }}>
                                  {latestEntry.value.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {trend === 'up' && <TrendingUp size={12} style={{ color: '#33ffcc' }} />}
                              {trend === 'down' && <TrendingDown size={12} style={{ color: '#ff4444' }} />}
                              {trend === 'flat' && <Minus size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                            </div>
                          </button>

                          {/* Line chart */}
                          {isMetricSelected && displayEntries.length > 1 && (
                            <div className="mb-3" style={{ height: 80 }}>
                              <svg width="100%" height="100%" viewBox={`0 0 ${displayEntries.length * 30} 80`} preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 20, 40, 60, 80].map(y => (
                                  <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                ))}
                                {/* Line */}
                                <polyline
                                  fill="none"
                                  stroke={platform.color}
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  points={displayEntries.map((e, i) => {
                                    const x = i * 30 + 15;
                                    const y = 75 - ((e.value - minVal) / range) * 65;
                                    return `${x},${y}`;
                                  }).join(' ')}
                                  style={{ filter: `drop-shadow(0 0 4px ${platform.color})` }}
                                />
                                {/* Area fill */}
                                <polygon
                                  fill={`${platform.color}11`}
                                  points={`15,75 ${displayEntries.map((e, i) => {
                                    const x = i * 30 + 15;
                                    const y = 75 - ((e.value - minVal) / range) * 65;
                                    return `${x},${y}`;
                                  }).join(' ')} ${(displayEntries.length - 1) * 30 + 15},75`}
                                />
                                {/* Dots */}
                                {displayEntries.map((e, i) => {
                                  const x = i * 30 + 15;
                                  const y = 75 - ((e.value - minVal) / range) * 65;
                                  return <circle key={i} cx={x} cy={y} r="2.5" fill={platform.color} style={{ filter: `drop-shadow(0 0 3px ${platform.color})` }} />;
                                })}
                              </svg>
                              <div className="flex justify-between mt-1">
                                <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                                  {displayEntries[0]?.date.slice(5)}
                                </span>
                                <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                                  {displayEntries[displayEntries.length - 1]?.date.slice(5)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Bar chart (compact) */}
                          {!isMetricSelected && displayEntries.length > 0 && (
                            <div className="flex items-end gap-0.5 h-8 mb-2">
                              {displayEntries.map((entry, i) => {
                                const height = ((entry.value - minVal) / range) * 100;
                                return (
                                  <div
                                    key={i}
                                    className="flex-1 rounded-t"
                                    style={{
                                      height: `${Math.max(height, 8)}%`,
                                      background: platform.color,
                                      opacity: 0.3 + (i / displayEntries.length) * 0.7,
                                      minHeight: 2,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {/* Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder={`Enter ${metric.name.toLowerCase()}`}
                              value={metricInputs[`${platform.id}_${metric.id}_${today}`] ?? ''}
                              onChange={e => setMetricInputs(prev => ({ ...prev, [`${platform.id}_${metric.id}_${today}`]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') handleMetricInput(platform.id, metric.id, today); }}
                              className="flex-1 px-3 py-1.5 rounded text-xs"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                            />
                            <button
                              onClick={() => handleMetricInput(platform.id, metric.id, today)}
                              className="px-3 py-1.5 rounded text-xs font-bold"
                              style={{ background: `${platform.color}22`, border: `1px solid ${platform.color}44`, color: platform.color }}
                            >
                              LOG
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create platform modal */}
      {showCreatePlatform && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md mx-4 rounded-xl p-6" style={{ background: '#0c0c1a', border: '1px solid rgba(0,224,255,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-sm tracking-widest" style={{ color: '#00e0ff' }}>ADD INTEL SOURCE</span>
              <button onClick={() => setShowCreatePlatform(false)} style={{ color: 'rgba(255,255,255,0.3)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>PLATFORM NAME</label>
                <input type="text" value={inputPlatform} onChange={e => setInputPlatform(e.target.value)} placeholder="e.g. DeviantArt"
                  className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
              </div>
              <div>
                <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>METRICS (comma-separated)</label>
                <input type="text" value={inputMetrics} onChange={e => setInputMetrics(e.target.value)} placeholder="e.g. Followers, Likes, Interactions"
                  className="w-full px-3 py-2 rounded text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
              </div>
              <div>
                <label className="text-[10px] tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>COLOR</label>
                <input type="color" value={inputColor} onChange={e => setInputColor(e.target.value)}
                  className="w-10 h-8 rounded cursor-pointer" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button
                onClick={handleCreatePlatform}
                disabled={!inputPlatform.trim()}
                className="w-full py-2.5 rounded font-bold text-sm tracking-widest"
                style={{
                  background: inputPlatform.trim() ? 'rgba(0,224,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${inputPlatform.trim() ? 'rgba(0,224,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: inputPlatform.trim() ? '#00e0ff' : 'rgba(255,255,255,0.2)',
                }}
              >
                ADD SOURCE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
