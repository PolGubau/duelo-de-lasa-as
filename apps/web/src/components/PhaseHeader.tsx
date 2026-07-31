import type { GameState } from "@lasana/engine";
import { currentPhase } from "@lasana/engine";
import { motion } from "framer-motion";
import { useState } from "react";
import { phaseInfoFor } from "../lib/phases.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { Modal } from "./Modal.tsx";

interface PhaseHeaderProps {
  state: GameState;
  /** Nombre del jugador al que le toca, para el aviso de turno. */
  turnLabel: string;
}

export function PhaseHeader({ state, turnLabel }: PhaseHeaderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const info = phaseInfoFor(state.status, currentPhase(state));

  return (
    <header className="flex shrink-0 items-center gap-2 px-2 py-1.5">
      <div className="flex flex-col leading-tight">
        <span className="font-display text-[10px] uppercase tracking-widest text-brand-bechamel/60">
          Ronda
        </span>
        <span className="font-display text-sm text-brand-bechamel">
          {state.round}/{state.config.roundsCount}
        </span>
      </div>

      <motion.div
        key={info.label}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 20 }}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border-3 border-brand-crust px-3 py-1"
        style={{ background: info.accent }}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {info.icon}
        </span>
        <span className="font-display text-sm text-brand-bechamel text-outline">{info.label}</span>
      </motion.div>

      <button
        type="button"
        aria-label={`¿Qué pasa en la fase ${info.label}?`}
        onClick={() => {
          playSound("select");
          vibrate(8);
          setShowHelp(true);
        }}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-3 border-brand-crust bg-brand-bechamel font-display text-brand-crust shadow-button transition-transform active:translate-y-0.5"
      >
        ?
      </button>

      <Modal
        open={showHelp}
        title={`${info.icon} Fase de ${info.label}`}
        onClose={() => setShowHelp(false)}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-brand-bechamel/90">{info.help}</p>
          <p className="text-xs text-brand-bechamel/60">{turnLabel}</p>
        </div>
      </Modal>
    </header>
  );
}
