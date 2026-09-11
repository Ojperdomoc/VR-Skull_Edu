import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Zap, Sparkles, MapPin, Volume2 } from 'lucide-react';
import type { Bone } from '../data/craniumData';
import { sfx } from '../utils/sound';

interface Props {
  bone: Bone | null;
  onClose: () => void;
  studied: boolean;
  onMarkStudied: (id: string) => void;
}

export default function BonePanel({ bone, onClose, studied, onMarkStudied }: Props) {
  const speak = () => {
    if (!bone) return;
    sfx.click();
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${bone.name}. ${bone.description} Dato curioso: ${bone.funFact}`);
      u.lang = 'es-ES';
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch {}
  };

  return (
    <AnimatePresence>
      {bone && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          className="glass-strong absolute bottom-4 right-4 top-4 z-40 flex w-[min(380px,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{ boxShadow: `0 0 50px ${bone.glow}` }}
        >
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${bone.color}, transparent)` }} />
          <div className="flex items-start justify-between gap-2 p-4 pb-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: bone.color }}>
                {bone.category} • CP-0{bone.checkpointId}
              </p>
              <h3 className="mt-0.5 text-xl font-black leading-tight text-white">{bone.name}</h3>
              <p className="text-xs italic text-slate-400">{bone.latin}</p>
            </div>
            <button onClick={onClose} className="rounded-lg bg-white/10 p-1.5 text-slate-400 hover:bg-white/20 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[13px] leading-relaxed text-slate-200">
              {bone.description}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="flex gap-2.5 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: bone.color + '22', color: bone.color }}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Función</p>
                  <p className="text-[13px] font-semibold text-white">{bone.funcion}</p>
                </div>
              </div>
              <div className="flex gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80">Dato curioso</p>
                  <p className="text-[13px] text-amber-100">{bone.funFact}</p>
                </div>
              </div>
              <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/15 text-violet-300">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resumen express</p>
                  <p className="text-[13px] text-slate-200">{bone.short}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-white/10 p-3">
            <button onClick={speak} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10">
              <Volume2 className="h-4 w-4" /> Escuchar
            </button>
            {!studied ? (
              <button
                onClick={() => { sfx.correct(); onMarkStudied(bone.id); }}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-slate-950 transition hover:scale-[1.02]"
                style={{ background: bone.color, boxShadow: `0 4px 20px ${bone.glow}` }}
              >
                <MapPin className="h-4 w-4" /> Marcar como estudiado
              </button>
            ) : (
              <div className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2.5 text-xs font-black text-emerald-300">
                ✓ Dominado
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
