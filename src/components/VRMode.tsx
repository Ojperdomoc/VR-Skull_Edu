import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Glasses, Move3d, Volume2 } from 'lucide-react';
import { BONES } from '../data/craniumData';
import { sfx } from '../utils/sound';

interface Props {
  selectedBoneId: string | null;
  onSelectBone: (id: string) => void;
  onExit: () => void;
}

const DWELL_MS = 1600;

export default function VRMode({ selectedBoneId, onSelectBone, onExit }: Props) {
  const [gazingId, setGazingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [gyro, setGyro] = useState({ x: 0, y: 0 });
  const [audioOn, setAudioOn] = useState(false);
  const timer = useRef<number | null>(null);
  const startRef = useRef(0);

  const selected = BONES.find(b => b.id === selectedBoneId);

  // dwell gaze
  const beginGaze = (id: string) => {
    setGazingId(id);
    setProgress(0);
    startRef.current = Date.now();
    if (timer.current) cancelAnimationFrame(timer.current);
    const tick = () => {
      const el = Date.now() - startRef.current;
      const p = Math.min(1, el / DWELL_MS);
      setProgress(p);
      if (p >= 1) {
        sfx.select();
        onSelectBone(id);
        speak(BONES.find(b => b.id === id)?.name + '. ' + (BONES.find(b => b.id === id)?.short || ''));
        setGazingId(null);
        setProgress(0);
        return;
      }
      timer.current = requestAnimationFrame(tick);
    };
    timer.current = requestAnimationFrame(tick);
  };
  const endGaze = () => {
    if (timer.current) cancelAnimationFrame(timer.current);
    setGazingId(null);
    setProgress(0);
  };

  // gyro parallax
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      setGyro({ x: Math.max(-1, Math.min(1, e.gamma / 40)), y: Math.max(-1, Math.min(1, (e.beta - 45) / 40)) });
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { if (timer.current) cancelAnimationFrame(timer.current); };
  }, []);

  const speak = (text: string) => {
    if (!audioOn) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch {}
  };

  const EyeView = ({ eye }: { eye: 'L' | 'R' }) => (
    <div className="vr-split-left relative h-full w-1/2 overflow-hidden bg-black">
      {/* lente */}
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 72%, black 96%)' }} />
      {/* escena */}
      <div
        className="absolute inset-4 overflow-hidden rounded-[3rem] border border-cyan-400/20 transition-transform duration-200"
        style={{ transform: `translate(${gyro.x * (eye === 'L' ? 10 : -10)}px, ${gyro.y * 8}px)` }}
      >
        <img src="images/skull-exploded.jpg" className="h-full w-full object-cover" style={{ transform: `scale(1.15) translateX(${eye === 'L' ? -2 : 2}%)` }} alt="" />
        <div className="absolute inset-0 bg-cyan-950/20" />
        {/* grid hud */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* hotspots */}
        {BONES.map(b => {
          const active = selectedBoneId === b.id;
          const gazing = gazingId === b.id;
          return (
            <button
              key={eye + b.id}
              onMouseEnter={() => beginGaze(b.id)}
              onMouseLeave={endGaze}
              onTouchStart={() => beginGaze(b.id)}
              onClick={() => { onSelectBone(b.id); }}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                {gazing && (
                  <svg className="absolute -inset-1 h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={b.color} strokeWidth="3" strokeDasharray="94" strokeDashoffset={94 - 94 * progress} strokeLinecap="round" />
                  </svg>
                )}
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-black transition-all ${active ? 'scale-125' : ''}`}
                  style={{ borderColor: b.color, background: active ? b.color : 'rgba(2,6,23,0.8)', color: active ? '#020617' : b.color, boxShadow: active ? `0 0 18px ${b.color}` : 'none' }}
                >
                  ◉
                </span>
              </span>
            </button>
          );
        })}
        {/* retícula central */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/50">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </div>
        </div>
        {/* info ojo */}
        <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[10px] font-bold text-cyan-300">
          OJO {eye} • 60FPS
        </div>
        <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/70 p-2.5 backdrop-blur border border-white/10">
          {selected ? (
            <div>
              <p className="text-xs font-black" style={{ color: selected.color }}>{selected.name}</p>
              <p className="text-[11px] text-slate-300 leading-tight">{selected.short}</p>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Mira un punto ◉ por 1.5s para seleccionarlo</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex bg-black">
      <EyeView eye="L" />
      {/* divisor */}
      <div className="relative z-30 flex w-2 flex-col items-center justify-center bg-black">
        <div className="h-full w-px bg-cyan-400/20" />
      </div>
      <EyeView eye="R" />

      {/* controles flotantes */}
      <div className="absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-4 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur">
          <Glasses className="h-4 w-4" /> MODO VR • GIRA TU CELULAR HORIZONTAL
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
        <button onClick={() => setAudioOn(!audioOn)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold backdrop-blur ${audioOn ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300' : 'border-white/20 bg-black/60 text-slate-300'}`}>
          <Volume2 className="h-4 w-4" /> {audioOn ? 'Narración ON' : 'Narración OFF'}
        </button>
        <button onClick={() => { try { (DeviceOrientationEvent as any).requestPermission?.(); } catch {} }} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold text-slate-300 backdrop-blur">
          <Move3d className="h-4 w-4" /> Activar giroscopio
        </button>
        <button onClick={() => { document.exitFullscreen?.().catch(() => {}); onExit(); }} className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white shadow-lg shadow-red-500/30">
          <X className="h-4 w-4" /> Salir VR
        </button>
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute left-1/2 top-16 z-40 w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border bg-slate-950/90 p-4 backdrop-blur-xl" style={{ borderColor: selected.color + '55' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: selected.color }}>{selected.category} • {selected.latin}</p>
              <h4 className="text-lg font-black text-white">{selected.name}</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{selected.description}</p>
              <p className="mt-2 rounded-lg bg-white/5 p-2 text-[11px] text-amber-200">✨ {selected.funFact}</p>
            </div>
            <button onClick={() => onSelectBone('__none__')} className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
