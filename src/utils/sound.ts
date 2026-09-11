// Mini sintetizador WebAudio para efectos del juego (sin archivos externos)
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, delay = 0, slideTo?: number) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  enabled: true,
  click() { if (!this.enabled) return; tone(600, 0.08, 'square', 0.06); },
  hover() { if (!this.enabled) return; tone(880, 0.05, 'sine', 0.04); },
  correct() { if (!this.enabled) return; tone(523, 0.15, 'sine', 0.15); tone(659, 0.15, 'sine', 0.15, 0.12); tone(784, 0.3, 'sine', 0.18, 0.24); },
  wrong() { if (!this.enabled) return; tone(220, 0.25, 'sawtooth', 0.1); tone(160, 0.35, 'sawtooth', 0.1, 0.15); },
  unlock() { if (!this.enabled) return; tone(392, 0.12, 'triangle', 0.15); tone(523, 0.12, 'triangle', 0.15, 0.1); tone(659, 0.12, 'triangle', 0.15, 0.2); tone(1046, 0.4, 'triangle', 0.18, 0.3); },
  checkpoint() { if (!this.enabled) return; tone(300, 0.5, 'sine', 0.12, 0, 900); tone(1200, 0.3, 'sine', 0.1, 0.4); },
  select() { if (!this.enabled) return; tone(440, 0.1, 'triangle', 0.12, 0, 880); },
  teleport() { if (!this.enabled) return; tone(200, 0.4, 'sawtooth', 0.08, 0, 1200); },
  heartbeat() { if (!this.enabled) return; tone(60, 0.15, 'sine', 0.2); tone(60, 0.15, 'sine', 0.2, 0.25); },
};
