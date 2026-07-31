import type { GameState } from "@lasana/engine";
import { scoreGame } from "@lasana/engine";
import { Button } from "../components/Button.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
interface FinishedViewProps {
  state: GameState;
  onExit: () => void;
}

export function FinishedView({ state, onExit }: FinishedViewProps) {
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
      <Button variant="primary" onClick={onExit}>
        Jugar de nuevo
      </Button>
    </div>
  );
}
