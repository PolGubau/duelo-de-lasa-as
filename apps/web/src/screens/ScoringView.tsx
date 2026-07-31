import type { GameState } from "@lasana/engine";
import { scoreGame } from "@lasana/engine";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "../components/Button.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { playSound, vibrate } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";

interface ScoringViewProps {
  state: GameState;
}

export function ScoringView({ state }: ScoringViewProps) {
  const finishScoring = useGameStore((s) => s.finishScoring);
  const scores = scoreGame(state);
  /** La calculadora revela las capas de abajo arriba, una a una. */
  const totalSteps = Math.max(...scores.map((score) => score.steps.length + 1));
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= totalSteps;

  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(() => {
      setRevealed((value) => value + 1);
      const isLast = revealed + 1 >= totalSteps;
      playSound(isLast ? "chef" : "score");
      vibrate(isLast ? [12, 30, 18] : 6);
    }, 620);
    return () => window.clearTimeout(timer);
  }, [revealed, done, totalSteps]);

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <motion.h2
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="shrink-0 text-center font-display text-2xl text-brand-cheese"
      >
        🧮 Puntuación
      </motion.h2>
      <div className="flex flex-col gap-3">
        {state.players.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 30 }}
          >
            <ScoreBreakdown
              player={p}
              score={scores.find((s) => s.playerId === p.id)!}
              revealed={revealed}
            />
          </motion.div>
        ))}
      </div>
      {!done && (
        <Button
          variant="ghost"
          className="self-center"
          onClick={() => {
            playSound("select");
            setRevealed(totalSteps);
          }}
        >
          Saltar animación
        </Button>
      )}
      <Button
        variant="primary"
        disabled={!done}
        onClick={() => {
          playSound("play");
          finishScoring();
        }}
        className="self-center"
      >
        Ver resultado final
      </Button>
    </div>
  );
}
