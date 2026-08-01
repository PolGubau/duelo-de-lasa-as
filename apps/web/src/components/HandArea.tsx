import type { GameState } from "@lasana/engine";
import { currentPhase, getCard, isIngredientPlayable } from "@lasana/engine";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { playSound, vibrate } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";
import { Button } from "./Button.tsx";
import { HandFan } from "./HandFan.tsx";

interface HandAreaProps {
  state: GameState;
}

export function HandArea({ state }: HandAreaProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const player = state.players[state.turnPlayerIndex]!;
  const selectedId = selectedIndex !== null ? player.hand[selectedIndex] : undefined;
  const phase = currentPhase(state);
  const pendingThrowCardId = useGameStore((s) => s.pendingThrowCardId);
  const playIngredient = useGameStore((s) => s.playIngredient);
  const discardAndDraw = useGameStore((s) => s.discardAndDraw);
  const playCondimentSelf = useGameStore((s) => s.playCondimentSelf);
  const beginThrow = useGameStore((s) => s.beginThrow);
  const cancelThrow = useGameStore((s) => s.cancelThrow);
  const endTurn = useGameStore((s) => s.endTurn);

  const selectedCard = selectedId ? getCard(selectedId) : undefined;
  const canPlayIngredient =
    selectedCard?.kind === "ingredient" &&
    selectedCard.subtype === phase &&
    !state.hasPlayedIngredientThisTurn;
  const canDiscard =
    Boolean(selectedCard) && !state.hasDiscardedThisTurn && !state.hasPlayedIngredientThisTurn;
  const canUseSelf =
    selectedCard?.kind === "condiment" &&
    (selectedCard.mode === "self" || selectedCard.mode === "dual") &&
    state.condimentsPlayedThisTurn < state.config.maxCondimentsPerTurn;
  const canThrow =
    selectedCard?.kind === "condiment" &&
    (selectedCard.mode === "throw" || selectedCard.mode === "dual") &&
    state.condimentsPlayedThisTurn < state.config.maxCondimentsPerTurn;

  /** Solo se ofrecen las acciones que la carta seleccionada permite ahora mismo. */
  const actions: {
    key: string;
    label: string;
    variant: "primary" | "secondary" | "ghost";
    run: () => void;
  }[] = [];
  if (canPlayIngredient && selectedId) {
    actions.push({
      key: "play",
      label: "Poner en mi lasaña",
      variant: "secondary",
      run: () => playIngredient(selectedId),
    });
  }
  if (canUseSelf && selectedId) {
    actions.push({
      key: "self",
      label: "Usar en mi lasaña",
      variant: "secondary",
      run: () => playCondimentSelf(selectedId),
    });
  }
  if (canThrow && selectedId) {
    actions.push({
      key: "throw",
      label: "Lanzar a un rival",
      variant: "primary",
      run: () => beginThrow(selectedId),
    });
  }
  if (canDiscard && selectedId) {
    actions.push({
      key: "discard",
      label: "Descartar y robar",
      variant: "ghost",
      run: () => discardAndDraw(selectedId),
    });
  }

  if (pendingThrowCardId) {
    const card = getCard(pendingThrowCardId);
    return (
      <div className="game-hand-area flex shrink-0 flex-col items-center gap-2 border-t-3 border-brand-cheese bg-brand-table/90 px-3 py-2">
        <p className="text-center font-display text-sm text-brand-cheese">
          Elige a qué rival lanzarle {card.name} ☝️
        </p>
        <Button variant="ghost" size="sm" onClick={cancelThrow}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="game-hand-area flex shrink-0 flex-col items-center">
      <HandFan
        hand={player.hand}
        selectedIndex={selectedIndex}
        isPlayable={(cardId) =>
          !state.hasPlayedIngredientThisTurn && isIngredientPlayable(state, cardId)
        }
        onSelect={(index) => {
          playSound("select");
          vibrate(8);
          setSelectedIndex(index === selectedIndex ? null : index);
        }}
      />

      <div className="relative z-40 flex min-h-13 w-full items-center justify-center gap-2 px-2 pb-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {actions.length > 0 && (
            actions.map((action) => (
              <motion.div
                key={action.key}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 460, damping: 26 }}
              >
                <Button
                  size="sm"
                  variant={action.variant}
                  onClick={() => {
                    vibrate(10);
                    action.run();
                    setSelectedIndex(null);
                  }}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))
          )}
          <motion.div key="end" layout>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                vibrate(10);
                endTurn();
                setSelectedIndex(null);
              }}
            >
              Terminar turno
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
