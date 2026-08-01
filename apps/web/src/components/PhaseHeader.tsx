import type { GameState } from "@lasana/engine";
import { currentPhase } from "@lasana/engine";
import { motion } from "framer-motion";
import { type CSSProperties, useState } from "react";
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
    <header className="game-hud flex shrink-0 items-center gap-2 px-2 py-2">
      <div className="round-badge flex flex-col leading-tight">
        <span className="round-badge-label">
          Ronda
        </span>
        <span className="round-badge-value">
          {state.round}/{state.config.roundsCount}
        </span>
      </div>

      <motion.div
        key={info.label}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 20 }}
        className="phase-pill flex flex-1 items-center justify-center gap-2 px-3 py-1.5"
        style={{ "--phase-accent": info.accent } as CSSProperties}
      >
        <span aria-hidden="true" className="phase-pill-icon">
          {info.icon}
        </span>
        <span className="phase-pill-label">{info.label}</span>
      </motion.div>

      <button
        type="button"
        aria-label={`¿Qué pasa en la fase ${info.label}?`}
        onClick={() => {
          playSound("select");
          vibrate(8);
          setShowHelp(true);
        }}
        className="help-orb flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center font-display transition-transform active:translate-y-0.5"
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
