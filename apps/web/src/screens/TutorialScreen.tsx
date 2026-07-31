import type { ActionResult, GameState } from "@lasana/engine";
import {
  createGame,
  currentPhase,
  currentPlayer,
  discardAndDraw,
  drawChef,
  endTurn,
  finishScoring,
  finishTrading,
  getCard,
  isIngredientPlayable,
  playCondiment,
  playIngredient,
  scoreGame,
} from "@lasana/engine";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button.tsx";
import { HandFan } from "../components/HandFan.tsx";
import { PhaseHeader } from "../components/PhaseHeader.tsx";
import { PhaseSplash } from "../components/PhaseSplash.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { TableStage } from "../components/TableStage.tsx";
import { playBotTurn } from "../lib/bot.ts";
import { cn } from "../lib/cn.ts";
import { phaseInfoFor } from "../lib/phases.ts";
import { playSound, vibrate } from "../lib/sound.ts";

const ME = "tutorial_me";
const BOT = "tutorial_bot";

function newGame(): GameState {
  return createGame(
    [
      { id: ME, name: "Tú" },
      { id: BOT, name: "Chef Bot", isBot: true },
    ],
    { seed: "tutorial", config: { roundsCount: 2 } },
  );
}

interface Guide {
  icon: string;
  title: string;
  body: string;
  highlight?: "hand" | "useSelf" | "throw" | "discard" | "endTurn";
}

/** Guía contextual: qué explicar según lo que el jugador ya ha aprendido a hacer. */
function guideFor(state: GameState, learned: Set<string>, myTurn: boolean): Guide {
  if (state.status === "finished") {
    return {
      icon: "🎉",
      title: "¡Tutorial completo!",
      body: "Ya conoces fases, condimentos, chefs y puntuación. ¡A jugar de verdad!",
    };
  }
  if (state.status === "scoring") {
    return {
      icon: "🧮",
      title: "Puntuación",
      body: "La lasaña se calcula de abajo arriba: cada capa suma o multiplica sobre el total. El Chef aplica su efecto al final.",
    };
  }
  if (state.status === "trading") {
    return {
      icon: "🤝",
      title: "Trueque de Chefs",
      body: "Podéis proponer intercambiar chefs si no os convence el vuestro. Aquí lo saltamos directos a puntuar.",
    };
  }
  if (state.status === "chefDraw") {
    return {
      icon: "👨‍🍳",
      title: "Reparto de Chefs",
      body: "Cada jugador roba un chef al azar; su efecto especial se suma al calcular la puntuación final.",
    };
  }
  if (!myTurn) {
    return {
      icon: "🤖",
      title: `Turno de ${currentPlayer(state).name}`,
      body: "Observa cómo juega la máquina; enseguida vuelve tu turno.",
    };
  }
  const phase = currentPhase(state);
  if (!learned.has("ingredient")) {
    return {
      icon: phaseInfoFor(state.status, phase).icon,
      title: `Fase de ${phase}`,
      body: `Solo puedes colocar ingredientes de tipo "${phase}" en esta fase. Toca una carta resaltada y pulsa "Poner en mi lasaña".`,
      highlight: "hand",
    };
  }
  if (!learned.has("condiment_self")) {
    return {
      icon: "🧂",
      title: "Condimentos: para tu lasaña",
      body: "Si tienes un condimento, puedes usarlo en tu propia lasaña para sumar (o multiplicar) puntos extra.",
      highlight: "useSelf",
    };
  }
  if (!learned.has("condiment_throw")) {
    return {
      icon: "🎯",
      title: "Condimentos: al rival",
      body: 'Otros condimentos se lanzan a la lasaña de un rival para estropearla. Selecciona uno y pulsa "Lanzar a un rival".',
      highlight: "throw",
    };
  }
  if (!learned.has("discard")) {
    return {
      icon: "🔄",
      title: "¿Sin cartas útiles?",
      body: "Descarta una carta y roba otra del mazo si ninguna te sirve ahora mismo.",
      highlight: "discard",
    };
  }
  return {
    icon: "⏭️",
    title: "Termina tu turno",
    body: 'Cuando ya no quieras jugar más cartas, pulsa "Terminar turno" para pasar el turno.',
    highlight: "endTurn",
  };
}

const MILESTONES: { key: string; icon: string; label: string }[] = [
  { key: "ingredient", icon: "🥘", label: "Ingrediente" },
  { key: "condiment_self", icon: "🧂", label: "Condimento" },
  { key: "condiment_throw", icon: "🎯", label: "Lanzar" },
  { key: "discard", icon: "🔄", label: "Descarte" },
  { key: "chef", icon: "👨‍🍳", label: "Chef" },
  { key: "score", icon: "🧮", label: "Puntos" },
];

