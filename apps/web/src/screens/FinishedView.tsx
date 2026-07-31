import type { GameState } from "@lasana/engine";
import { scoreGame } from "@lasana/engine";
import { Button } from "../components/Button.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { useGameStore } from "../store/gameStore.ts";

interface FinishedViewProps {
  state: GameState;
}

export function FinishedView({ state }: FinishedViewProps) {
  const resetGame = useGameStore((s) => s.resetGame);
  const scores = scoreGame(state);
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6">
      <h2 className="text-center font-display text-3xl text-brand-cheese">
        🍆 ¡{winner?.name ?? "Nadie"} gana la lasaña! 🍆
      </h2>
      <div className="flex w-full flex-col gap-3">
        {[...state.players]
          .sort(
            (a, b) =>
              (scores.find((s) => s.playerId === b.id)?.total ?? 0) -
              (scores.find((s) => s.playerId === a.id)?.total ?? 0),
          )
          .map((p) => (
            <ScoreBreakdown
              key={p.id}
              player={p}
              score={scores.find((s) => s.playerId === p.id)!}
            />
          ))}
      </div>
      <Button variant="primary" onClick={resetGame}>
        Jugar de nuevo
      </Button>
    </div>
  );
}
