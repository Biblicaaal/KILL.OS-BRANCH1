import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Timer, Brain, Clock, BookOpen } from 'lucide-react';
import type { FocusSession } from '../types';

interface FocusViewProps {
  session: FocusSession;
  focusTotalMs: number;
  onUpdateSession: (session: FocusSession) => void;
  onAddFocusTime: (ms: number, sessionType?: FocusSession['type']) => void;
}

const PRESETS = [
  { type: 'pomodoro' as const, label: 'Pomodoro', durationMs: 25 * 60 * 1000, desc: '25 min work / 5 min break' },
  { type: 'deepwork' as const, label: 'Deep Work', durationMs: 60 * 60 * 1000, desc: '60 min deep focus' },
  { type: 'deepwork' as const, label: 'Extended Deep', durationMs: 90 * 60 * 1000, desc: '90 min deep focus' },
  { type: 'custom' as const, label: 'Custom', durationMs: 30 * 60 * 1000, desc: 'Set your own time' },
];

const METHODS = [
  { name: 'Pomodoro Technique', desc: 'Work in 25-minute focused intervals with 5-minute breaks. After 4 cycles, take a longer 15-30 minute break. Great for maintaining focus and avoiding burnout.' },
  { name: 'Deep Work', desc: 'Extended periods (60-90 min) of distraction-free, cognitively demanding work. Eliminates context-switching costs and enables flow states.' },
  { name: 'Time Blocking', desc: 'Assign specific time blocks to specific tasks. Each block is dedicated to one type of work, reducing decision fatigue and increasing throughput.' },
  { name: 'Flow State', desc: 'A mental state of complete immersion. Achieved when challenge level matches skill level. Focus sessions help trigger and sustain flow.' },
];

