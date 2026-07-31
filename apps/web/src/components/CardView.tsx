import type { Card } from "@lasana/engine";
import { motion } from "framer-motion";
import { useState } from "react";
import { cardImageSrc } from "../lib/cardImages.ts";
import { describeCard } from "../lib/cardInfo.ts";
import { cardTheme } from "../lib/cardTheme.ts";
import { cn } from "../lib/cn.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { Modal } from "./Modal.tsx";

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  /** Oculta el botón de ayuda cuando la carta se muestra solo como decoración. */
  hideInfo?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<CardViewProps["size"]>, string> = {
  xs: "w-14 h-[5.25rem] text-[8px]",
  sm: "w-[4.5rem] h-[6.75rem] text-[9px]",
  md: "w-[5.5rem] h-[8.25rem] text-[10px]",
  lg: "w-32 h-48 text-xs",
};

/** Etiqueta del valor numérico de la carta, al estilo de las fichas de Balatro. */
function cardValue(card: Card): string | null {
  if (card.kind === "ingredient") return `${card.value >= 0 ? "+" : ""}${card.value}`;
  if (card.kind !== "condiment") return null;
  const effect = card.selfEffect ?? card.throwEffect;
  if (!effect) return null;
  return effect.op === "add"
    ? `${effect.value >= 0 ? "+" : ""}${effect.value}`
    : `×${effect.factor}`;
}

export function CardView({
  card,
  onClick,
  disabled,
  highlighted,
  selected,
  size = "md",
  hideInfo,
  className,
}: CardViewProps) {
  const [showInfo, setShowInfo] = useState(false);
  const interactive = Boolean(onClick) && !disabled;
  const info = describeCard(card);
  const theme = cardTheme(card);
  const value = cardValue(card);

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        onHoverStart={interactive ? () => playSound("hover") : undefined}
        onTapStart={
          interactive
            ? () => {
                vibrate(8);
              }
            : undefined
        }
        whileHover={interactive ? { scale: 1.08, y: -10, rotate: 0 } : undefined}
        whileTap={interactive ? { scale: 0.96 } : undefined}
        transition={{ type: "spring", stiffness: 520, damping: 26 }}
        style={{ background: theme.background, borderColor: theme.frame }}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-xl border-3 shadow-card",
          SIZES[size],
          disabled ? "cursor-not-allowed grayscale-45 brightness-75" : "cursor-pointer",
          highlighted && "ring-4 ring-brand-cheese",
          selected && "ring-4 ring-brand-tomato shadow-card-hover",
        )}
      >
        {highlighted && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-lg bg-brand-cheese/30"
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-white/25"
          aria-hidden="true"
        />
        <span className="relative z-10 flex flex-1 items-center justify-center p-1">
          <img
            src={cardImageSrc(card)}
            alt={card.name}
            draggable={false}
            className="h-full w-full object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"
          />
        </span>
        {value && (
          <span
            className="absolute left-1 top-1 z-20 rounded-md px-1 font-display leading-tight text-brand-bechamel"
            style={{ background: theme.frame }}
          >
            {value}
          </span>
        )}
        <span
          className="relative z-10 truncate px-1 py-0.5 text-center font-display leading-tight"
          style={{ background: theme.frame, color: theme.ink }}
        >
          {card.name}
        </span>
      </motion.button>

      {!hideInfo && (
        <button
          type="button"
          title="¿Qué hace esta carta?"
          aria-label={`¿Qué hace ${card.name}?`}
          onClick={(event) => {
            event.stopPropagation();
            setShowInfo(true);
          }}
          className="absolute right-1 top-1 z-30 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-brand-bechamel/40 bg-brand-crust/90 text-[11px] font-bold leading-none text-brand-bechamel shadow-sm transition hover:bg-brand-crust"
        >
          ?
        </button>
      )}

      <Modal open={showInfo} title={card.name} onClose={() => setShowInfo(false)}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-40 w-28 items-center justify-center rounded-xl border-3 p-2 shadow-card"
            style={{ background: theme.background, borderColor: theme.frame }}
          >
            <img
              src={cardImageSrc(card)}
              alt={card.name}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="rounded-full bg-brand-crust px-3 py-1 text-xs text-brand-cheese">
            {info.typeLabel}
          </span>
          {info.statLines.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-brand-bechamel/80">
              {info.statLines.map((line) => (
                <span key={line} className="rounded-lg bg-brand-table/60 px-2 py-1">
                  {line}
                </span>
              ))}
            </div>
          )}
          <p className="text-center text-sm text-brand-bechamel/90">{info.description}</p>
        </div>
      </Modal>
    </div>
  );
}
