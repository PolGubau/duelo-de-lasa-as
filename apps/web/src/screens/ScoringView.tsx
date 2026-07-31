import type { GameState } from "@lasana/engine";
import { scoreGame } from "@lasana/engine";
import { useEffect, useState } from "react";
import { Button } from "../components/Button.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { playSound } from "../lib/sound.ts";
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
      playSound(revealed + 1 >= totalSteps ? "chef" : "score");
    }, 620);
    return () => window.clearTimeout(timer);
  }, [revealed, done, totalSteps]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h2 className="text-center font-display text-2xl text-brand-cheese">Puntuación</h2>
      <div className="flex flex-col gap-3">
        {state.players.map((p) => (
          <ScoreBreakdown
            key={p.id}
            player={p}
            score={scores.find((s) => s.playerId === p.id)!}
            revealed={revealed}
          />
        ))}
      </div>
      {!done && (
        <Button variant="ghost" className="self-center" onClick={() => setRevealed(totalSteps)}>
          Saltar animación
        </Button>
      )}
      <Button variant="primary" disabled={!done} onClick={finishScoring} className="self-center">
        Ver resultado final
      </Button>
    </div>
  );
}