export function FocusView({ session, focusTotalMs, onUpdateSession, onAddFocusTime }: FocusViewProps) {
  const [customMinutes, setCustomMinutes] = useState(30);
  const [showMethods, setShowMethods] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const elapsed = session.elapsedMs;
  const remaining = session.durationMs - elapsed;
  const progress = session.durationMs > 0 ? Math.min((elapsed / session.durationMs) * 100, 100) : 0;

  useEffect(() => {
    if (session.isRunning && !session.isComplete) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        const s = sessionRef.current;
        const newElapsed = s.elapsedMs + delta;

        if (newElapsed >= s.durationMs) {
          onUpdateSession({
            ...s,
            isRunning: false,
            isComplete: true,
            elapsedMs: s.durationMs,
          });
          onAddFocusTime(s.durationMs, s.type);
        } else {
          onUpdateSession({
            ...s,
            elapsedMs: newElapsed,
          });
        }
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.isRunning, session.isComplete, onUpdateSession, onAddFocusTime]);

  const startSession = useCallback((type: FocusSession['type'], durationMs: number) => {
    onUpdateSession({
      type,
      durationMs,
      startedAt: Date.now(),
      pausedAt: null,
      elapsedMs: 0,
      isRunning: true,
      isComplete: false,
    });
  }, [onUpdateSession]);

  const pause = useCallback(() => {
    onUpdateSession({ ...session, isRunning: false, pausedAt: Date.now() });
  }, [session]);

  const resume = useCallback(() => {
    onUpdateSession({ ...session, isRunning: true, pausedAt: null });
  }, [session]);

  const stop = useCallback(() => {
    if (session.elapsedMs > 0) {
      onAddFocusTime(session.elapsedMs, session.type);
    }
    onUpdateSession({
      type: 'pomodoro',
      durationMs: 25 * 60 * 1000,
      startedAt: null,
      pausedAt: null,
      elapsedMs: 0,
      isRunning: false,
      isComplete: false,
    });
  }, [session]);

  const formatMs = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalHours = (focusTotalMs / 3600000).toFixed(1);
  const isActive = session.startedAt !== null;

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        FOCUS MODE
      </h2>

      {/* Total focus time */}
      <div
        className="rounded-lg p-4 flex items-center gap-4"
        style={{ background: 'rgba(0,224,255,0.06)', border: '1px solid rgba(0,224,255,0.2)' }}
      >
        <Clock size={20} style={{ color: '#00e0ff' }} />
        <div>
          <div className="text-[10px] tracking-widest" style={{ color: 'rgba(0,224,255,0.6)' }}>TOTAL FOCUS TIME</div>
          <div className="text-xl font-black tabular-nums" style={{ color: '#00e0ff', textShadow: '0 0 10px rgba(0,224,255,0.5)' }}>
            {totalHours}h
          </div>
        </div>
      </div>

      {/* Timer display */}
      {isActive ? (
        <div className="text-center space-y-4">
          <div
            className="text-6xl font-black tabular-nums"
            style={{
              color: session.isComplete ? '#33ffcc' : session.isRunning ? '#00e0ff' : '#ffcc00',
              textShadow: session.isRunning ? '0 0 30px rgba(0,224,255,0.6)' : '0 0 20px rgba(255,204,0,0.4)',
            }}
          >
            {session.isComplete ? 'DONE' : formatMs(remaining)}
          </div>

          {/* Progress ring */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke={session.isComplete ? '#33ffcc' : '#00e0ff'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s', filter: `drop-shadow(0 0 6px ${session.isComplete ? '#33ffcc' : '#00e0ff'})` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {session.type === 'pomodoro' ? 'POMODORO' : session.type === 'deepwork' ? 'DEEP WORK' : 'CUSTOM'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!session.isComplete && (
              session.isRunning ? (
                <button onClick={pause} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm tracking-widest"
                  style={{ background: 'rgba(255,204,0,0.15)', border: '1px solid rgba(255,204,0,0.3)', color: '#ffcc00' }}>
                  <Pause size={16} /> PAUSE
                </button>
              ) : (
                <button onClick={resume} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm tracking-widest"
                  style={{ background: 'rgba(0,224,255,0.15)', border: '1px solid rgba(0,224,255,0.3)', color: '#00e0ff' }}>
                  <Play size={16} /> RESUME
                </button>
              )
            )}
            <button onClick={stop} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm tracking-widest"
              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444' }}>
              <Square size={16} /> {session.isComplete ? 'DISMISS' : 'STOP'}
            </button>
          </div>

          {/* Passive reward info */}
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Focus time earns money + resources passively
          </div>
        </div>
      ) : (
        <>
          {/* Session presets */}
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  const dur = preset.type === 'custom' ? customMinutes * 60000 : preset.durationMs;
                  startSession(preset.type, dur);
                }}
                className="rounded-lg p-4 text-left transition-all duration-200"
                style={{
                  background: 'rgba(0,224,255,0.05)',
                  border: '1px solid rgba(0,224,255,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {preset.type === 'pomodoro' ? <Timer size={14} style={{ color: '#00e0ff' }} /> :
                   preset.type === 'deepwork' ? <Brain size={14} style={{ color: '#ff2ed1' }} /> :
                   <Clock size={14} style={{ color: '#ffcc00' }} />}
                  <span className="font-bold text-sm tracking-wider" style={{ color: '#ffffff' }}>
                    {preset.label}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{preset.desc}</div>
                {preset.type === 'custom' && (
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(Number(e.target.value))}
                    min={1}
                    max={180}
                    className="mt-2 w-20 px-2 py-1 rounded text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Methods education */}
          <div>
            <button
              onClick={() => setShowMethods(!showMethods)}
              className="flex items-center gap-2 text-xs font-bold tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <BookOpen size={12} />
              {showMethods ? 'HIDE METHODS' : 'LEARN METHODS'}
            </button>
            {showMethods && (
              <div className="space-y-3">
                {METHODS.map(m => (
                  <div key={m.name} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="font-bold text-sm mb-1" style={{ color: '#ffffff' }}>{m.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
