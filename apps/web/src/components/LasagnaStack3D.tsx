import { getCard, type LayerEvent } from "@lasana/engine";
import { motion } from "framer-motion";
import { cn } from "../lib/cn.ts";

interface LasagnaStack3DProps {
  layers: LayerEvent[];
  /** Altura en píxeles de cada loncha; controla el tamaño de la torre. */
  slabHeight?: number;
  width?: number;
  /** Modo secreto: capas boca abajo, sin nombre ni valor. */
  hidden?: boolean;
  /** Presentación protagonista para la lasaña del jugador local. */
  featured?: boolean;
}

type LayerLook = "pasta" | "bechamel" | "filling" | "condiment" | "opponent";

/** Da a cada carta una capa reconocible de lasaña, no solo un color por puntuación. */
function layerLook(layer: LayerEvent): LayerLook {
  if (layer.origin === "opponent") return "opponent";
  const card = getCard(layer.cardId);
  if (card.kind === "ingredient") {
    if (card.subtype === "pasta") return "pasta";
    if (card.subtype === "bechamel") return "bechamel";
    return "filling";
  }
  return "condiment";
}

/** Torre de lasaña vista en perspectiva: cada capa es una loncha apilada. */
export function LasagnaStack3D({
  layers,
  slabHeight = 14,
  width = 130,
  hidden,
  featured = false,
}: LasagnaStack3DProps) {
  const overlap = slabHeight * 0.62;
  const baseOffset = slabHeight * 0.32;

  return (
    <div
      className={cn("lasagna-stack relative isolate", featured && "is-featured")}
      style={{ width, height: Math.max(slabHeight * 1.7, layers.length * overlap + slabHeight) }}
    >
      <div
        aria-hidden="true"
        className="lasagna-plate absolute inset-x-[-5%]"
        style={{ bottom: 0, height: slabHeight * 0.8 }}
      />
      {layers.length === 0 && (
        <div
          className="lasagna-empty absolute inset-x-[3%] border-2 border-dashed border-brand-bechamel/35"
          style={{ bottom: baseOffset, height: slabHeight }}
        />
      )}
      {layers.map((layer, i) => (
        <motion.div
          key={`${layer.cardId}_${i}`}
          className={cn(
            "lasagna-layer absolute inset-x-0 flex items-center justify-between px-1.5",
            `is-${hidden ? "hidden" : layerLook(layer)}`,
            i === layers.length - 1 && "is-top-layer",
          )}
          title={hidden ? "Capa oculta" : layer.cardName}
          style={{
            bottom: baseOffset + i * overlap,
            height: slabHeight,
            zIndex: i + 1,
          }}
          initial={{ opacity: 0, y: -40, rotateZ: -6, scaleX: 1.2 }}
          animate={{ opacity: 1, y: 0, rotateZ: 0, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
        </motion.div>
      ))}
    </div>
  );
}
