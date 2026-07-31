import type { LayerEvent } from "@lasana/engine";
import { motion } from "framer-motion";
import { cn } from "../lib/cn.ts";

interface LasagnaTowerProps {
  layers: LayerEvent[];
  total: number;
  compact?: boolean;
  /** Modo secreto: se muestran las capas boca abajo y sin total. */
  hidden?: boolean;
}

export function LasagnaTower({ layers, total, compact, hidden }: LasagnaTowerProps) {
  if (hidden) {
    return (
      <div className="flex w-full flex-col items-center gap-1">
        <div className="font-display text-lg text-brand-cheese">?</div>
        <div
          className={cn(
            "flex w-full flex-col-reverse gap-0.5 overflow-y-auto",
            compact ? "max-h-32" : "max-h-56",
          )}
        >
          {layers.length === 0 && (
            <div className="rounded border border-dashed border-brand-bechamel/30 px-2 py-3 text-center text-[10px] text-brand-bechamel/50">
              Plato vacío
            </div>
          )}
          {layers.map((_, i) => (
            <div
              key={`hidden_${i}`}
              className="rounded-md border-2 border-brand-crust bg-brand-crust/60 px-2 py-1 text-center text-[10px] leading-tight text-brand-bechamel/60"
            >
              Capa oculta
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="font-display text-lg text-brand-cheese">{total}</div>
      <div
        className={cn(
          "flex w-full flex-col-reverse gap-0.5 overflow-y-auto",
          compact ? "max-h-32" : "max-h-56",
        )}
      >
        {layers.length === 0 && (
          <div className="rounded border border-dashed border-brand-bechamel/30 px-2 py-3 text-center text-[10px] text-brand-bechamel/50">
            Plato vacío
          </div>
        )}
        {layers.map((layer, i) => (
          <motion.div
            key={`${layer.cardId}_${i}`}
            className={cn(
              "flex items-center justify-between rounded-md border-2 px-2 py-1 text-[10px] leading-tight",
              layer.origin === "opponent"
                ? "border-brand-tomato bg-brand-tomato/20"
                : layer.op === "multiply"
                  ? "border-brand-cheese bg-brand-cheese/20"
                  : "border-brand-basil bg-brand-basil/20",
            )}
            initial={{ opacity: 0, y: 18, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            <span className="truncate pr-1">{layer.cardName}</span>
            <span className="font-display shrink-0">
              {layer.op === "multiply" ? "×" : layer.value >= 0 ? "+" : ""}
              {layer.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
