import type { GameState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { Button } from "../components/Button.tsx";
import { useGameStore } from "../store/gameStore.ts";

interface TradingViewProps {
  state: GameState;
}

export function TradingView({ state }: TradingViewProps) {
  const proposeTrade = useGameStore((s) => s.proposeTrade);
  const acceptTrade = useGameStore((s) => s.acceptTrade);
  const rejectTrade = useGameStore((s) => s.rejectTrade);
  const finishTrading = useGameStore((s) => s.finishTrading);
  const humans = state.players.filter((p) => !p.isBot);
  const sessionId = useGameStore((s) => s.sessionId);
  const me = humans.find((player) => player.id === sessionId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h2 className="font-display text-2xl text-brand-cheese">Trueque de Chefs</h2>

      <div className="flex flex-col gap-2">
        {state.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border-2 border-brand-crust bg-brand-table/60 px-4 py-2"
          >
            <span className="font-display">{p.name}</span>
            <span className="text-brand-cheese">{p.chefId ? getChef(p.chefId).name : "—"}</span>
          </div>
        ))}
      </div>

      {humans.length > 1 && (
        <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-brand-bechamel/30 p-3">
          <p className="text-xs text-brand-bechamel/70">Proponer trueque:</p>
          <div className="flex flex-wrap gap-2">
            {me &&
              humans
                .filter((to) => to.id !== me.id)
                .map((to) => (
                  <Button
                    key={`${me.id}_${to.id}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => proposeTrade(me.id, to.id)}
                  >
                    {me.name} ↔ {to.name}
                  </Button>
                ))}
          </div>
        </div>
      )}

      {state.pendingTrades.length > 0 && (
        <div className="flex flex-col gap-2">
          {state.pendingTrades.map((t) => {
            const from = state.players.find((p) => p.id === t.fromPlayerId)!;
            const to = state.players.find((p) => p.id === t.toPlayerId)!;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border-2 border-brand-tomato bg-brand-tomato/10 px-4 py-2"
              >
                <span>
                  {from.name} propone trueque a {to.name}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => acceptTrade(t.id)}>
                    Aceptar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => rejectTrade(t.id)}>
                    Rechazar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button variant="primary" onClick={finishTrading} className="self-center">
        Terminar trueques y puntuar
      </Button>
    </div>
  );
}
