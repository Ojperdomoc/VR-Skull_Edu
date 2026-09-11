import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Brain, Glasses, Map as MapIcon, Play, Lock, Star, Check, ChevronRight, Volume2, VolumeX,
  Trophy, GraduationCap, Sparkles, Scan, BookOpen, Timer, Target, Zap, Award, Printer,
  RotateCcw, Home, Flag, Eye, Boxes, Layers, Shield, Ear, Smile, Heart, Swords,
} from 'lucide-react';
import StarsBackground from './components/StarsBackground';
import HologramSkull from './components/HologramSkull';
import AtlasView from './components/AtlasView';
import QuizEngine from './components/QuizEngine';
import BonePanel from './components/BonePanel';
import VRMode from './components/VRMode';
import { BONES, CHECKPOINTS, QUESTIONS, getRank, RANKS } from './data/craniumData';
import { sfx } from './utils/sound';

type Screen = 'landing' | 'hub' | 'explore' | 'quiz' | 'final';

const CP_ICONS: Record<string, any> = { shield: Shield, ear: Ear, smile: Smile, zap: Zap, trophy: Trophy };

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [playerName, setPlayerName] = useState('');
  const [grade, setGrade] = useState('6° Primaria');
  const [started, setStarted] = useState(false);

  const [xp, setXp] = useState(0);
  const [unlocked, setUnlocked] = useState<number[]>([1]);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [studied, setStudied] = useState<string[]>([]);
  const [currentCP, setCurrentCP] = useState(1);
  const [selectedBoneId, setSelectedBoneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'atlas'>('3d');
  const [explode, setExplode] = useState(0.45);
  const [autoRotate, setAutoRotate] = useState(true);
  const [vrMode, setVrMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [identifyTarget, setIdentifyTarget] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<null | { score: number; maxScore: number; correct: number; total: number; stars: number; xpEarned: number }>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const rank = getRank(xp);
  const nextRank = RANKS.find(r => r.minXP > xp);
  const xpProgress = nextRank ? Math.min(100, ((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100) : 100;

  const cp = CHECKPOINTS.find(c => c.id === currentCP)!;
  const cpBones = useMemo(() => BONES.filter(b => cp?.bones.includes(b.id)), [cp]);
  const cpQuestions = useMemo(() => QUESTIONS.filter(q => q.checkpointId === currentCP), [currentCP]);
  const studiedInCP = cpBones.filter(b => studied.includes(b.id)).length;
  const selectedBone = BONES.find(b => b.id === selectedBoneId) || null;
  const completedCount = Object.keys(stars).length;
  const allComplete = CHECKPOINTS.every(c => (stars[c.id] || 0) >= 2);

  // persistencia
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cranium-vr-save');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.xp) setXp(d.xp);
        if (d.unlocked) setUnlocked(d.unlocked);
        if (d.stars) setStars(d.stars);
        if (d.studied) setStudied(d.studied);
        if (d.playerName) { setPlayerName(d.playerName); setStarted(true); }
        if (d.grade) setGrade(d.grade);
        if (d.totalCorrect) setTotalCorrect(d.totalCorrect);
        if (d.totalAnswered) setTotalAnswered(d.totalAnswered);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('cranium-vr-save', JSON.stringify({ xp, unlocked, stars, studied, playerName, grade, totalCorrect, totalAnswered }));
    } catch {}
  }, [xp, unlocked, stars, studied, playerName, grade, totalCorrect, totalAnswered]);

  useEffect(() => { sfx.enabled = soundOn; }, [soundOn]);

  const startGame = () => {
    if (!playerName.trim()) return;
    sfx.unlock();
    setStarted(true);
    setScreen('hub');
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#22d3ee', '#a78bfa', '#f472b6'] });
  };

  const enterCheckpoint = (id: number) => {
    if (!unlocked.includes(id)) { sfx.wrong(); return; }
    sfx.teleport();
    setCurrentCP(id);
    setSelectedBoneId(null);
    setScreen('explore');
  };

  const handleSelectBone = (id: string) => {
    if (id === '__none__') { setSelectedBoneId(null); return; }
    setSelectedBoneId(id);
  };

  const markStudied = (id: string) => {
    if (!studied.includes(id)) {
      setStudied(s => [...s, id]);
      setXp(x => x + 25);
    }
  };

  const startQuiz = () => {
    sfx.checkpoint();
    setSelectedBoneId(null);
    setScreen('quiz');
  };

  const handleQuizFinish = (result: { score: number; maxScore: number; correct: number; total: number; stars: number; xpEarned: number }) => {
    setLastResult(result);
    setTotalCorrect(c => c + result.correct);
    setTotalAnswered(a => a + result.total);
    const prevStars = stars[currentCP] || 0;
    if (result.stars > prevStars) setStars(s => ({ ...s, [currentCP]: result.stars }));
    setXp(x => x + result.xpEarned + result.stars * 50);
    // desbloquear siguiente
    if (result.stars >= 2 && currentCP < 5 && !unlocked.includes(currentCP + 1)) {
      setUnlocked(u => [...u, currentCP + 1]);
    }
    setShowResult(true);
    if (result.stars >= 2) {
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 }, colors: ['#22d3ee', '#34d399', '#fbbf24', '#f472b6'] });
      setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 250);
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 400);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    if (lastResult && lastResult.stars >= 2) {
      if (currentCP >= 5 && CHECKPOINTS.every(c => (stars[c.id] || (c.id === currentCP ? lastResult.stars : 0)) >= 2)) {
        setScreen('final');
      } else {
        setScreen('hub');
      }
    }
  };

  const resetGame = () => {
    localStorage.removeItem('cranium-vr-save');
    setXp(0); setUnlocked([1]); setStars({}); setStudied([]);
    setTotalCorrect(0); setTotalAnswered(0);
    setScreen('hub');
  };

  /* ============ LANDING ============ */
  if (!started || screen === 'landing') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030712]">
        <StarsBackground />
        <div className="bg-grid fixed inset-0 opacity-60" />
        {/* nav */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/30">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-black tracking-wide text-white">CRANIUM<span className="text-cyan-400">VR</span></p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Expedición Anatómica</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">✓ Para colegios</span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">🥽 Compatible Cardboard</span>
          </div>
        </nav>

        {/* hero */}
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-6 lg:grid-cols-2">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> Juego educativo de realidad virtual • Ciencias Naturales
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 font-display text-4xl font-black leading-[1.05] text-white md:text-6xl">
              Viaja dentro del <span className="text-shimmer">CRÁNEO HUMANO</span> en realidad virtual
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-400">
              Explora las <b className="text-white">16 estructuras del cráneo</b> como en tu lámina de anatomía: frontal, parietal, esfenoides, mandíbula y más. Supera <b className="text-cyan-300">5 checkpoints</b>, responde desafíos y gana tu <b className="text-amber-300">certificado de Explorador Craneal</b>.
            </motion.p>

            {/* login card */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass mt-6 max-w-lg rounded-2xl p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-white"><GraduationCap className="h-5 w-5 text-cyan-400" /> Registro del explorador</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                <input
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Tu nombre (ej: Valentina R.)"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && startGame()}
                />
                <select value={grade} onChange={e => setGrade(e.target.value)} className="rounded-xl border border-white/15 bg-slate-950/60 px-3 py-3 text-sm font-semibold text-white focus:border-cyan-400 focus:outline-none">
                  {['4° Primaria', '5° Primaria', '6° Primaria', '7° Básica', '8° Básica', '9° Básica', '10° Bachillerato', '11° Bachillerato'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <button
                onClick={startGame}
                disabled={!playerName.trim()}
                className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-6 py-4 font-display text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.02] disabled:opacity-40"
              >
                <Play className="h-5 w-5 fill-white" /> Iniciar misión VR
                <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">Sin visor también puedes jugar: usa el modo pantalla táctil o el modo VR con tu celular.</p>
            </motion.div>

            {/* stats */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {[['16', 'estructuras'], ['5', 'checkpoints'], ['21', 'preguntas'], ['3D+VR', 'inmersivo']].map(([n, l]) => (
                <div key={l} className="glass rounded-xl px-4 py-2 text-center">
                  <p className="font-display text-xl font-black text-cyan-300">{n}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* visual */}
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative">
            <div className="animate-float-slow relative overflow-hidden rounded-3xl border border-cyan-400/25 shadow-[0_0_80px_rgba(34,211,238,0.25)]">
              <img src="images/skull-hologram.jpg" alt="Cráneo holográfico" className="aspect-[4/4.2] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="scanline absolute inset-0" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="h-3 w-3 rounded-full bg-emerald-400" /></span>
                  <p className="text-xs font-bold text-white">Simulación lista • Sector craneal cargado</p>
                </div>
                <Glasses className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            {/* chips flotantes */}
            <div className="animate-float absolute -left-3 top-8 rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 text-xs font-bold text-cyan-300 shadow-xl backdrop-blur md:-left-8">
              🦴 Hueso frontal detectado
            </div>
            <div className="animate-float absolute -right-2 top-1/3 rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 text-xs font-bold text-violet-300 shadow-xl backdrop-blur md:-right-6" style={{ animationDelay: '1s' }}>
              🧠 Neurocráneo: 8 huesos
            </div>
            <div className="animate-float absolute bottom-24 -left-2 rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 text-xs font-bold text-amber-300 shadow-xl backdrop-blur md:-left-6" style={{ animationDelay: '2s' }}>
              ⭐ Checkpoint 1 desbloqueado
            </div>
          </motion.div>
        </div>

        {/* features */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Boxes, t: 'Visor 3D holográfico', d: 'Rota, acerca y explota el cráneo en 16 piezas de colores. Toca cada hueso para estudiarlo.', c: '#22d3ee' },
              { icon: MapIcon, t: 'Atlas como tu lámina', d: 'Vista explotada idéntica a la imagen del libro, con etiquetas y líneas guía interactivas.', c: '#a78bfa' },
              { icon: Flag, t: '5 Checkpoints', d: 'Avanza por sectores desbloqueables: bóveda, núcleo, rostro, mandíbula y base profunda.', c: '#34d399' },
              { icon: Swords, t: 'Quizzes que enseñan', d: '21 preguntas con pistas, explicación, rachas y estrellas. Necesitas 70% para avanzar.', c: '#fbbf24' },
            ].map((f, i) => (
              <motion.div key={f.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: f.c + '22', color: f.c }}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-bold text-white">{f.t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{f.d}</p>
              </motion.div>
            ))}
          </div>

          {/* cómo jugar */}
          <div className="glass mt-4 rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-black text-white md:text-2xl">¿Cómo se juega? <span className="text-cyan-400">Misión en 4 pasos</span></h2>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {[
                ['1', 'EXPLORA', 'Navega el cráneo 3D y el atlas 2D. Toca cada hueso, escucha su historia y márcalo como estudiado.'],
                ['2', 'SUPERA EL CHECKPOINT', 'Responde el quiz del sector: opción múltiple, verdadero/falso y localización táctil en el visor.'],
                ['3', 'CONSIGUE ESTRELLAS', 'Con 70% o más (2⭐) desbloqueas el siguiente sector. ¡Las rachas dan puntos extra!'],
                ['4', 'CERTIFÍCATE', 'Completa los 5 sectores, aprueba el examen final y descarga tu diploma de Explorador Craneal.'],
              ].map(([n, t, d]) => (
                <div key={n} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="font-display text-3xl font-black text-white/10">{n}</span>
                  <p className="font-display text-sm font-black text-cyan-300">{t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4 md:flex-row">
              <p className="text-sm text-amber-100"><b>👩‍🏫 Para docentes:</b> el juego registra XP, estrellas y precisión por estudiante. Ideal para proyectar en clase o usar con visores Cardboard.</p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300"><BookOpen className="h-4 w-4" /> Alineado a Ciencias Naturales 5°–9°</div>
            </div>
          </div>
          <p className="mt-6 pb-8 text-center text-xs text-slate-600">CRANIUM VR • Juego educativo • Hecho para exploradores del cuerpo humano 🦴</p>
        </div>
      </div>
    );
  }

  /* ============ HUD ============ */
  const hud = (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <button onClick={() => { sfx.click(); setScreen('hub'); }} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-black leading-none text-white">CRANIUM<span className="text-cyan-400">VR</span></p>
            <p className="text-[10px] font-bold text-slate-400">{playerName} • {grade}</p>
          </div>
        </button>
        {/* xp */}
        <div className="ml-2 flex-1 sm:max-w-xs">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-300">{rank.icon} {rank.name}</span>
            <span className="text-cyan-300">{xp} XP</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" animate={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 md:flex">
            <Eye className="h-4 w-4 text-violet-300" /> {studied.length}/{BONES.length}
          </div>
          <div className="hidden items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-bold text-amber-300 md:flex">
            <Star className="h-4 w-4 fill-amber-300" /> {Object.values(stars).reduce((a, b) => a + b, 0)}/15
          </div>
          <button onClick={() => setSoundOn(!soundOn)} className="rounded-lg bg-white/5 p-2 text-slate-300 hover:bg-white/10">
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={() => { sfx.click(); setVrMode(true); }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-600 px-3 py-2 text-xs font-black text-white shadow-lg shadow-fuchsia-500/25 transition hover:scale-105">
            <Glasses className="h-4 w-4" /> <span className="hidden sm:inline">MODO VR</span>
          </button>
        </div>
      </div>
    </header>
  );

  /* ============ HUB ============ */
  if (screen === 'hub') {
    return (
      <div className="relative min-h-screen bg-[#030712]">
        <StarsBackground />
        {hud}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400"><MapIcon className="h-4 w-4" /> Mapa de misión</p>
              <h1 className="mt-1 font-display text-2xl font-black text-white md:text-3xl">Hola, explorador <span className="text-cyan-300">{playerName.split(' ')[0]}</span> 👋</h1>
              <p className="mt-1 text-sm text-slate-400">Completa los 5 checkpoints en orden. Necesitas <b className="text-white">2 estrellas (70%)</b> para desbloquear el siguiente sector.</p>
            </div>
            <div className="glass flex items-center gap-4 rounded-2xl px-4 py-3">
              <div className="text-center"><p className="font-display text-2xl font-black text-white">{completedCount}/5</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sectores</p></div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center"><p className="font-display text-2xl font-black text-emerald-300">{totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precisión</p></div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center"><p className="font-display text-2xl font-black text-amber-300">{xp}</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">XP total</p></div>
            </div>
          </div>

          <div className="relative mt-6">
            <div className="absolute bottom-8 left-[27px] top-8 w-1 rounded-full bg-gradient-to-b from-cyan-400 via-violet-500 to-emerald-400 opacity-30 md:left-1/2" />
            <div className="grid gap-4">
              {CHECKPOINTS.map((c, i) => {
                const isUnlocked = unlocked.includes(c.id);
                const st = stars[c.id] || 0;
                const done = st >= 2;
                const Icon = CP_ICONS[c.icon] || Flag;
                const cpQs = QUESTIONS.filter(q => q.checkpointId === c.id);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative ml-14 rounded-2xl border p-5 transition-all md:ml-0 md:grid md:grid-cols-[1fr_auto] md:gap-6 ${isUnlocked ? 'glass hover:border-cyan-400/40' : 'border-white/5 bg-slate-950/40 opacity-60'}`}
                  >
                    <div className={`absolute -left-14 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border-2 shadow-xl md:left-1/2 md:-translate-x-[calc(50%+0px)] md:-top-0 md:translate-y-0 md:hidden`} style={{ borderColor: isUnlocked ? c.color : '#334155', background: isUnlocked ? '#020617' : '#0f172a', color: isUnlocked ? c.color : '#475569', boxShadow: isUnlocked ? `0 0 24px ${c.color}44` : 'none' }}>
                      {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 md:flex" style={{ borderColor: isUnlocked ? c.color : '#334155', background: '#020617', color: isUnlocked ? c.color : '#475569', boxShadow: isUnlocked ? `0 0 24px ${c.color}44` : 'none' }}>
                        {isUnlocked ? <Icon className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md px-2 py-0.5 font-mono text-[10px] font-black" style={{ background: c.color + '22', color: c.color }}>{c.code}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><Timer className="h-3 w-3" /> {c.duration}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><Target className="h-3 w-3" /> {cpQs.length} preguntas</span>
                          {done && <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-black text-emerald-300"><Check className="h-3 w-3" /> SUPERADO</span>}
                        </div>
                        <h3 className="mt-1.5 font-display text-lg font-black text-white">{c.title} <span className="text-sm font-bold text-slate-500">• {c.subtitle}</span></h3>
                        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-400">{c.description}</p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {c.bones.map(bid => {
                            const b = BONES.find(x => x.id === bid)!;
                            const st2 = studied.includes(bid);
                            return (
                              <span key={bid} className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${st2 ? '' : 'border-white/10 text-slate-500'}`} style={st2 ? { borderColor: b.color + '66', color: b.color, background: b.color + '11' } : {}}>
                                {st2 ? '✓' : '○'} {b.name}
                              </span>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3].map(s => (
                            <Star key={s} className={`h-5 w-5 ${s <= st ? 'fill-amber-300 text-amber-300' : 'text-slate-700'}`} />
                          ))}
                          {st > 0 && <span className="ml-1 text-xs font-bold text-amber-300">{st}/3 estrellas</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 md:mt-0 md:flex-col md:justify-center">
                      <button
                        onClick={() => enterCheckpoint(c.id)}
                        disabled={!isUnlocked}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition md:w-44 ${isUnlocked ? `bg-gradient-to-r ${c.gradient} text-white shadow-xl hover:scale-105` : 'bg-white/5 text-slate-600'}`}
                      >
                        {isUnlocked ? (done ? <><RotateCcw className="h-4 w-4" /> Repasar</> : <><Play className="h-4 w-4 fill-white" /> Explorar</>) : <><Lock className="h-4 w-4" /> Bloqueado</>}
                      </button>
                      {isUnlocked && !done && (
                        <p className="text-center text-[11px] font-bold text-slate-500">🎯 Misión: {c.mission}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {allComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setScreen('final')}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-5 font-display text-lg font-black text-amber-200 transition hover:scale-[1.01]"
            >
              <Award className="h-7 w-7" /> ¡MISIÓN COMPLETA! Reclamar certificado
            </motion.button>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => { setStarted(false); setScreen('landing'); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white"><Home className="h-4 w-4" /> Inicio</button>
            <button onClick={resetGame} className="text-xs font-bold text-slate-600 hover:text-red-400">Reiniciar progreso</button>
          </div>
        </div>
        {vrMode && <VRMode selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} onExit={() => setVrMode(false)} />}
      </div>
    );
  }

  /* ============ EXPLORE ============ */
  if (screen === 'explore') {
    return (
      <div className="relative flex min-h-screen flex-col bg-[#030712]">
        <StarsBackground />
        {hud}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 lg:flex-row">
          {/* visor */}
          <div className="relative flex min-h-[480px] flex-[1.7] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 lg:min-h-[calc(100vh-140px)]">
            {/* toolbar visor */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 p-3">
              <div className="flex rounded-xl bg-white/5 p-1">
                <button onClick={() => { sfx.click(); setViewMode('3d'); }} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition ${viewMode === '3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                  <Boxes className="h-4 w-4" /> Holograma 3D
                </button>
                <button onClick={() => { sfx.click(); setViewMode('atlas'); }} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition ${viewMode === 'atlas' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                  <Scan className="h-4 w-4" /> Atlas 2D
                </button>
              </div>
              {viewMode === '3d' && (
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5">
                  <Layers className="h-4 w-4 shrink-0 text-cyan-300" />
                  <span className="hidden text-[11px] font-bold text-slate-400 sm:inline">Explotar</span>
                  <input type="range" min={0} max={1.2} step={0.05} value={explode} onChange={e => setExplode(parseFloat(e.target.value))} className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                  <button onClick={() => setAutoRotate(!autoRotate)} className={`rounded-md px-2 py-0.5 text-[10px] font-black ${autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-slate-500'}`}>ROTAR</button>
                </div>
              )}
              <button onClick={() => { sfx.click(); setVrMode(true); }} className="flex items-center gap-1.5 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-black text-fuchsia-300 hover:bg-fuchsia-500/20">
                <Glasses className="h-4 w-4" /> VR
              </button>
            </div>
            {/* visor contenido */}
            <div className="relative flex-1">
              {viewMode === '3d' ? (
                <HologramSkull selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} explode={explode} activeBones={cp.bones} autoRotate={autoRotate} />
              ) : (
                <div className="h-full p-3"><AtlasView selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} activeBones={cp.bones} /></div>
              )}
              <BonePanel bone={selectedBone} onClose={() => setSelectedBoneId(null)} studied={selectedBone ? studied.includes(selectedBone.id) : false} onMarkStudied={markStudied} />
            </div>
          </div>

          {/* panel misión */}
          <div className="flex w-full flex-col gap-3 lg:w-[340px]">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md px-2 py-0.5 font-mono text-[10px] font-black" style={{ background: cp.color + '22', color: cp.color }}>{cp.code}</span>
                <button onClick={() => setScreen('hub')} className="text-[11px] font-bold text-slate-500 hover:text-white">← Volver al mapa</button>
              </div>
              <h2 className="mt-2 font-display text-xl font-black text-white">{cp.title}</h2>
              <p className="text-xs font-bold" style={{ color: cp.color }}>{cp.subtitle}</p>
              <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-xs leading-relaxed text-slate-300">🎯 <b>Misión:</b> {cp.mission}</p>
              {/* progreso estudio */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Estudio del sector</span>
                  <span className="text-white">{studiedInCP}/{cpBones.length}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full" style={{ background: cp.color }} animate={{ width: `${(studiedInCP / cpBones.length) * 100}%` }} />
                </div>
              </div>
              <div className="mt-3 grid gap-1.5">
                {cpBones.map(b => {
                  const st = studied.includes(b.id);
                  const sel = selectedBoneId === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBone(b.id)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${sel ? 'border-white/30 bg-white/10' : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.06]'}`}
                      style={sel ? { boxShadow: `0 0 16px ${b.glow}` } : {}}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                      <span className="flex-1 text-[13px] font-bold text-white">{b.name}</span>
                      {st ? <span className="text-emerald-400"><Check className="h-4 w-4" /></span> : <span className="text-[10px] font-bold text-slate-600">TOCAR</span>}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={startQuiz}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-display text-sm font-black uppercase tracking-wider text-white shadow-xl transition hover:scale-[1.02] bg-gradient-to-r ${cp.gradient}`}
              >
                <Flag className="h-5 w-5" /> Iniciar desafío
              </button>
              {studiedInCP < cpBones.length && (
                <p className="mt-2 text-center text-[11px] text-slate-500">💡 Te recomendamos estudiar las {cpBones.length} estructuras antes del desafío (+25 XP c/u)</p>
              )}
            </div>
            {/* tip */}
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-3.5 text-xs leading-relaxed text-cyan-100">
              <b>🧭 Controles:</b> arrastra para rotar el holograma • usa el deslizador <b>Explotar</b> para separar las piezas • cambia a <b>Atlas 2D</b> para ver la lámina como en tu libro.
            </div>
          </div>
        </div>
        {vrMode && <VRMode selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} onExit={() => setVrMode(false)} />}
      </div>
    );
  }

  /* ============ QUIZ ============ */
  if (screen === 'quiz') {
    return (
      <div className="relative flex min-h-screen flex-col bg-[#030712]">
        <StarsBackground />
        {hud}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 lg:flex-row">
          <div className="relative min-h-[380px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 lg:min-h-[calc(100vh-140px)]">
            <div className="flex items-center gap-2 border-b border-white/10 p-3">
              <div className="flex rounded-xl bg-white/5 p-1">
                <button onClick={() => setViewMode('3d')} className={`rounded-lg px-3 py-1.5 text-xs font-black ${viewMode === '3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>3D</button>
                <button onClick={() => setViewMode('atlas')} className={`rounded-lg px-3 py-1.5 text-xs font-black ${viewMode === 'atlas' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>Atlas</button>
              </div>
              <p className="text-[11px] font-bold text-slate-500">Visor de desafío {identifyTarget ? '• 🎯 ¡Busca el objetivo!' : ''}</p>
              {viewMode === '3d' && (
                <div className="flex flex-1 items-center gap-2">
                  <input type="range" min={0} max={1.2} step={0.05} value={explode} onChange={e => setExplode(parseFloat(e.target.value))} className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                </div>
              )}
            </div>
            <div className="relative h-[calc(100%-57px)] min-h-[320px]">
              {viewMode === '3d' ? (
                <HologramSkull selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} explode={explode} autoRotate={false} identifyTarget={identifyTarget} />
              ) : (
                <div className="h-full p-3"><AtlasView selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} identifyTarget={identifyTarget} /></div>
              )}
              {selectedBone && !identifyTarget && (
                <div className="absolute bottom-3 left-3 right-3 rounded-xl border bg-slate-950/90 p-3 backdrop-blur" style={{ borderColor: selectedBone.color + '55' }}>
                  <p className="text-sm font-black" style={{ color: selectedBone.color }}>{selectedBone.name}</p>
                  <p className="text-xs text-slate-400">{selectedBone.short}</p>
                </div>
              )}
              {identifyTarget && (
                <div className="absolute left-3 top-3 animate-pulse rounded-xl border border-amber-400/50 bg-slate-950/90 px-3 py-2 text-xs font-black text-amber-300">
                  🎯 Toca: {BONES.find(b => b.id === identifyTarget)?.name}
                </div>
              )}
            </div>
          </div>
          <div className="glass w-full overflow-hidden rounded-2xl lg:w-[440px]">
            <QuizEngine
              questions={cpQuestions}
              checkpointTitle={cp.title}
              checkpointColor={cp.color}
              selectedBoneId={selectedBoneId}
              onIdentifyActive={setIdentifyTarget}
              onFinish={handleQuizFinish}
              onExit={() => setScreen('explore')}
            />
          </div>
        </div>

        {/* modal resultados */}
        <AnimatePresence>
          {showResult && lastResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} className="glass-strong w-full max-w-md rounded-3xl p-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{cp.code} • Resultados</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {[1, 2, 3].map(s => (
                    <motion.div key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + s * 0.2, type: 'spring' }}>
                      <Star className={`h-12 w-12 ${s <= lastResult.stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'text-slate-700'}`} />
                    </motion.div>
                  ))}
                </div>
                <h3 className="mt-3 font-display text-2xl font-black text-white">
                  {lastResult.stars >= 3 ? '¡Legendario! 🏆' : lastResult.stars >= 2 ? '¡Checkpoint superado! 🎉' : 'Sigue intentando 💪'}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {lastResult.stars >= 2
                    ? `Desbloqueaste el siguiente sector. ¡El cráneo no tiene secretos para ti!`
                    : `Necesitas 2 estrellas (70%) para avanzar. ¡Repasa el atlas y reintenta!`}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/5 p-3"><p className="font-display text-xl font-black text-cyan-300">{lastResult.score}</p><p className="text-[10px] font-bold uppercase text-slate-500">Puntos</p></div>
                  <div className="rounded-xl bg-white/5 p-3"><p className="font-display text-xl font-black text-emerald-300">{lastResult.correct}/{lastResult.total}</p><p className="text-[10px] font-bold uppercase text-slate-500">Aciertos</p></div>
                  <div className="rounded-xl bg-white/5 p-3"><p className="font-display text-xl font-black text-amber-300">+{lastResult.xpEarned}</p><p className="text-[10px] font-bold uppercase text-slate-500">XP</p></div>
                </div>
                <div className="mt-4 flex gap-2">
                  {lastResult.stars < 2 ? (
                    <>
                      <button onClick={() => { setShowResult(false); setScreen('explore'); }} className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5">Estudiar atlas</button>
                      <button onClick={() => { setShowResult(false); }} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-black text-white">Reintentar</button>
                    </>
                  ) : (
                    <button onClick={closeResult} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 px-4 py-3 text-sm font-black text-white">
                      Continuar misión <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {vrMode && <VRMode selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} onExit={() => setVrMode(false)} />}
      </div>
    );
  }

  /* ============ FINAL / CERTIFICADO ============ */
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  return (
    <div className="relative min-h-screen bg-[#030712]">
      <StarsBackground />
      {hud}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-600 shadow-2xl shadow-amber-500/30">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-white md:text-4xl">¡Felicidades, <span className="text-shimmer">{playerName}</span>!</h1>
          <p className="mt-2 text-slate-400">Completaste la expedición anatómica del cráneo humano con <b className="text-white">{xp} XP</b> y <b className="text-amber-300">{accuracy}% de precisión</b>.</p>
        </motion.div>

        {/* certificado */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative mt-6 overflow-hidden rounded-3xl border-2 border-amber-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 text-center shadow-[0_0_60px_rgba(251,191,36,0.15)] md:p-12">
          <div className="absolute inset-3 rounded-2xl border border-amber-300/20" />
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
          <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-amber-300">Certificado oficial</p>
          <h2 className="mt-2 font-display text-2xl font-black text-white md:text-3xl">EXPLORADOR CRANEAL CERTIFICADO</h2>
          <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Cranium VR • Expedición Anatómica • Ciencias Naturales</p>
          <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          <p className="mt-5 text-sm text-slate-400">Se certifica que</p>
          <p className="mt-1 font-display text-3xl font-black text-white md:text-4xl">{playerName}</p>
          <p className="text-sm font-bold text-slate-400">{grade}</p>
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-slate-300">
            Dominó las 16 estructuras del cráneo humano (neurocráneo, viscerocráneo y base craneal),
            superó los 5 checkpoints anatómicos y aprobó el examen final de osteología craneal.
          </p>
          <div className="mx-auto mt-5 grid max-w-lg grid-cols-4 gap-2">
            <div className="rounded-xl bg-white/5 p-2.5"><p className="font-display text-lg font-black text-cyan-300">{xp}</p><p className="text-[9px] font-bold uppercase text-slate-500">XP</p></div>
            <div className="rounded-xl bg-white/5 p-2.5"><p className="font-display text-lg font-black text-amber-300">{Object.values(stars).reduce((a, b) => a + b, 0)}/15</p><p className="text-[9px] font-bold uppercase text-slate-500">Estrellas</p></div>
            <div className="rounded-xl bg-white/5 p-2.5"><p className="font-display text-lg font-black text-emerald-300">{accuracy}%</p><p className="text-[9px] font-bold uppercase text-slate-500">Precisión</p></div>
            <div className="rounded-xl bg-white/5 p-2.5"><p className="font-display text-lg font-black text-violet-300">{studied.length}/16</p><p className="text-[9px] font-bold uppercase text-slate-500">Huesos</p></div>
          </div>
          <div className="mt-6 flex items-center justify-between text-left">
            <div>
              <p className="font-display text-lg font-black text-white" style={{ fontFamily: 'cursive' }}>Dra. Cranium</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Directora de expedición</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-3xl">🎓</div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fecha de expedición</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl transition hover:scale-[1.02]">
            <Printer className="h-4 w-4" /> Imprimir certificado
          </button>
          <button onClick={() => setScreen('hub')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/5">
            <MapIcon className="h-4 w-4" /> Volver al mapa
          </button>
          <button onClick={() => setVrMode(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-5 py-3.5 text-sm font-black text-fuchsia-300 hover:bg-fuchsia-500/20">
            <Glasses className="h-4 w-4" /> Explorar libre en VR
          </button>
        </div>

        {/* repaso */}
        <div className="glass mt-5 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 font-display text-sm font-black text-white"><BookOpen className="h-4 w-4 text-cyan-400" /> REPASO FINAL: LAS 16 ESTRUCTURAS</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {BONES.map(b => (
              <div key={b.id} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-white">{b.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{b.short}</p>
                </div>
                <Heart className="ml-auto h-3.5 w-3.5 shrink-0 fill-emerald-400 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {vrMode && <VRMode selectedBoneId={selectedBoneId} onSelectBone={handleSelectBone} onExit={() => setVrMode(false)} />}
    </div>
  );
}