interface Splash {
  id: number;
  icon: string;
  title: string;
  message: string;
  color: string;
}

export function TutorialScreen({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<GameState>(newGame);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [splash, setSplash] = useState<Splash | null>(null);
  const prevStatus = useRef(state.status);

  const me = state.players.find((player) => player.id === ME)!;
  const selectedId = selectedIndex !== null ? me.hand[selectedIndex] : undefined;
  const myTurn = state.status === "playing" && currentPlayer(state).id === ME;

  function fireSplash(icon: string, title: string, message: string, color: string): void {
    const id = Date.now();
    setSplash({ id, icon, title, message, color });
    playSound("splash");
    window.setTimeout(() => setSplash((current) => (current?.id === id ? null : current)), 1300);
  }

  function learn(key: string): void {
    setLearned((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }

  function apply(result: ActionResult, milestone?: string): void {
    if (result.ok) {
      setState(result.state);
      playSound("play");
      if (milestone) learn(milestone);
    } else {
      playSound("error");
    }
    setSelectedIndex(null);
    setThrowing(false);
  }

  useEffect(() => {
    if (state.status !== "playing" || currentPlayer(state).id !== BOT) return;
    const timer = window.setTimeout(() => setState((prev) => playBotTurn(prev, BOT)), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (prevStatus.current !== "finished" && state.status === "finished") {
      const winner = state.players.find((p) => p.id === state.winnerId);
      fireSplash(
        "🏆",
        "¡Victoria!",
        `${winner?.name ?? "Nadie"} gana la partida`,
        "var(--color-brand-cheese)",
      );
    }
    prevStatus.current = state.status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.players, state.winnerId]);

  const guide = guideFor(state, learned, myTurn);
  const phase = currentPhase(state);
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

  const actions: {
    key: string;
    label: string;
    variant: "primary" | "secondary" | "ghost";
    highlight: boolean;
    run: () => void;
  }[] = [];
  if (canPlayIngredient && selectedId) {
    actions.push({
      key: "play",
      label: "Poner en mi lasaña",
      variant: "primary",
      highlight: false,
      run: () => apply(playIngredient(state, ME, selectedId), "ingredient"),
    });
  }
  if (canUseSelf && selectedId) {
    actions.push({
      key: "self",
      label: "Usar en mi lasaña",
      variant: "secondary",
      highlight: guide.highlight === "useSelf",
      run: () => apply(playCondiment(state, ME, selectedId), "condiment_self"),
    });
  }
  if (canThrow && selectedId) {
    actions.push({
      key: "throw",
      label: "Lanzar a un rival",
      variant: "secondary",
      highlight: guide.highlight === "throw",
      run: () => setThrowing(true),
    });
  }
  if (canDiscard && selectedId) {
    actions.push({
      key: "discard",
      label: "Descartar y robar",
      variant: "ghost",
      highlight: guide.highlight === "discard",
      run: () => apply(discardAndDraw(state, ME, selectedId), "discard"),
    });
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden">
      <PhaseSplash state={state} />

      <AnimatePresence>
        {splash && (
          <motion.div
            key={splash.id}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            <div className="splash-burst absolute inset-0" />
            <motion.div
              className="splash-rays absolute h-[140vmax] w-[140vmax] opacity-40"
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="relative flex flex-col items-center gap-1"
              initial={{ scale: 0.3, rotate: -12 }}
              animate={{ scale: [0.3, 1.15, 1], rotate: [-12, 4, 0] }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <span className="text-7xl drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]">{splash.icon}</span>
              <span className="font-display text-4xl text-outline" style={{ color: splash.color }}>
                {splash.title}
              </span>
              <span className="max-w-[80vw] text-center font-display text-sm text-brand-bechamel">
                {splash.message}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex shrink-0 items-center justify-between px-3 pt-2">
        <span className="font-display text-xs uppercase tracking-widest text-brand-cheese">
          🎓 Tutorial
        </span>
        <Button size="sm" variant="danger" onClick={onExit}>
          Salir
        </Button>
      </div>

      <PhaseHeader
        state={state}
        turnLabel={myTurn ? "Es tu turno" : `Juega ${currentPlayer(state).name}`}
      />

      <div className="flex shrink-0 justify-center gap-1.5 px-2 pb-1">
        {MILESTONES.map((milestone) => {
          const achieved = learned.has(milestone.key);
          return (
            <motion.div
              key={milestone.key}
              title={milestone.label}
              animate={achieved ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm transition-colors",
                achieved
                  ? "border-brand-cheese bg-brand-cheese/25"
                  : "border-brand-bechamel/20 bg-brand-crust/40 opacity-40 grayscale",
              )}
            >
              {milestone.icon}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${guide.title}_${guide.body}`}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="mx-3 mb-1 flex shrink-0 items-start gap-2 rounded-2xl border-3 border-brand-cheese bg-brand-table/90 px-3 py-2 shadow-card"
        >
          <span className="text-2xl leading-none">{guide.icon}</span>
          <div className="flex flex-col">
            <span className="font-display text-sm text-brand-cheese">{guide.title}</span>
            <span className="text-xs text-brand-bechamel/90">{guide.body}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <TableStage
        players={state.players}
        meId={ME}
        turnPlayerId={currentPlayer(state).id}
        secret={false}
        targeting={throwing}
        onTarget={(targetId) => {
          if (!selectedId) return;
          const card = getCard(selectedId);
          const target = state.players.find((p) => p.id === targetId);
          apply(playCondiment(state, ME, selectedId, targetId), "condiment_throw");
          fireSplash(
            "⚡",
            "¡Zasca!",
            `${card.name} cae en la lasaña de ${target?.name ?? "?"}`,
            "var(--color-brand-tomato)",
          );
        }}
      />

      {state.status === "playing" && myTurn && (
        <div className="flex shrink-0 flex-col items-center">
          {throwing ? (
            <div className="flex flex-col items-center gap-2 px-3 py-3">
              <p className="text-center font-display text-sm text-brand-cheese">
                Elige a qué rival lanzarle {selectedCard?.name} ☝️
              </p>
              <Button variant="ghost" size="sm" onClick={() => setThrowing(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "rounded-3xl",
                  guide.highlight === "hand" && "animate-target ring-4 ring-brand-cheese",
                )}
              >
                <HandFan
                  hand={me.hand}
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
              </div>
              <div className="flex min-h-13 w-full flex-wrap items-center justify-center gap-2 px-2 pb-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {actions.length === 0 ? (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="text-center text-[11px] text-brand-bechamel/60"
                    >
                      Toca una carta para ver qué puedes hacer con ella.
                    </motion.p>
                  ) : (
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
                          className={cn(
                            action.highlight && "animate-target ring-4 ring-brand-cheese",
                          )}
                          onClick={() => {
                            vibrate(10);
                            action.run();
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
                      className={cn(
                        guide.highlight === "endTurn" && "animate-target ring-4 ring-brand-cheese",
                      )}
                      onClick={() => {
                        vibrate(10);
                        apply(endTurn(state, ME));
                      }}
                    >
                      Terminar turno
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      )}

      {state.status === "playing" && !myTurn && (
        <div className="shrink-0 border-t-3 border-brand-crust bg-brand-table/90 px-3 py-4 text-center font-display text-sm text-brand-bechamel/70">
          Turno de {currentPlayer(state).name} · espera a que juegue…
        </div>
      )}

      {state.status === "chefDraw" && (
        <div className="flex shrink-0 justify-center px-3 py-4">
          <Button
            onClick={() => {
              const mine = drawChef(state, ME);
              apply(mine.ok ? drawChef(mine.state, BOT) : mine, "chef");
            }}
          >
            Robar chefs
          </Button>
        </div>
      )}

      {state.status === "trading" && (
        <div className="flex shrink-0 justify-center px-3 py-4">
          <Button onClick={() => apply(finishTrading(state))}>Saltar trueques y puntuar</Button>
        </div>
      )}

      {state.status === "scoring" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
          {state.players.map((player) => (
            <ScoreBreakdown
              key={player.id}
              player={player}
              score={scoreGame(state).find((score) => score.playerId === player.id)!}
            />
          ))}
          <Button className="self-center" onClick={() => apply(finishScoring(state), "score")}>
            Ver resultado
          </Button>
        </div>
      )}

      {state.status === "finished" && (
        <div className="flex shrink-0 flex-col items-center gap-3 px-3 py-4">
          <p className="font-display text-xl text-brand-cheese">
            Gana {state.players.find((player) => player.id === state.winnerId)?.name ?? "nadie"}
          </p>
          <Button onClick={onExit}>Volver al menú</Button>
        </div>
      )}
    </div>
  );
}
