import type { CondimentCard, GameState } from "@lasana/engine";
import {
  currentPhase,
  discardAndDraw,
  endTurn,
  getCard,
  getIngredient,
  playCondiment,
  playIngredient,
} from "@lasana/engine";

function findPlayer(state: GameState, playerId: string) {
  return state.players.find((p) => p.id === playerId)!;
}

function lasagnaValue(state: GameState, playerId: string): number {
  return findPlayer(state, playerId).lasagna.reduce(
    (acc, l) => (l.op === "add" ? acc + l.value : acc * l.value),
    0,
  );
}

/** Elige al rival con la lasaña más avanzada, para arrojarle un condimento. */
function pickTarget(state: GameState, exceptId: string): string | undefined {
  let best: string | undefined;
  let bestValue = -Infinity;
  for (const p of state.players) {
    if (p.id === exceptId) continue;
    const value = lasagnaValue(state, p.id);
    if (value > bestValue) {
      bestValue = value;
      best = p.id;
    }
  }
  return best;
}

function pickDiscard(state: GameState, playerId: string): string | undefined {
  const player = findPlayer(state, playerId);
  const phase = currentPhase(state);
  const nonMatching = player.hand.filter((id) => {
    const card = getCard(id);
    return card.kind === "ingredient" && card.subtype !== phase;
  });
  return nonMatching[0] ?? player.hand[0];
}

function bestIngredientFor(state: GameState, playerId: string): string | undefined {
  const player = findPlayer(state, playerId);
  const phase = currentPhase(state);
  const candidates = player.hand
    .filter((id) => {
      const card = getCard(id);
      return card.kind === "ingredient" && card.subtype === phase;
    })
    .map((id) => getIngredient(id))
    .sort((a, b) => b.value - a.value);
  return candidates[0]?.id;
}

/** Ejecuta el turno completo de un bot: condimentos, ingrediente/descarte y fin de turno. */
export function playBotTurn(initial: GameState, playerId: string): GameState {
  let state = initial;

  const selfCondId = findPlayer(state, playerId).hand.find((id) => {
    const card = getCard(id);
    return card.kind === "condiment" && (card.mode === "self" || card.mode === "dual");
  });
  if (selfCondId && state.condimentsPlayedThisTurn < state.config.maxCondimentsPerTurn) {
    const res = playCondiment(state, playerId, selfCondId);
    if (res.ok) state = res.state;
  }

  const throwCondId = findPlayer(state, playerId).hand.find((id) => {
    const card = getCard(id) as CondimentCard;
    return card.kind === "condiment" && (card.mode === "throw" || card.mode === "dual");
  });
  if (throwCondId && state.condimentsPlayedThisTurn < state.config.maxCondimentsPerTurn) {
    const target = pickTarget(state, playerId);
    if (target) {
      const res = playCondiment(state, playerId, throwCondId, target);
      if (res.ok) state = res.state;
    }
  }

  if (!state.hasPlayedIngredientThisTurn) {
    let ingredientId = bestIngredientFor(state, playerId);
    if (!ingredientId && !state.hasDiscardedThisTurn) {
      const toDiscard = pickDiscard(state, playerId);
      if (toDiscard) {
        const res = discardAndDraw(state, playerId, toDiscard);
        if (res.ok) state = res.state;
        ingredientId = bestIngredientFor(state, playerId);
      }
    }
    if (ingredientId) {
      const res = playIngredient(state, playerId, ingredientId);
      if (res.ok) state = res.state;
    }
  }

  const ended = endTurn(state, playerId);
  return ended.ok ? ended.state : state;
}
