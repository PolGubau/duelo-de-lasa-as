import type { GameState } from "@lasana/engine";
import { scoreGame } from "@lasana/engine";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "../components/Button.tsx";
import { IngredientRain } from "../components/IngredientRain.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { cn } from "../lib/cn.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";

interface FinishedViewProps {
  state: GameState;
  onExit: () => void;
}

export function FinishedView({ state, onExit }: FinishedViewProps) {
  const scores = scoreGame(state);
  const winner = state.players.find((p) => p.id === state.winnerId);
  const sessionId = useGameStore((s) => s.sessionId);
  const iWon = winner?.id === sessionId;

  useEffect(() => {
    playSound("win");
    vibrate([16, 40, 16, 40, 26]);
  }, []);

  return (
    <div className="relative flex h-dvh w-full flex-col items-center overflow-hidden">
      <IngredientRain />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-2xl flex-col items-center gap-4 overflow-y-auto p-4 sm:p-6">
        <motion.span
          initial={{ scale: 0.3, rotate: -10 }}
          animate={{ scale: [0.3, 1.2, 1], rotate: [-10, 6, 0] }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-6xl drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]"
        >
          🏆
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 320, damping: 22 }}
          className="shrink-0 text-center font-display text-2xl text-outline text-brand-cheese sm:text-3xl"
        >
          {iWon ? "¡Has ganado la lasaña!" : `¡${winner?.name ?? "Nadie"} gana la lasaña!`}
        </motion.h2>
        <div className="flex w-full flex-col gap-3">
          {[...state.players]
            .sort(
              (a, b) =>
                (scores.find((s) => s.playerId === b.id)?.total ?? 0) -
                (scores.find((s) => s.playerId === a.id)?.total ?? 0),
            )
            .map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.25 + index * 0.08,
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
                className={cn(p.id === winner?.id && "rounded-xl ring-2 ring-brand-cheese")}
              >
                <ScoreBreakdown player={p} score={scores.find((s) => s.playerId === p.id)!} />
              </motion.div>
            ))}
        </div>
        <Button variant="primary" onClick={onExit} className="animate-target">
          Jugar de nuevo
        </Button>
      </div>
    </div>
  );
}
