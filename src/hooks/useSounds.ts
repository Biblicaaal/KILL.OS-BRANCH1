let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export function playTaskComplete() {
  playTone(523, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 160);
}

export function playComboIncrease() {
  playTone(880, 0.08, 'square', 0.08);
  setTimeout(() => playTone(1100, 0.12, 'square', 0.08), 60);
}

export function playRankUp() {
  playTone(523, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 120);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 240);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.12), 360);
}

export function playPurchase() {
  playTone(440, 0.08, 'triangle', 0.1);
  setTimeout(() => playTone(660, 0.12, 'triangle', 0.1), 60);
  setTimeout(() => playTone(880, 0.15, 'triangle', 0.08), 120);
}

export function playAchievement() {
  playTone(784, 0.2, 'sine', 0.15);
  setTimeout(() => playTone(988, 0.2, 'sine', 0.15), 150);
  setTimeout(() => playTone(1175, 0.3, 'sine', 0.12), 300);
  setTimeout(() => playTone(1568, 0.4, 'sine', 0.1), 450);
}

export function playFocusComplete() {
  playTone(440, 0.2, 'sine', 0.1);
  setTimeout(() => playTone(554, 0.2, 'sine', 0.1), 200);
  setTimeout(() => playTone(659, 0.3, 'sine', 0.1), 400);
}

export function playRedeem() {
  playTone(660, 0.1, 'triangle', 0.1);
  setTimeout(() => playTone(880, 0.15, 'triangle', 0.1), 80);
}
