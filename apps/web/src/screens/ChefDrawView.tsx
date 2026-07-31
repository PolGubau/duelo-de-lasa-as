import type { GameState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { Button } from "../components/Button.tsx";
import { useGameStore } from "../store/gameStore.ts";

interface ChefDrawViewProps {
  state: GameState;
}

export function ChefDrawView({ state }: ChefDrawViewProps) {
  const drawChef = useGameStore((s) => s.drawChef);
  const sessionId = useGameStore((s) => s.sessionId);
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6">
      <h2 className="font-display text-2xl text-brand-cheese">¡Reparto de Chefs!</h2>
      <p className="text-center text-sm text-brand-bechamel/80">
        Cada jugador saca un chef al azar. Su efecto se aplicará al puntuar.
      </p>
      <div className="flex w-full flex-col gap-2">
        {state.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-brand-crust bg-brand-table/60 px-4 py-2"
          >
            <span className="font-display">{p.name}</span>
            {p.chefId ? (
              <span className="text-right text-sm text-brand-cheese">
                {getChef(p.chefId).name} — {getChef(p.chefId).description}
              </span>
            ) : p.id !== sessionId ? (
              <span className="text-brand-bechamel/50">Esperando a su jugador…</span>
            ) : (
              <Button size="sm" onClick={() => drawChef(p.id)}>
                Sacar chef
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
