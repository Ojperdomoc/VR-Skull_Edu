import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanEye } from 'lucide-react';
import { BONES } from '../data/craniumData';
import { sfx } from '../utils/sound';

interface Props {
  selectedBoneId: string | null;
  onSelectBone: (id: string) => void;
  activeBones?: string[];
  identifyTarget?: string | null;
}

export default function AtlasView({ selectedBoneId, onSelectBone, activeBones, identifyTarget }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const leftBones = BONES.filter(b => b.side === 'left').sort((a, b) => a.y - b.y);
  const rightBones = BONES.filter(b => b.side === 'right').sort((a, b) => a.y - b.y);
  const centerBones = BONES.filter(b => b.side === 'center');

  const isDim = (id: string) => (activeBones ? !activeBones.includes(id) : false);
  const all = [...leftBones, ...rightBones, ...centerBones];

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      {/* Columna izquierda */}
      <div className="hidden w-56 shrink-0 flex-col justify-center gap-1 overflow-y-auto py-4 pr-2 lg:flex">
        {leftBones.map((b, i) => {
          const active = selectedBoneId === b.id || hoverId === b.id;
          const target = identifyTarget === b.id;
          return (
            <button
              key={b.id}
              onMouseEnter={() => { setHoverId(b.id); }}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => { sfx.select(); onSelectBone(b.id); }}
              className={`group flex items-center justify-end gap-2 rounded-l-lg border-r-2 py-1.5 pl-2 pr-3 text-right text-[12px] font-semibold transition-all ${active ? 'bg-white/10' : 'hover:bg-white/5'} ${isDim(b.id) ? 'opacity-35' : ''}`}
              style={{ borderColor: active || target ? b.color : 'transparent', color: active ? b.color : '#e2e8f0' }}
            >
              <span className="leading-tight">{b.name}</span>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: active ? b.color : 'rgba(255,255,255,0.12)', color: active ? '#020617' : '#cbd5e1' }}
              >
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Imagen central */}
      <div className="relative mx-auto aspect-[4/4.4] w-full max-w-[560px] flex-1 select-none">
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_0_60px_rgba(34,211,238,0.15)]">
          <img
            src="images/skull-exploded.jpg"
            alt="Cráneo explotado"
            className="h-full w-full object-cover"
            draggable={false}
          />
          {/* escaneo */}
          <div className="scanline pointer-events-none absolute inset-0" />
          {/* líneas SVG */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {all.map(b => {
              const active = selectedBoneId === b.id || hoverId === b.id || identifyTarget === b.id;
              const x2 = b.side === 'left' ? 0 : b.side === 'right' ? 100 : b.x;
              return (
                <g key={'l-' + b.id}>
                  <line
                    x1={`${b.x}%`} y1={`${b.y}%`}
                    x2={`${x2}%`} y2={`${b.y}%`}
                    stroke={b.color}
                    strokeWidth={active ? 2.2 : 1}
                    strokeDasharray={active ? '0' : '5 4'}
                    opacity={active ? 1 : isDim(b.id) ? 0.15 : 0.55}
                  />
                  <circle cx={`${b.x}%`} cy={`${b.y}%`} r={active ? 5 : 3} fill={b.color} opacity={active ? 1 : 0.7} />
                </g>
              );
            })}
          </svg>
          {/* hotspots */}
          {all.map((b, idx) => {
            const active = selectedBoneId === b.id;
            const hov = hoverId === b.id;
            const target = identifyTarget === b.id;
            return (
              <motion.button
                key={b.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoverId(b.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => { sfx.select(); onSelectBone(b.id); }}
                className={`hotspot-dot absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold backdrop-blur-sm transition-all ${target ? 'animate-bounce' : ''}`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  borderColor: b.color,
                  background: active || hov || target ? b.color : 'rgba(2,6,23,0.75)',
                  color: active || hov || target ? '#020617' : b.color,
                  boxShadow: active || target ? `0 0 22px ${b.color}` : 'none',
                  opacity: isDim(b.id) && !active ? 0.35 : 1,
                  zIndex: active ? 20 : 10,
                  fontSize: 12,
                }}
              >
                {target ? '?' : '+'}
                {(active || hov) && (
                  <span
                    className="absolute bottom-full mb-2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold"
                    style={{ background: '#020617', color: b.color, border: `1px solid ${b.color}` }}
                  >
                    {b.name}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur">
          <ScanEye className="h-4 w-4" /> Atlas anatómico 2D
        </div>
      </div>

      {/* Columna derecha */}
      <div className="hidden w-56 shrink-0 flex-col justify-center gap-1 overflow-y-auto py-4 pl-2 lg:flex">
        {rightBones.map((b, i) => {
          const active = selectedBoneId === b.id || hoverId === b.id;
          const target = identifyTarget === b.id;
          return (
            <button
              key={b.id}
              onMouseEnter={() => setHoverId(b.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => { sfx.select(); onSelectBone(b.id); }}
              className={`group flex items-center gap-2 rounded-r-lg border-l-2 py-1.5 pl-3 pr-2 text-left text-[12px] font-semibold transition-all ${active ? 'bg-white/10' : 'hover:bg-white/5'} ${isDim(b.id) ? 'opacity-35' : ''}`}
              style={{ borderColor: active || target ? b.color : 'transparent', color: active ? b.color : '#e2e8f0' }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: active ? b.color : 'rgba(255,255,255,0.12)', color: active ? '#020617' : '#cbd5e1' }}
              >
                {leftBones.length + i + 1}
              </span>
              <span className="leading-tight">{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* lista móvil */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {all.map(b => (
          <button
            key={b.id}
            onClick={() => { sfx.select(); onSelectBone(b.id); }}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${selectedBoneId === b.id ? '' : 'border-white/15 bg-white/5 text-slate-300'}`}
            style={selectedBoneId === b.id ? { borderColor: b.color, background: b.color + '22', color: b.color } : {}}
          >
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}
