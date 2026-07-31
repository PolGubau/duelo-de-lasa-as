import type { PlayerState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { motion } from "framer-motion";
import { cn } from "../lib/cn.ts";
import { runningTotal } from "../lib/layers.ts";
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

  return (
    <div className="table-stage relative min-h-0 flex-1 overflow-hidden">
      <div className="table-felt absolute inset-x-[-12%] bottom-[-28%] top-[6%] rounded-[50%]" />

      {rivals.map((player, index) => {
        const { x, y, scale } = seatPosition(index, rivals.length);
        const chef = player.chefId ? getChef(player.chefId) : undefined;
        const selectable = targeting && player.id !== turnPlayerId;
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
              "seat-3d absolute flex w-24 flex-col items-center gap-0.5 rounded-2xl border-3 px-1.5 py-1 transition-colors",
              player.id === turnPlayerId
                ? "border-brand-tomato bg-brand-crust/80"
                : "border-brand-crust/60 bg-brand-crust/45",
              selectable
                ? "animate-target cursor-pointer hover:border-brand-cheese"
                : "cursor-default",
            )}
            style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) scale(${scale})` }}
          >
            <Avatar id={player.id} name={player.name} size="sm" />
            <span className="max-w-full truncate font-display text-[10px] text-brand-bechamel">
              {player.name}
            </span>
            {chef && (
              <span className="max-w-full truncate text-[8px] text-brand-cheese">{chef.name}</span>
            )}
            <LasagnaStack3D
              layers={player.lasagna}
              hidden={secret}
              slabHeight={8}
              width={78}
            />
            <span className="font-display text-xs text-brand-cheese">
              {secret ? "?" : runningTotal(player.lasagna)}
            </span>
          </motion.button>
        );
      })}

      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center gap-1">
        <motion.span
          key={runningTotal(center.lasagna)}
          initial={{ scale: 1.6, color: "var(--color-brand-tomato)" }}
          animate={{ scale: 1, color: "var(--color-brand-cheese)" }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="font-display text-3xl text-outline"
        >
          {runningTotal(center.lasagna)}
        </motion.span>
        <div className="flex max-h-[42vh] items-end overflow-hidden">
          <LasagnaStack3D layers={center.lasagna} slabHeight={16} width={150} />
        </div>
        <span className="font-display text-[11px] text-brand-bechamel/80">
          Tu lasaña · {center.name}
        </span>
      </div>
    </div>
  );
}
