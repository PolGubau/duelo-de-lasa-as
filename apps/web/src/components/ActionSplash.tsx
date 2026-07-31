import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { SoundCue } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";

/** Cues que merecen una splash a pantalla completa; el resto se queda en el toast. */
const SPLASH: Partial<Record<SoundCue, { icon: string; title: string; color: string }>> = {
  attack: { icon: "⚡", title: "¡Zasca!", color: "var(--color-brand-tomato)" },
  chef: { icon: "👨‍🍳", title: "¡Chef!", color: "var(--color-brand-basil)" },
  score: { icon: "✨", title: "¡Puntos!", color: "var(--color-brand-cheese)" },
  win: { icon: "🏆", title: "¡Victoria!", color: "var(--color-brand-cheese)" },
};

export function ActionSplash() {
  const feedback = useGameStore((s) => s.feedback);
  const [shown, setShown] = useState<{ id: number; message: string; cue: SoundCue } | null>(null);

  useEffect(() => {
    if (!feedback || !SPLASH[feedback.cue]) return;
    const entry = feedback;
    setShown(entry);
    const timer = window.setTimeout(() => {
      setShown((current) => (current?.id === entry.id ? null : current));
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const art = shown ? SPLASH[shown.cue] : undefined;

  return (
    <AnimatePresence>
      {shown && art && (
        <motion.div
          key={shown.id}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        >
          <div className="splash-burst absolute inset-0" />
          <motion.div
            className="splash-rays absolute h-[140vmax] w-[140vmax] opacity-40"
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="relative flex flex-col items-center gap-1"
            initial={{ scale: 0.3, rotate: -12 }}
            animate={{ scale: [0.3, 1.15, 1], rotate: [-12, 4, 0] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <span className="text-7xl drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]">{art.icon}</span>
            <span className="font-display text-4xl text-outline" style={{ color: art.color }}>
              {art.title}
            </span>
            <span className="max-w-[80vw] text-center font-display text-sm text-brand-bechamel">
              {shown.message}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
