import type { GameState } from "@lasana/engine";
import { currentPhase } from "@lasana/engine";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { phaseInfoFor, type PhaseInfo } from "../lib/phases.ts";
import { playSound } from "../lib/sound.ts";

/** Veces que se explica cada fase antes de mostrar solo el rótulo. */
const EXPLAIN_TIMES = 2;
const EXPLAIN_DURATION = 5000;
const LABEL_DURATION = 2600;
const seen = new Map<string, number>();

interface PhaseSplashProps {
  state: GameState;
}

export function PhaseSplash({ state }: PhaseSplashProps) {
  const key = `${state.status}:${state.phaseIndex}`;
  const previous = useRef<string | null>(null);
  const [shown, setShown] = useState<{ key: string; info: PhaseInfo; explain: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (previous.current === key) return;
    const first = previous.current === null;
    previous.current = key;
    if (first) return;

    const times = seen.get(key) ?? 0;
    seen.set(key, times + 1);
    const entry = {
      key,
      info: phaseInfoFor(state.status, currentPhase(state)),
      explain: times < EXPLAIN_TIMES,
    };
    playSound("phase");
    setShown(entry);
    const timer = window.setTimeout(
      () => setShown((current) => (current?.key === entry.key ? null : current)),
      entry.explain ? EXPLAIN_DURATION : LABEL_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [key, state]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.key}
          className="fixed inset-0 z-40 flex cursor-pointer items-center justify-center px-6"
          role="button"
          tabIndex={0}
          aria-label="Cerrar aviso de fase"
          onClick={() => setShown(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setShown(null);
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <motion.div
            className="relative flex w-full max-w-sm flex-col items-center gap-2 rounded-3xl border-3 border-brand-crust bg-brand-table/95 px-5 py-6 shadow-card"
            initial={{ scale: 0.6, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <motion.span
              className="text-6xl"
              initial={{ rotate: -18, scale: 0.5 }}
              animate={{ rotate: [-18, 8, 0], scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {shown.info.icon}
            </motion.span>
            <span
              className="font-display text-3xl text-outline"
              style={{ color: shown.info.accent }}
            >
              {shown.info.label}
            </span>
            {shown.explain && (
              <p className="text-center text-pretty text-sm text-brand-bechamel/90">{shown.info.help}</p>
            )}
            <span className="mt-2 text-xs text-brand-bechamel/60">Toca para continuar</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
