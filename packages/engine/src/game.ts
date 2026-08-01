import {
  buildChefDeck,
  buildMainDeck,
  getCard,
  getChef,
  getCondiment,
  getIngredient,
} from "./cards.ts";
import { randomInt, seedFromString, shuffle } from "./prng.ts";
import { scoreGame, winnerOf } from "./scoring.ts";
import type { ActionResult, GameConfig, GameState, Phase, PlayerState } from "./types.ts";
import { PHASE_ORDER } from "./types.ts";

export const DEFAULT_CONFIG: GameConfig = {
  layersPerGame: 12,
  roundsCount: 4,
  handSize: 4,
  drawToHandSize: 4,
  maxCondimentsPerTurn: 2,
  visibility: "public",
};

export interface NewPlayerInput {
  id: string;
  name: string;
  isBot?: boolean;
}

export function createGame(
  players: readonly NewPlayerInput[],
  options?: { seed?: number | string; config?: Partial<GameConfig> },
): GameState {
  if (players.length < 2) throw new Error("Se necesitan al menos 2 jugadores");
  const config = { ...DEFAULT_CONFIG, ...options?.config };
  let rngState =
    typeof options?.seed === "string"
      ? seedFromString(options.seed)
      : (options?.seed ?? Date.now() >>> 0);

  let deck: string[];
  [rngState, deck] = shuffle(rngState, buildMainDeck());
  let chefDeck: string[];
  [rngState, chefDeck] = shuffle(rngState, buildChefDeck());

  const playerStates: PlayerState[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    isBot: p.isBot ?? false,
    hand: [],
    lasagna: [],
    ready: false,
  }));

  for (const player of playerStates) {
    for (let i = 0; i < config.handSize; i++) {
      const card = deck.pop();
      if (card) player.hand.push(card);
    }
  }

  return {
    config,
    seed: rngState,
    rngState,
    players: playerStates,
    deck,
    discard: [],
    chefDeck,
    chefChoices: {},
    round: 1,
    phaseIndex: 0,
    turnPlayerIndex: 0,
    hasDiscardedThisTurn: false,
    hasPlayedIngredientThisTurn: false,
    condimentsPlayedThisTurn: 0,
    status: "playing",
    pendingTrades: [],
    log: [`Partida iniciada con ${playerStates.length} jugadores.`],
  };
}

export function currentPhase(state: GameState): Phase {
  return PHASE_ORDER[state.phaseIndex]!;
}

export function currentPlayer(state: GameState): PlayerState {
  return state.players[state.turnPlayerIndex]!;
}

function clone(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, hand: [...p.hand], lasagna: [...p.lasagna] })),
    deck: [...state.deck],
    discard: [...state.discard],
    chefDeck: [...state.chefDeck],
    pendingTrades: [...state.pendingTrades],
    log: [...state.log],
  };
}

function fail(state: GameState, reason: string): ActionResult {
  return { ok: false, state, reason };
}

/** Elimina una sola ocurrencia de `item` (la primera), no todas. Las manos pueden tener duplicados. */
function removeOne<T>(list: T[], item: T): T[] {
  const idx = list.indexOf(item);
  if (idx === -1) return list;
  const copy = [...list];
  copy.splice(idx, 1);
  return copy;
}

/** Saca una carta del mazo, reciclando la pila de descarte si hace falta. */
function drawOne(state: GameState): { state: GameState; card?: string } {
  const next = clone(state);
  if (next.deck.length === 0 && next.discard.length > 0) {
    let shuffled: string[];
    [next.rngState, shuffled] = shuffle(next.rngState, next.discard);
    next.deck = shuffled;
    next.discard = [];
    next.log.push("Se recicló la pila de descarte en el mazo.");
  }
  const card = next.deck.pop();
  return { state: next, card };
}

export function isIngredientPlayable(state: GameState, cardId: string): boolean {
  const card = getCard(cardId);
  return card.kind === "ingredient" && card.subtype === currentPhase(state);
}

