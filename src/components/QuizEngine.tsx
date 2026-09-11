import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, Timer, Heart, Star, Crosshair, ArrowRight, RotateCcw } from 'lucide-react';
import type { Question } from '../data/craniumData';
import { sfx } from '../utils/sound';

interface Props {
  questions: Question[];
  checkpointTitle: string;
  checkpointColor: string;
  selectedBoneId: string | null;
  onIdentifyActive: (targetBoneId: string | null) => void;
  onFinish: (result: { score: number; maxScore: number; correct: number; total: number; stars: number; xpEarned: number }) => void;
  onExit: () => void;
}

export default function QuizEngine({ questions, checkpointTitle, checkpointColor, selectedBoneId, onIdentifyActive, onFinish, onExit }: Props) {
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<number | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState<null | { ok: boolean; msg: string }>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [failed, setFailed] = useState(false);
  const [identifyMsg, setIdentifyMsg] = useState<string | null>(null);

  const q = questions[idx];
  const maxScore = useMemo(() => questions.reduce((a, b) => a + b.points, 0), [questions]);

  // timer
  useEffect(() => {
    setTimeLeft(30);
    setPicked(null);
    setShowFeedback(null);
    setShowHint(false);
    setIdentifyMsg(null);
    if (q.type === 'identify' && q.targetBoneId) onIdentifyActive(q.targetBoneId);
    else onIdentifyActive(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    if (showFeedback || failed) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showFeedback, failed]);

  // identify detection
  useEffect(() => {
    if (q.type !== 'identify' || showFeedback || failed || !selectedBoneId) return;
    if (selectedBoneId === q.targetBoneId) {
      const bonus = Math.round((timeLeft / 30) * 50);
      const pts = q.points + bonus + streak * 10;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      sfx.correct();
      setShowFeedback({ ok: true, msg: `¡Localización perfecta! +${pts} pts (incluye bonus de velocidad +${bonus})` });
    } else {
      sfx.wrong();
      setIdentifyMsg('Esa no es la estructura correcta. ¡Sigue buscando, explorador!');
      setTimeout(() => setIdentifyMsg(null), 2200);
      // penalización leve sin perder corazón al primer error táctil
      setStreak(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBoneId]);

  const handleTimeout = () => {
    sfx.wrong();
    setStreak(0);
    const nh = hearts - 1;
    setHearts(nh);
    if (nh <= 0) { setFailed(true); return; }
    setShowFeedback({ ok: false, msg: '¡Se acabó el tiempo! ' + q.explanation });
  };

  const answerMultiple = (i: number) => {
    if (picked !== null || showFeedback) return;
    setPicked(i);
    const ok = i === q.correctIndex;
    if (ok) {
      const bonus = Math.round((timeLeft / 30) * 50);
      const pts = q.points + bonus + streak * 10;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      sfx.correct();
      setShowFeedback({ ok: true, msg: `¡Correcto! +${pts} pts (velocidad +${bonus}${streak > 0 ? `, racha x${streak + 1}` : ''})` });
    } else {
      sfx.wrong();
      setStreak(0);
      const nh = hearts - 1;
      setHearts(nh);
      if (nh <= 0) { setFailed(true); return; }
      setShowFeedback({ ok: false, msg: q.explanation });
    }
  };

  const answerBool = (v: boolean) => {
    if (picked !== null || showFeedback) return;
    setPicked(v);
    const ok = v === q.correctBoolean;
    if (ok) {
      const bonus = Math.round((timeLeft / 30) * 50);
      const pts = q.points + bonus + streak * 10;
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      sfx.correct();
      setShowFeedback({ ok: true, msg: `¡Correcto! +${pts} pts` });
    } else {
      sfx.wrong();
      setStreak(0);
      const nh = hearts - 1;
      setHearts(nh);
      if (nh <= 0) { setFailed(true); return; }
      setShowFeedback({ ok: false, msg: q.explanation });
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const pct = score / maxScore;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
      sfx.unlock();
      onIdentifyActive(null);
      onFinish({ score, maxScore, correct, total: questions.length, stars, xpEarned: score });
    } else {
      sfx.click();
      setIdx(i => i + 1);
    }
  };

  const retry = () => {
    setIdx(0); setHearts(3); setScore(0); setCorrect(0); setStreak(0);
    setFailed(false); setShowFeedback(null); setPicked(null);
  };

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 text-4xl">💔</motion.div>
        <h3 className="font-display text-2xl font-bold text-red-400">Misión fallida</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-400">Te quedaste sin energía vital. ¡Pero los grandes exploradores nunca se rinden! Repasa el atlas y vuelve a intentarlo.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={retry} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold transition hover:scale-105">
            <RotateCcw className="h-4 w-4" /> Reintentar
          </button>
          <button onClick={onExit} className="rounded-xl border border-white/15 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-white/5">Estudiar atlas</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* header quiz */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: checkpointColor }}>Desafío {checkpointTitle}</p>
          <p className="text-xs text-slate-400">Pregunta {idx + 1} de {questions.length} • {q.difficulty}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <Heart key={i} className={`h-5 w-5 ${i < hearts ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
            ))}
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold ${timeLeft <= 10 ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-cyan-300'}`}>
            <Timer className="h-4 w-4" /> {timeLeft}s
          </div>
          <div className="rounded-lg bg-amber-500/15 px-2.5 py-1 font-mono text-sm font-bold text-amber-300">{score} pts</div>
        </div>
      </div>
      {/* barra progreso */}
      <div className="h-1.5 w-full bg-white/5">
        <motion.div className="h-full" style={{ background: checkpointColor }} animate={{ width: `${((idx) / questions.length) * 100}%` }} />
      </div>
      {streak >= 2 && (
        <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 py-1 text-xs font-bold text-amber-300">
          🔥 ¡Racha x{streak}! Sigue así (+{streak * 10} bonus)
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{q.question}</h3>

            {q.type === 'multiple' && (
              <div className="mt-4 grid gap-2.5">
                {q.options!.map((op, i) => {
                  const isPicked = picked === i;
                  const isCorrect = q.correctIndex === i;
                  const revealed = showFeedback !== null;
                  let cls = 'border-white/12 bg-white/[0.04] hover:border-cyan-400/50 hover:bg-cyan-400/10';
                  if (revealed && isCorrect) cls = 'border-emerald-400 bg-emerald-400/15 text-emerald-200';
                  else if (revealed && isPicked && !isCorrect) cls = 'border-red-400 bg-red-400/15 text-red-200';
                  else if (isPicked) cls = 'border-cyan-400 bg-cyan-400/15';
                  return (
                    <button
                      key={i}
                      disabled={revealed}
                      onClick={() => answerMultiple(i)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all md:text-[15px] ${cls}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{op}</span>
                      {revealed && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                      {revealed && isPicked && !isCorrect && <X className="h-5 w-5 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'truefalse' && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[{ v: true, label: 'Verdadero', icon: '✓' }, { v: false, label: 'Falso', icon: '✕' }].map(o => {
                  const isPicked = picked === o.v;
                  const isCorrect = q.correctBoolean === o.v;
                  const revealed = showFeedback !== null;
                  let cls = o.v ? 'border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/20' : 'border-red-400/30 bg-red-400/10 hover:bg-red-400/20';
                  if (revealed && isCorrect) cls = 'border-emerald-400 bg-emerald-400/25 ring-2 ring-emerald-400/50';
                  else if (revealed && isPicked && !isCorrect) cls = 'border-red-400 bg-red-400/25 ring-2 ring-red-400/50';
                  return (
                    <button key={o.label} disabled={revealed} onClick={() => answerBool(o.v)} className={`rounded-2xl border p-5 text-center transition-all ${cls}`}>
                      <div className="text-3xl font-black">{o.icon}</div>
                      <div className="mt-1 font-bold">{o.label}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'identify' && (
              <div className="mt-4 rounded-2xl border border-dashed p-5 text-center" style={{ borderColor: checkpointColor + '88', background: checkpointColor + '11' }}>
                <Crosshair className="mx-auto h-10 w-10 animate-pulse" style={{ color: checkpointColor }} />
                <p className="mt-2 text-sm font-bold text-white">Modo táctil activado</p>
                <p className="mt-1 text-xs text-slate-400">Toca la estructura correcta en el visor 3D o en el atlas 2D.<br />Tienes {timeLeft} segundos.</p>
                {identifyMsg && (
                  <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300">
                    {identifyMsg}
                  </motion.p>
                )}
                {!showFeedback && (
                  <div className="mx-auto mt-3 flex max-w-[200px] items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="h-2 w-2 animate-ping rounded-full" style={{ background: checkpointColor }} />
                    Esperando tu toque...
                  </div>
                )}
              </div>
            )}

            {/* pista */}
            <div className="mt-4">
              {!showHint ? (
                <button onClick={() => { sfx.click(); setShowHint(true); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-300">
                  <Lightbulb className="h-4 w-4" /> ¿Necesitas una pista? (-10 pts)
                </button>
              ) : (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-200">
                  💡 <b>Pista:</b> {q.hint}
                </div>
              )}
            </div>

            {/* feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 rounded-2xl border p-4 ${showFeedback.ok ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-red-400/40 bg-red-400/10'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${showFeedback.ok ? 'bg-emerald-400 text-slate-950' : 'bg-red-400 text-slate-950'}`}>
                      {showFeedback.ok ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${showFeedback.ok ? 'text-emerald-300' : 'text-red-300'}`}>{showFeedback.msg}</p>
                      {!showFeedback.ok && <p className="mt-1 text-xs leading-relaxed text-slate-300">📚 {q.explanation}</p>}
                      {showFeedback.ok && <p className="mt-1 text-xs text-slate-400">📚 {q.explanation}</p>}
                    </div>
                  </div>
                  <button
                    onClick={next}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:scale-[1.02] ${showFeedback.ok ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white'}`}
                  >
                    {idx + 1 >= questions.length ? 'Ver resultados' : 'Siguiente pregunta'} <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!showFeedback && q.type !== 'identify' && (
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                <Star className="h-3 w-3" /> Vale {q.points} pts + bonus de velocidad
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
