import type { PlayerState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn.ts";
import { formatScore, runningTotal } from "../lib/layers.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { Avatar } from "./Avatar.tsx";
import { LasagnaStack3D } from "./LasagnaStack3D.tsx";

interface TableStageProps {
  players: PlayerState[];
  /** Jugador de esta pantalla; se dibuja en primer plano, en el centro. */
  meId: string | null;
  turnPlayerId: string;
  secret: boolean;
  /** Modo "elige objetivo" para lanzar un condimento. */
  targeting: boolean;
  onTarget: (playerId: string) => void;
}

/** Posición en el arco del fondo: t va de 0 (izquierda) a 1 (derecha). */
function seatPosition(index: number, count: number): { x: number; y: number; scale: number } {
  const t = count === 1 ? 0.5 : index / (count - 1);
  const theta = Math.PI * (1 - t);
  const x = 50 + 42 * Math.cos(theta);
  const y = 32 - 16 * Math.sin(theta);
  return { x, y, scale: 0.82 + 0.18 * ((y - 16) / 16) };
}

interface ScoreDeltaProps {
  total: number;
  hidden?: boolean;
  className?: string;
}

/** Hace visible, durante un instante, cómo acaba de cambiar el valor de una lasaña. */
function ScoreDelta({ total, hidden = false, className }: ScoreDeltaProps) {
  const previousTotal = useRef(total);
  const [delta, setDelta] = useState<{ amount: number; id: number } | null>(null);

  useEffect(() => {
    const previous = previousTotal.current;
    previousTotal.current = total;
    if (hidden || previous === total) return;

    setDelta({ amount: total - previous, id: total });
    const timer = window.setTimeout(() => setDelta(null), 850);
    return () => window.clearTimeout(timer);
  }, [hidden, total]);

  return (
    <AnimatePresence>
      {delta && (
        <motion.span
          key={delta.id}
          initial={{ opacity: 0, scale: 0.4, x: -8, y: 10 }}
          animate={{ opacity: 1, scale: [0.7, 1.35, 1], x: 0, y: -30 }}
          exit={{ opacity: 0, scale: 0.8, y: -44 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={cn(
            "pointer-events-none absolute z-20 whitespace-nowrap font-display text-xl drop-shadow-[0_2px_0_#3B1F0D]",
            delta.amount > 0 ? "text-emerald-400" : "text-red-500",
            className,
          )}
        >
          {delta.amount > 0 ? "+" : "−"}
          {formatScore(Math.abs(delta.amount))}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function TableStage({
  players,
  meId,
  turnPlayerId,
  secret,
  targeting,
  onTarget,
}: TableStageProps) {
  const me = players.find((player) => player.id === meId);
  const rivals = players.filter((player) => player.id !== me?.id);
  const center = me ?? players[0]!;
  const centerTotal = runningTotal(center.lasagna);

  return (
    <div className="table-stage relative min-h-0 flex-1 overflow-hidden">
      <div className="table-felt absolute" aria-hidden="true" />

      {rivals.map((player, index) => {
        const { x, y, scale } = seatPosition(index, rivals.length);
        const chef = player.chefId ? getChef(player.chefId) : undefined;
        const selectable = targeting && player.id !== turnPlayerId;
        const total = runningTotal(player.lasagna);
        return (
          <motion.button
            key={player.id}
            type="button"
            disabled={!selectable}
            onClick={() => {
              if (!selectable) return;
              playSound("whoosh");
              vibrate([12, 30, 18]);
              onTarget(player.id);
            }}
            onHoverStart={selectable ? () => playSound("hover") : undefined}
            className={cn(
              "player-seat seat-3d absolute flex w-[6.4rem] flex-col items-center gap-1 px-1.5 py-1.5",
              player.id === turnPlayerId
                ? "is-active"
                : "is-idle",
              selectable
                ? "is-selectable animate-target cursor-pointer"
                : "cursor-default",
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%,-50%) scale(${scale})`,
            }}
          >
            <div className="player-seat-identity">
              <Avatar id={player.id} name={player.name} size="sm" className="player-seat-avatar" />
              <div className="min-w-0 text-left">
                <span className="player-seat-name">{player.name}</span>
                <span className="player-seat-role">{chef?.name ?? "En cocina"}</span>
              </div>
            </div>
            <div className="player-seat-stack relative">
              <LasagnaStack3D layers={player.lasagna} hidden={secret} slabHeight={8} width={78} />
              <ScoreDelta total={total} hidden={secret} className="left-full top-1/2 ml-1" />
              <span className="player-seat-score">{secret ? "?" : formatScore(total)}</span>
            </div>
          </motion.button>
        );
      })}

      <div className="player-tray absolute inset-x-0 bottom-1 flex flex-col items-center">
        <div className="player-tray-score">
          <span>Puntos</span>
          <motion.strong
            key={centerTotal}
            initial={{ scale: 1.6, color: "var(--color-brand-tomato)" }}
            animate={{ scale: 1, color: "var(--color-brand-cheese)" }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            {formatScore(centerTotal)}
          </motion.strong>
        </div>
        <div className="player-tray-stack relative">
          <div className="flex max-h-[42vh] items-end overflow-hidden">
            <LasagnaStack3D featured layers={center.lasagna} slabHeight={17} width={164} />
          </div>
          <ScoreDelta total={centerTotal} className="left-full top-1/2 ml-3" />
        </div>
        <span className="player-tray-label">
          <span>Tu lasaña</span> · {center.name}
        </span>
      </div>
    </div>
  );
}