export function playIngredient(state: GameState, playerId: string, cardId: string): ActionResult {
  if (state.status !== "playing") return fail(state, "La partida no está en fase de construcción.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.hasPlayedIngredientThisTurn)
    return fail(state, "Ya has jugado un ingrediente este turno.");
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");
  if (!isIngredientPlayable(state, cardId)) {
    return fail(state, `Esa carta no corresponde a la fase actual (${currentPhase(state)}).`);
  }

  const card = getIngredient(cardId);
  const next = clone(state);
  const actor = next.players[next.turnPlayerIndex]!;
  actor.hand = removeOne(actor.hand, cardId);
  actor.lasagna.push({
    cardId,
    cardName: card.name,
    subtype: card.subtype,
    origin: "own",
    op: "add",
    value: card.value,
  });
  next.hasPlayedIngredientThisTurn = true;
  next.log.push(`${actor.name} juega ${card.name} (${card.subtype}).`);
  return { ok: true, state: next };
}

export function discardAndDraw(state: GameState, playerId: string, cardId: string): ActionResult {
  if (state.status !== "playing") return fail(state, "La partida no está en fase de construcción.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.hasDiscardedThisTurn) return fail(state, "Ya has descartado este turno.");
  if (state.hasPlayedIngredientThisTurn)
    return fail(state, "Ya has jugado un ingrediente este turno.");
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");

  let next = clone(state);
  const idx = next.turnPlayerIndex;
  const actorName = next.players[idx]!.name;
  next.players[idx]!.hand = removeOne(next.players[idx]!.hand, cardId);
  next.discard.push(cardId);

  const drawn = drawOne(next);
  next = drawn.state;
  if (drawn.card) next.players[idx]!.hand.push(drawn.card);
  next.hasDiscardedThisTurn = true;
  next.log.push(`${actorName} descarta y roba una carta.`);
  return { ok: true, state: next };
}

export function playCondiment(
  state: GameState,
  playerId: string,
  cardId: string,
  targetPlayerId?: string,
): ActionResult {
  if (state.status !== "playing") return fail(state, "La partida no está en fase de construcción.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.condimentsPlayedThisTurn >= state.config.maxCondimentsPerTurn) {
    return fail(state, "Ya has jugado el máximo de condimentos este turno.");
  }
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");
  const card = getCondiment(cardId);

  const isThrow = card.mode === "throw" || (card.mode === "dual" && targetPlayerId !== undefined);
  if (isThrow && (!targetPlayerId || targetPlayerId === playerId)) {
    return fail(state, "Selecciona un rival al que lanzar este condimento.");
  }
  if (!isThrow && targetPlayerId && targetPlayerId !== playerId) {
    return fail(state, "Ese condimento solo puede aplicarse a tu propia lasaña.");
  }
  const effect = isThrow ? card.throwEffect : card.selfEffect;
  if (!effect) return fail(state, "Ese condimento no tiene efecto en ese modo.");

  const finalTargetId = isThrow ? targetPlayerId! : playerId;
  if (!state.players.some((p) => p.id === finalTargetId))
    return fail(state, "Jugador objetivo inválido.");

  const next = clone(state);
  const actor = next.players.find((p) => p.id === playerId)!;
  actor.hand = removeOne(actor.hand, cardId);
  const target = next.players.find((p) => p.id === finalTargetId)!;
  target.lasagna.push({
    cardId,
    cardName: card.name,
    origin: isThrow ? "opponent" : "own",
    op: effect.op,
    value: effect.op === "add" ? effect.value : effect.factor,
  });
  next.condimentsPlayedThisTurn += 1;
  next.log.push(
    isThrow
      ? `${actor.name} arroja ${card.name} a la lasaña de ${target.name}.`
      : `${actor.name} añade ${card.name} a su lasaña.`,
  );
  return { ok: true, state: next };
}

function advanceTurn(state: GameState): void {
  state.turnPlayerIndex += 1;
  if (state.turnPlayerIndex >= state.players.length) {
    state.turnPlayerIndex = 0;
    state.phaseIndex += 1;
    if (state.phaseIndex >= PHASE_ORDER.length) {
      state.phaseIndex = 0;
      state.round += 1;
      if (state.round > state.config.roundsCount) {
        state.status = "chefDraw";
        state.log.push("Construcción terminada. Momento de repartir Chefs.");
      }
    }
  }
}

export function endTurn(state: GameState, playerId: string): ActionResult {
  if (state.status !== "playing") return fail(state, "La partida no está en fase de construcción.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");

  let next = clone(state);
  const idx = next.turnPlayerIndex;
  while (next.players[idx]!.hand.length < next.config.drawToHandSize) {
    const drawn = drawOne(next);
    next = drawn.state;
    if (!drawn.card) break;
    next.players[idx]!.hand.push(drawn.card);
  }
  const actorName = next.players[idx]!.name;
  next.hasDiscardedThisTurn = false;
  next.hasPlayedIngredientThisTurn = false;
  next.condimentsPlayedThisTurn = 0;
  next.log.push(`${actorName} termina su turno.`);
  advanceTurn(next);
  return { ok: true, state: next };
}

export function drawChef(state: GameState, playerId: string, chefId?: string): ActionResult {
  if (state.status !== "chefDraw") return fail(state, "No es momento de repartir chefs.");
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return fail(state, "Jugador desconocido.");
  if (player.chefId) return fail(state, "Ya tienes un chef asignado.");

  const choices = state.chefChoices[playerId];
  if (!choices) {
    const candidates = [...new Set(state.chefDeck)];
    if (candidates.length < 2) return fail(state, "No quedan suficientes chefs para elegir.");

    const next = clone(state);
    const offered: string[] = [];
    let available = [...new Set(next.chefDeck)];
    for (let i = 0; i < 2; i++) {
      const [rngState, index] = randomInt(next.rngState, available.length);
      next.rngState = rngState;
      const offeredChefId = available[index]!;
      offered.push(offeredChefId);
      next.chefDeck.splice(next.chefDeck.indexOf(offeredChefId), 1);
      available = available.filter((id) => id !== offeredChefId);
    }
    next.chefChoices = { ...next.chefChoices, [playerId]: offered };
    next.log.push(`${player.name} recibe dos opciones de chef.`);
    return { ok: true, state: next };
  }

  if (!chefId || !choices.includes(chefId))
    return fail(state, "Elige uno de los chefs que te han ofrecido.");

  const next = clone(state);
  const actor = next.players.find((p) => p.id === playerId)!;
  actor.chefId = chefId;
  const { [playerId]: _chosen, ...remainingChoices } = next.chefChoices;
  next.chefChoices = remainingChoices;
  next.log.push(`${actor.name} recibe al chef ${getChef(chefId).name}.`);
  if (next.players.every((p) => p.chefId)) {
    next.status = "trading";
    next.log.push("Todos tienen chef. Se abre la fase de trueque.");
  }
  return { ok: true, state: next };
}

export function proposeTrade(
  state: GameState,
  fromPlayerId: string,
  toPlayerId: string,
): ActionResult {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  if (fromPlayerId === toPlayerId)
    return fail(state, "No puedes proponerte un trueque a ti mismo.");
  if (
    !state.players.some((p) => p.id === fromPlayerId) ||
    !state.players.some((p) => p.id === toPlayerId)
  ) {
    return fail(state, "Jugador desconocido.");
  }
  const next = clone(state);
  const id = `trade_${next.pendingTrades.length}_${fromPlayerId}_${toPlayerId}`;
  next.pendingTrades.push({ id, fromPlayerId, toPlayerId, status: "pending" });
  next.log.push(`${fromPlayerId} propone un trueque de chef a ${toPlayerId}.`);
  return { ok: true, state: next };
}

export function acceptTrade(state: GameState, tradeId: string): ActionResult {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const trade = state.pendingTrades.find((t) => t.id === tradeId);
  if (!trade) return fail(state, "Oferta de trueque no encontrada.");

  const next = clone(state);
  const from = next.players.find((p) => p.id === trade.fromPlayerId)!;
  const to = next.players.find((p) => p.id === trade.toPlayerId)!;
  const tmp = from.chefId;
  from.chefId = to.chefId;
  to.chefId = tmp;
  next.pendingTrades = next.pendingTrades.filter((t) => t.id !== tradeId);
  next.log.push(`${from.name} y ${to.name} intercambian de chef.`);
  return { ok: true, state: next };
}

export function rejectTrade(state: GameState, tradeId: string): ActionResult {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const next = clone(state);
  next.pendingTrades = next.pendingTrades.filter((t) => t.id !== tradeId);
  return { ok: true, state: next };
}

export function finishTrading(state: GameState): ActionResult {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const next = clone(state);
  next.status = "scoring";
  next.pendingTrades = [];
  next.log.push("Trueque cerrado. Calculando puntuaciones...");
  return { ok: true, state: next };
}

export function finishScoring(state: GameState): ActionResult {
  if (state.status !== "scoring") return fail(state, "La partida no está en fase de puntuación.");
  const next = clone(state);
  const scores = scoreGame(next);
  next.winnerId = winnerOf(scores);
  const winnerName = next.players.find((p) => p.id === next.winnerId)?.name ?? "nadie";
  next.status = "finished";
  next.log.push(`Partida terminada. ¡Gana ${winnerName}!`);
  return { ok: true, state: next };
}
