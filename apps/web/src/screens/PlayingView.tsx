import type { GameState } from "@lasana/engine";
import { currentPlayer } from "@lasana/engine";
import { HandArea } from "../components/HandArea.tsx";
import { PhaseHeader } from "../components/PhaseHeader.tsx";
import { PhaseSplash } from "../components/PhaseSplash.tsx";
import { TableStage } from "../components/TableStage.tsx";
import { useGameStore } from "../store/gameStore.ts";

interface PlayingViewProps {
  state: GameState;
}

export function PlayingView({ state }: PlayingViewProps) {
  const pendingThrowCardId = useGameStore((s) => s.pendingThrowCardId);
  const throwAt = useGameStore((s) => s.throwAt);
  const sessionId = useGameStore((s) => s.sessionId);
  const acting = currentPlayer(state);
  const isMyTurn = acting.id === sessionId;
  const secret = state.config.visibility === "secret";

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden">
      <PhaseSplash state={state} />
      <PhaseHeader state={state} turnLabel={`Juega ${acting.name}`} />

      <TableStage
        players={state.players}
        meId={sessionId}
        turnPlayerId={acting.id}
        secret={secret}
        targeting={Boolean(pendingThrowCardId)}
        onTarget={throwAt}
      />

      {!isMyTurn ? (
        <div className="shrink-0 border-t-3 border-brand-crust bg-brand-table/90 px-3 py-4 text-center font-display text-sm text-brand-bechamel/70">
          Turno de {acting.name} · espera a que juegue…
        </div>
      ) : (
        <HandArea state={state} />
      )}
    </div>
  );
}
