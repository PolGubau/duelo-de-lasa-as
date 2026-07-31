import type { PlayerState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { cn } from "../lib/cn.ts";
import { Avatar } from "./Avatar.tsx";
import { LasagnaTower } from "./LasagnaTower.tsx";

interface PlayerPanelProps {
  player: PlayerState;
  total: number;
  isTurn: boolean;
  selectable?: boolean;
  hidden?: boolean;
  onSelect?: () => void;
}

export function PlayerPanel({
  player,
  total,
  isTurn,
  selectable,
  hidden,
  onSelect,
}: PlayerPanelProps) {
  const chef = player.chefId ? getChef(player.chefId) : undefined;
  return (
    <button
      type="button"
      onClick={selectable ? onSelect : undefined}
      disabled={!selectable}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-3 bg-brand-table/60 p-3 transition",
        isTurn ? "border-brand-tomato shadow-card" : "border-brand-crust/60",
        selectable
          ? "cursor-pointer animate-target hover:border-brand-cheese hover:bg-brand-tomato/10"
          : "cursor-default",
      )}
    >
      <div className="flex flex-col items-center gap-1.5">
        <Avatar id={player.id} name={player.name} size="sm" />
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm text-brand-bechamel">{player.name}</span>
          {player.isBot && <span className="text-[10px] text-brand-bechamel/60">(bot)</span>}
        </div>
      </div>
      {chef && (
        <span className="rounded-full bg-brand-crust px-2 py-0.5 text-center text-[10px] text-brand-cheese">
          {chef.name}
        </span>
      )}
      <span className="text-[10px] text-brand-bechamel/70">Mano: {player.hand.length}</span>
      <LasagnaTower layers={player.lasagna} total={total} compact hidden={hidden} />
    </button>
  );
}
