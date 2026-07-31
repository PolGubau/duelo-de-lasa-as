import type { GameState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../components/Avatar.tsx";
import { Button } from "../components/Button.tsx";
import { cn } from "../lib/cn.ts";
import { playSound, vibrate } from "../lib/sound.ts";
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

  function handlePropose(toId: string): void {
    if (!me) return;
    playSound("select");
    proposeTrade(me.id, toId);
  }

  function handleAccept(tradeId: string): void {
    playSound("positive");
    vibrate([10, 30, 14]);
    acceptTrade(tradeId);
  }

  function handleReject(tradeId: string): void {
    playSound("discard");
    vibrate(12);
    rejectTrade(tradeId);
  }

  function handleFinish(): void {
    playSound("trade");
    vibrate(12);
    finishTrading();
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto p-4 sm:gap-4 sm:p-6">
      <motion.h2
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="shrink-0 text-center font-display text-2xl text-brand-cheese"
      >
        🤝 Trueque de Chefs
      </motion.h2>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {state.players.map((p, index) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2",
                p.id === sessionId
                  ? "border-brand-cheese bg-brand-cheese/10"
                  : "border-brand-crust bg-brand-table/60",
              )}
            >
              <div className="flex items-center gap-2">
                <Avatar id={p.id} name={p.name} size="sm" />
                <span className="font-display">{p.name}</span>
              </div>
              <span className="text-brand-cheese">
                {p.chefId ? getChef(p.chefId).name : "—"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
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
                    onClick={() => handlePropose(to.id)}
                  >
                    {me.name} ↔ {to.name}
                  </Button>
                ))}
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {state.pendingTrades.length > 0 && (
          <motion.div layout className="flex flex-col gap-2">
            {state.pendingTrades.map((t) => {
              const from = state.players.find((p) => p.id === t.fromPlayerId)!;
              const to = state.players.find((p) => p.id === t.toPlayerId)!;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="flex items-center justify-between gap-3 rounded-xl border-2 border-brand-tomato bg-brand-tomato/10 px-4 py-2"
                >
                  <span>
                    {from.name} propone trueque a {to.name}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleAccept(t.id)}>
                      Aceptar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(t.id)}>
                      Rechazar
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="primary" onClick={handleFinish} className="self-center">
        Terminar trueques y puntuar
      </Button>
    </div>
  );
}
