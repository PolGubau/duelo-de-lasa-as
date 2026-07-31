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
import { useEffect, useState } from "react";
import { Button } from "../components/Button.tsx";
import { CardView } from "../components/CardView.tsx";
import { PlayerPanel } from "../components/PlayerPanel.tsx";
import { ScoreBreakdown } from "../components/ScoreBreakdown.tsx";
import { playBotTurn } from "../lib/bot.ts";
import { runningTotal } from "../lib/layers.ts";
import { playSound } from "../lib/sound.ts";

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

/** Pista contextual: explica la regla que toca aprender en cada momento. */
function hintFor(state: GameState): string {
  if (state.status === "chefDraw")
    return "Cada jugador roba un Chef: su efecto se aplica al final.";
  if (state.status === "trading")
    return "Puedes intercambiar chefs con un rival. Aquí lo saltamos y pasamos a puntuar.";
  if (state.status === "scoring")
    return "La lasaña se calcula de abajo arriba: las sumas y multiplicadores se aplican en orden.";
  if (state.status === "finished") return "¡Fin del tutorial! Ya puedes jugar online.";
  if (currentPlayer(state).id === BOT) return "El Chef Bot está jugando su turno…";
  if (!state.hasPlayedIngredientThisTurn)
    return `Fase ${currentPhase(state)}: solo puedes colocar ingredientes de ese tipo. Si no tienes, descarta y roba.`;
  return "Los condimentos suman a tu lasaña o se lanzan al rival para estropear la suya. Luego termina el turno.";
}

export function TutorialScreen({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<GameState>(newGame);
  const [selected, setSelected] = useState<string | null>(null);
  const [throwing, setThrowing] = useState(false);

  function apply(result: ActionResult): void {
    if (result.ok) {
      setState(result.state);
      playSound("play");
    } else playSound("error");
    setSelected(null);
    setThrowing(false);
  }

  useEffect(() => {
    if (state.status !== "playing" || currentPlayer(state).id !== BOT) return;
    const timer = window.setTimeout(() => setState((prev) => playBotTurn(prev, BOT)), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  const me = state.players.find((player) => player.id === ME)!;
  const card = selected ? getCard(selected) : undefined;
  const myTurn = state.status === "playing" && currentPlayer(state).id === ME;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-brand-cheese">Tutorial</h1>
        <Button size="sm" variant="danger" onClick={onExit}>
          Salir
        </Button>
      </div>

      <p className="rounded-2xl border-3 border-brand-cheese bg-brand-cheese/10 p-3 text-sm">
        {hintFor(state)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {state.players.map((player) => (
          <PlayerPanel
            key={player.id}
            player={player}
            total={runningTotal(player.lasagna)}
            isTurn={state.status === "playing" && currentPlayer(state).id === player.id}
            selectable={throwing && player.id === BOT}
            onSelect={() => selected && apply(playCondiment(state, ME, selected, BOT))}
          />
        ))}
      </div>

      {myTurn && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-3 border-brand-crust bg-brand-table/80 p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {me.hand.map((cardId, index) => (
              <CardView
                key={`${cardId}_${index}`}
                card={getCard(cardId)}
                selected={selected === cardId}
                highlighted={
                  !state.hasPlayedIngredientThisTurn && isIngredientPlayable(state, cardId)
                }
                onClick={() => {
                  playSound("select");
                  setSelected(selected === cardId ? null : cardId);
                  setThrowing(false);
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              disabled={card?.kind !== "ingredient" || card.subtype !== currentPhase(state)}
              onClick={() => selected && apply(playIngredient(state, ME, selected))}
            >
              Jugar ingrediente
            </Button>
            <Button
              variant="secondary"
              disabled={card?.kind !== "condiment" || card.mode === "throw"}
              onClick={() => selected && apply(playCondiment(state, ME, selected))}
            >
              Usar en mi lasaña
            </Button>
            <Button
              variant="secondary"
              disabled={card?.kind !== "condiment" || card.mode === "self"}
              onClick={() => setThrowing(true)}
            >
              Lanzar al rival
            </Button>
            <Button
              variant="ghost"
              disabled={!selected || state.hasDiscardedThisTurn}
              onClick={() => selected && apply(discardAndDraw(state, ME, selected))}
            >
              Descartar y robar
            </Button>
            <Button variant="danger" onClick={() => apply(endTurn(state, ME))}>
              Terminar turno
            </Button>
          </div>
        </div>
      )}

      {state.status === "chefDraw" && (
        <Button
          className="self-center"
          onClick={() => {
            const mine = drawChef(state, ME);
            apply(mine.ok ? drawChef(mine.state, BOT) : mine);
          }}
        >
          Robar chefs
        </Button>
      )}

      {state.status === "trading" && (
        <Button className="self-center" onClick={() => apply(finishTrading(state))}>
          Saltar trueques y puntuar
        </Button>
      )}

      {state.status === "scoring" && (
        <div className="flex flex-col gap-3">
          {state.players.map((player) => (
            <ScoreBreakdown
              key={player.id}
              player={player}
              score={scoreGame(state).find((score) => score.playerId === player.id)!}
            />
          ))}
          <Button className="self-center" onClick={() => apply(finishScoring(state))}>
            Ver resultado
          </Button>
        </div>
      )}

      {state.status === "finished" && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-xl text-brand-cheese">
            Gana {state.players.find((player) => player.id === state.winnerId)?.name ?? "nadie"}
          </p>
          <Button onClick={onExit}>Volver al menú</Button>
        </div>
      )}
    </div>
  );
}
