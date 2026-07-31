import type { LayerEvent } from "@lasana/engine";
import { motion } from "framer-motion";
import { cn } from "../lib/cn.ts";

interface LasagnaStack3DProps {
  layers: LayerEvent[];
  /** Altura en píxeles de cada loncha; controla el tamaño de la torre. */
  slabHeight?: number;
  width?: number;
  /** Modo secreto: capas boca abajo, sin nombre ni valor. */
  hidden?: boolean;
}

function slabColor(layer: LayerEvent): string {
  if (layer.origin === "opponent") return "var(--color-brand-tomato)";
  if (layer.op === "multiply") return "var(--color-brand-cheese)";
  return "var(--color-brand-basil)";
}

/** Torre de lasaña vista en perspectiva: cada capa es una loncha apilada. */
export function LasagnaStack3D({
  layers,
  slabHeight = 14,
  width = 130,
  hidden,
}: LasagnaStack3DProps) {
  const overlap = slabHeight * 0.55;

  return (
    <div
      className="relative"
      style={{ width, height: Math.max(slabHeight * 1.6, layers.length * overlap + slabHeight) }}
    >
      {layers.length === 0 && (
        <div
          className="absolute inset-x-0 bottom-0 rounded-full border-2 border-dashed border-brand-bechamel/30"
          style={{ height: slabHeight }}
        />
      )}
      {layers.map((layer, i) => (
        <motion.div
          key={`${layer.cardId}_${i}`}
          className={cn(
            "layer-slab absolute inset-x-0 flex items-center justify-between border-2 border-brand-crust px-1.5",
          )}
          style={{
            bottom: i * overlap,
            height: slabHeight,
            background: slabColor(layer),
            zIndex: i + 1,
          }}
          initial={{ opacity: 0, y: -40, rotateZ: -6, scaleX: 1.2 }}
          animate={{ opacity: 1, y: 0, rotateZ: 0, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          {!hidden && (
            <>
              <span className="truncate text-[9px] font-bold leading-none text-brand-crust">
                {layer.cardName}
              </span>
              <span className="shrink-0 font-display text-[10px] leading-none text-brand-crust">
                {layer.op === "multiply" ? "×" : layer.value >= 0 ? "+" : ""}
                {layer.value}
              </span>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
