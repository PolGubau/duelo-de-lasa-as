import { getCard } from "@lasana/engine";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { playSound } from "../lib/sound.ts";
import { CardView } from "./CardView.tsx";

interface HandFanProps {
  hand: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  /** Devuelve true si la carta se puede jugar en la fase actual. */
  isPlayable: (cardId: string) => boolean;
}

/** Reparte las cartas en abanico con una animación escalonada desde el mazo. */
export function HandFan({ hand, selectedIndex, onSelect, isPlayable }: HandFanProps) {
  const known = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = hand.filter((cardId, index) => !known.current.has(`${cardId}_${index}`));
    known.current = new Set(hand.map((cardId, index) => `${cardId}_${index}`));
    if (fresh.length === 0) return;
    const timers = fresh.map((_, i) => window.setTimeout(() => playSound("deal"), i * 90));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [hand]);

  const center = (hand.length - 1) / 2;
  const spread = Math.min(8, 46 / Math.max(hand.length, 1));

  return (
    <div className="hand-fan flex shrink-0 items-end justify-center px-2 pb-1 pt-6">
      {hand.map((cardId, index) => {
        const offset = index - center;
        const selected = selectedIndex === index;
        return (
          <motion.div
            key={`${cardId}_${index}`}
            className="hand-card"
            style={{ marginLeft: index === 0 ? 0 : "-1.15rem", zIndex: selected ? 30 : index }}
            initial={{ y: 260, opacity: 0, rotate: 0, scale: 0.6 }}
            animate={{
              y: Math.abs(offset) * 5 + (selected ? -22 : 0),
              opacity: 1,
              rotate: offset * spread,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              delay: Math.min(index * 0.07, 0.6),
            }}
          >
            <CardView
              card={getCard(cardId)}
              size="sm"
              selected={selected}
              highlighted={isPlayable(cardId)}
              onClick={() => onSelect(index)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
