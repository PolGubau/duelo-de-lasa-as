var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../packages/engine/dist/index.mjs
var INGREDIENTS = [
  {
    kind: "ingredient",
    id: "relleno_chicken",
    subtype: "relleno",
    name: "Pollo",
    value: 3,
    flavor: "neutro",
    image: "card_fill_chicken.png"
  },
  {
    kind: "ingredient",
    id: "relleno_tomato_sauce",
    subtype: "relleno",
    name: "Salsa de Tomate",
    value: 2,
    flavor: "salado",
    image: "card_fill_tomato_sauce.png"
  },
  {
    kind: "ingredient",
    id: "relleno_mercadona",
    subtype: "relleno",
    name: "Relleno del Mercadona",
    value: 1,
    flavor: "neutro",
    image: "card_fill_mercadona.png"
  },
  {
    kind: "ingredient",
    id: "relleno_spinach",
    subtype: "relleno",
    name: "Espinacas",
    value: 2,
    flavor: "herbal",
    image: "card_fill_spinach.png"
  },
  {
    kind: "ingredient",
    id: "relleno_zucchini",
    subtype: "relleno",
    name: "Calabac\xEDn",
    value: 2,
    flavor: "neutro",
    image: "card_fill_zucchini.png"
  },
  {
    kind: "ingredient",
    id: "relleno_tuna",
    subtype: "relleno",
    name: "At\xFAn",
    value: 3,
    flavor: "salado",
    image: "card_fill_tuna.png"
  },
  {
    kind: "ingredient",
    id: "relleno_fried_tomato",
    subtype: "relleno",
    name: "Tomate Frito",
    value: 3,
    flavor: "dulce",
    image: "card_fill_fried_tomato.png"
  },
  {
    kind: "ingredient",
    id: "bechamel_smooth",
    subtype: "bechamel",
    name: "Bechamel Sin Grumos",
    value: 3,
    flavor: "neutro",
    image: "card_bechamel_smooth.png"
  },
  {
    kind: "ingredient",
    id: "bechamel_lumpy",
    subtype: "bechamel",
    name: "Bechamel Con Grumos",
    value: 1,
    flavor: "neutro",
    image: "card_bechamel_lumpy.png"
  },
  {
    kind: "ingredient",
    id: "bechamel_burnt",
    subtype: "bechamel",
    name: "Bechamel Quemada",
    value: -2,
    flavor: "neutro",
    image: "card_bechamel_burnt.png"
  },
  {
    kind: "ingredient",
    id: "pasta_fresh",
    subtype: "pasta",
    name: "Pasta Fresca",
    value: 3,
    flavor: "neutro",
    image: "card_pasta_fresh.png"
  },
  {
    kind: "ingredient",
    id: "pasta_bought",
    subtype: "pasta",
    name: "Pasta Comprada",
    value: 1,
    flavor: "neutro",
    image: "card_pasta_bought.png"
  },
  {
    kind: "ingredient",
    id: "pasta_tortilla",
    subtype: "pasta",
    name: "Tortilla de Ma\xEDz",
    value: 2,
    flavor: "picante",
    image: "card_pasta_tortilla.png"
  }
];
var CONDIMENTS = [
  {
    kind: "condiment",
    id: "cond_salt",
    name: "Sal",
    mode: "self",
    flavor: "salado",
    selfEffect: {
      op: "add",
      value: 1
    },
    image: "card_cond_salt.png"
  },
  {
    kind: "condiment",
    id: "cond_rosemary",
    name: "Romero",
    mode: "self",
    flavor: "herbal",
    selfEffect: {
      op: "add",
      value: 1
    },
    image: "card_cond_rosemary.png"
  },
  {
    kind: "condiment",
    id: "cond_basil",
    name: "Albahaca",
    mode: "self",
    flavor: "herbal",
    selfEffect: {
      op: "add",
      value: 1
    },
    image: "card_cond_basil.png"
  },
  {
    kind: "condiment",
    id: "cond_oregano",
    name: "Or\xE9gano",
    mode: "self",
    flavor: "herbal",
    selfEffect: {
      op: "add",
      value: 2
    },
    image: "card_cond_oregano.png"
  },
  {
    kind: "condiment",
    id: "cond_sugar",
    name: "Az\xFAcar",
    mode: "dual",
    flavor: "dulce",
    selfEffect: {
      op: "add",
      value: 2
    },
    throwEffect: {
      op: "multiply",
      factor: 0.5
    },
    image: "card_cond_sugar.png"
  },
  {
    kind: "condiment",
    id: "cond_thyme",
    name: "Tomillo",
    mode: "throw",
    flavor: "herbal",
    throwEffect: {
      op: "add",
      value: -2
    },
    image: "card_cond_thyme.png"
  },
  {
    kind: "condiment",
    id: "cond_cinnamon",
    name: "Canela",
    mode: "throw",
    flavor: "dulce",
    throwEffect: {
      op: "multiply",
      factor: 0.8
    },
    image: "card_cond_cinnamon.png"
  },
  {
    kind: "condiment",
    id: "cond_turmeric",
    name: "C\xFArcuma",
    mode: "throw",
    flavor: "picante",
    throwEffect: {
      op: "add",
      value: -3
    },
    image: "card_cond_turmeric.png"
  }
];
var CHEFS = [
  {
    kind: "chef",
    id: "chef_pol",
    name: "Pol",
    description: "Multiplica tu puntuaci\xF3n total \xD71.25.",
    effect: {
      kind: "multiplyTotal",
      factor: 1.25
    },
    image: "card_chef_pol.png"
  },
  {
    kind: "chef",
    id: "chef_ylenia",
    name: "Ylenia",
    description: "Suma 5 puntos fijos al final.",
    effect: {
      kind: "addFlat",
      value: 5
    },
    image: "card_chef_ylenia.png"
  },
  {
    kind: "chef",
    id: "chef_sara",
    name: "Sara",
    description: "Multiplica tu puntuaci\xF3n total \xD71.1.",
    effect: {
      kind: "multiplyTotal",
      factor: 1.1
    },
    image: "card_chef_sara.png"
  },
  {
    kind: "chef",
    id: "chef_victor",
    name: "V\xEDctor",
    description: "Suma 2 puntos por cada capa de pasta.",
    effect: {
      kind: "addPerLayerType",
      subtype: "pasta",
      value: 2
    },
    image: "card_chef_victor.png"
  },
  {
    kind: "chef",
    id: "chef_dama",
    name: "Dama",
    description: "Suma 1 punto por cada condimento que jugaste.",
    effect: {
      kind: "addPerCondimentPlayed",
      value: 1
    },
    image: "card_chef_dama.png"
  },
  {
    kind: "chef",
    id: "chef_joan",
    name: "Joan",
    description: "Suma 2 puntos por cada capa de bechamel.",
    effect: {
      kind: "addPerLayerType",
      subtype: "bechamel",
      value: 2
    },
    image: "card_chef_joan.png"
  },
  {
    kind: "chef",
    id: "chef_lidia",
    name: "Lidia",
    description: "Multiplica tu puntuaci\xF3n total \xD71.15.",
    effect: {
      kind: "multiplyTotal",
      factor: 1.15
    },
    image: "card_chef_lidia.png"
  }
];
var ALL_CARDS = [
  ...INGREDIENTS,
  ...CONDIMENTS,
  ...CHEFS
];
var CARD_BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));
function getCard(id) {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`Carta desconocida: ${id}`);
  return card;
}
__name(getCard, "getCard");
function getIngredient(id) {
  const card = getCard(id);
  if (card.kind !== "ingredient") throw new Error(`${id} no es un ingrediente`);
  return card;
}
__name(getIngredient, "getIngredient");
function getCondiment(id) {
  const card = getCard(id);
  if (card.kind !== "condiment") throw new Error(`${id} no es un condimento`);
  return card;
}
__name(getCondiment, "getCondiment");
function getChef(id) {
  const card = getCard(id);
  if (card.kind !== "chef") throw new Error(`${id} no es un chef`);
  return card;
}
__name(getChef, "getChef");
function buildMainDeck() {
  const deck = [];
  for (const card of INGREDIENTS) for (let i = 0; i < 6; i++) deck.push(card.id);
  for (const card of CONDIMENTS) for (let i = 0; i < 4; i++) deck.push(card.id);
  return deck;
}
__name(buildMainDeck, "buildMainDeck");
function buildChefDeck() {
  return CHEFS.map((c) => c.id);
}
__name(buildChefDeck, "buildChefDeck");
function mulberry32(state) {
  let t = state + 1831565813 | 0;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t = t + Math.imul(t ^ t >>> 7, t | 61) ^ t;
  const value = ((t ^ t >>> 14) >>> 0) / 4294967296;
  return [t >>> 0, value];
}
__name(mulberry32, "mulberry32");
function seedFromString(input) {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return (h ^ h >>> 16) >>> 0;
}
__name(seedFromString, "seedFromString");
function randomInt(state, max) {
  const [nextState, value] = mulberry32(state);
  return [nextState, Math.floor(value * max)];
}
__name(randomInt, "randomInt");
function shuffle(state, items) {
  const result = [...items];
  let currentState = state;
  for (let i = result.length - 1; i > 0; i--) {
    const [nextState, j] = randomInt(currentState, i + 1);
    currentState = nextState;
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return [currentState, result];
}
__name(shuffle, "shuffle");
function scorePlayer(player) {
  const steps = [];
  let acc = 0;
  for (const layer of player.lasagna) {
    const before = acc;
    const after = layer.op === "add" ? acc + layer.value : acc * layer.value;
    steps.push({
      label: `${layer.cardName}${layer.origin === "opponent" ? " (rival)" : ""}`,
      op: layer.op,
      value: layer.value,
      before,
      after
    });
    acc = after;
  }
  let chefStep;
  if (player.chefId) {
    const chef = getChef(player.chefId);
    const before = acc;
    switch (chef.effect.kind) {
      case "multiplyTotal":
        acc = before * chef.effect.factor;
        chefStep = {
          label: chef.name,
          op: "multiply",
          value: chef.effect.factor,
          before,
          after: acc
        };
        break;
      case "addFlat":
        acc = before + chef.effect.value;
        chefStep = {
          label: chef.name,
          op: "add",
          value: chef.effect.value,
          before,
          after: acc
        };
        break;
      case "addPerLayerType": {
        const { subtype, value } = chef.effect;
        const bonus = player.lasagna.filter((l) => l.origin === "own" && l.subtype === subtype).length * value;
        acc = before + bonus;
        chefStep = {
          label: chef.name,
          op: "add",
          value: bonus,
          before,
          after: acc
        };
        break;
      }
      case "addPerCondimentPlayed": {
        const bonus = player.lasagna.filter((l) => l.origin === "own" && l.subtype === void 0).length * chef.effect.value;
        acc = before + bonus;
        chefStep = {
          label: chef.name,
          op: "add",
          value: bonus,
          before,
          after: acc
        };
        break;
      }
    }
  }
  return {
    playerId: player.id,
    steps,
    chefStep,
    total: acc
  };
}
__name(scorePlayer, "scorePlayer");
function scoreGame(state) {
  return state.players.map(scorePlayer);
}
__name(scoreGame, "scoreGame");
function winnerOf(scores) {
  if (scores.length === 0) return void 0;
  return scores.reduce((best, s) => s.total > best.total ? s : best, scores[0]).playerId;
}
__name(winnerOf, "winnerOf");
var PHASE_ORDER = [
  "relleno",
  "bechamel",
  "pasta"
];
var DEFAULT_CONFIG = {
  layersPerGame: 12,
  roundsCount: 4,
  handSize: 4,
  drawToHandSize: 4,
  maxCondimentsPerTurn: 4,
  visibility: "public"
};
function createGame(players, options) {
  if (players.length < 2) throw new Error("Se necesitan al menos 2 jugadores");
  const config = {
    ...DEFAULT_CONFIG,
    ...options?.config
  };
  let rngState = typeof options?.seed === "string" ? seedFromString(options.seed) : options?.seed ?? Date.now() >>> 0;
  let deck;
  [rngState, deck] = shuffle(rngState, buildMainDeck());
  let chefDeck;
  [rngState, chefDeck] = shuffle(rngState, buildChefDeck());
  const playerStates = players.map((p) => ({
    id: p.id,
    name: p.name,
    isBot: p.isBot ?? false,
    hand: [],
    lasagna: [],
    ready: false
  }));
  for (const player of playerStates) for (let i = 0; i < config.handSize; i++) {
    const card = deck.pop();
    if (card) player.hand.push(card);
  }
  return {
    config,
    seed: rngState,
    rngState,
    players: playerStates,
    deck,
    discard: [],
    chefDeck,
    round: 1,
    phaseIndex: 0,
    turnPlayerIndex: 0,
    hasDiscardedThisTurn: false,
    hasPlayedIngredientThisTurn: false,
    condimentsPlayedThisTurn: 0,
    status: "playing",
    pendingTrades: [],
    log: [`Partida iniciada con ${playerStates.length} jugadores.`]
  };
}
__name(createGame, "createGame");
function currentPhase(state) {
  return PHASE_ORDER[state.phaseIndex];
}
__name(currentPhase, "currentPhase");
function currentPlayer(state) {
  return state.players[state.turnPlayerIndex];
}
__name(currentPlayer, "currentPlayer");
function clone(state) {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      lasagna: [...p.lasagna]
    })),
    deck: [...state.deck],
    discard: [...state.discard],
    chefDeck: [...state.chefDeck],
    pendingTrades: [...state.pendingTrades],
    log: [...state.log]
  };
}
__name(clone, "clone");
function fail(state, reason) {
  return {
    ok: false,
    state,
    reason
  };
}
__name(fail, "fail");
function removeOne(list, item) {
  const idx = list.indexOf(item);
  if (idx === -1) return list;
  const copy = [...list];
  copy.splice(idx, 1);
  return copy;
}
__name(removeOne, "removeOne");
function drawOne(state) {
  const next = clone(state);
  if (next.deck.length === 0 && next.discard.length > 0) {
    let shuffled;
    [next.rngState, shuffled] = shuffle(next.rngState, next.discard);
    next.deck = shuffled;
    next.discard = [];
    next.log.push("Se recicl\xF3 la pila de descarte en el mazo.");
  }
  return {
    state: next,
    card: next.deck.pop()
  };
}
__name(drawOne, "drawOne");
function isIngredientPlayable(state, cardId) {
  const card = getCard(cardId);
  return card.kind === "ingredient" && card.subtype === currentPhase(state);
}
__name(isIngredientPlayable, "isIngredientPlayable");
function playIngredient(state, playerId, cardId) {
  if (state.status !== "playing") return fail(state, "La partida no est\xE1 en fase de construcci\xF3n.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.hasPlayedIngredientThisTurn) return fail(state, "Ya has jugado un ingrediente este turno.");
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");
  if (!isIngredientPlayable(state, cardId)) return fail(state, `Esa carta no corresponde a la fase actual (${currentPhase(state)}).`);
  const card = getIngredient(cardId);
  const next = clone(state);
  const actor = next.players[next.turnPlayerIndex];
  actor.hand = removeOne(actor.hand, cardId);
  actor.lasagna.push({
    cardId,
    cardName: card.name,
    subtype: card.subtype,
    origin: "own",
    op: "add",
    value: card.value
  });
  next.hasPlayedIngredientThisTurn = true;
  next.log.push(`${actor.name} juega ${card.name} (${card.subtype}).`);
  return {
    ok: true,
    state: next
  };
}
__name(playIngredient, "playIngredient");
function discardAndDraw(state, playerId, cardId) {
  if (state.status !== "playing") return fail(state, "La partida no est\xE1 en fase de construcci\xF3n.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.hasDiscardedThisTurn) return fail(state, "Ya has descartado este turno.");
  if (state.hasPlayedIngredientThisTurn) return fail(state, "Ya has jugado un ingrediente este turno.");
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");
  let next = clone(state);
  const idx = next.turnPlayerIndex;
  const actorName = next.players[idx].name;
  next.players[idx].hand = removeOne(next.players[idx].hand, cardId);
  next.discard.push(cardId);
  const drawn = drawOne(next);
  next = drawn.state;
  if (drawn.card) next.players[idx].hand.push(drawn.card);
  next.hasDiscardedThisTurn = true;
  next.log.push(`${actorName} descarta y roba una carta.`);
  return {
    ok: true,
    state: next
  };
}
__name(discardAndDraw, "discardAndDraw");
function playCondiment(state, playerId, cardId, targetPlayerId) {
  if (state.status !== "playing") return fail(state, "La partida no est\xE1 en fase de construcci\xF3n.");
  const player = currentPlayer(state);
  if (player.id !== playerId) return fail(state, "No es tu turno.");
  if (state.condimentsPlayedThisTurn >= state.config.maxCondimentsPerTurn) return fail(state, "Ya has jugado el m\xE1ximo de condimentos este turno.");
  if (!player.hand.includes(cardId)) return fail(state, "No tienes esa carta en la mano.");
  const card = getCondiment(cardId);
  const isThrow = card.mode === "throw" || card.mode === "dual" && targetPlayerId !== void 0;
  if (isThrow && (!targetPlayerId || targetPlayerId === playerId)) return fail(state, "Selecciona un rival al que lanzar este condimento.");
  if (!isThrow && targetPlayerId && targetPlayerId !== playerId) return fail(state, "Ese condimento solo puede aplicarse a tu propia lasa\xF1a.");
  const effect = isThrow ? card.throwEffect : card.selfEffect;
  if (!effect) return fail(state, "Ese condimento no tiene efecto en ese modo.");
  const finalTargetId = isThrow ? targetPlayerId : playerId;
  if (!state.players.some((p) => p.id === finalTargetId)) return fail(state, "Jugador objetivo inv\xE1lido.");
  const next = clone(state);
  const actor = next.players.find((p) => p.id === playerId);
  actor.hand = removeOne(actor.hand, cardId);
  const target = next.players.find((p) => p.id === finalTargetId);
  target.lasagna.push({
    cardId,
    cardName: card.name,
    origin: isThrow ? "opponent" : "own",
    op: effect.op,
    value: effect.op === "add" ? effect.value : effect.factor
  });
  next.condimentsPlayedThisTurn += 1;
  next.log.push(isThrow ? `${actor.name} arroja ${card.name} a la lasa\xF1a de ${target.name}.` : `${actor.name} a\xF1ade ${card.name} a su lasa\xF1a.`);
  return {
    ok: true,
    state: next
  };
}
__name(playCondiment, "playCondiment");
function advanceTurn(state) {
  state.turnPlayerIndex += 1;
  if (state.turnPlayerIndex >= state.players.length) {
    state.turnPlayerIndex = 0;
    state.phaseIndex += 1;
    if (state.phaseIndex >= PHASE_ORDER.length) {
      state.phaseIndex = 0;
      state.round += 1;
      if (state.round > state.config.roundsCount) {
        state.status = "chefDraw";
        state.log.push("Construcci\xF3n terminada. Momento de repartir Chefs.");
      }
    }
  }
}
__name(advanceTurn, "advanceTurn");
function endTurn(state, playerId) {
  if (state.status !== "playing") return fail(state, "La partida no est\xE1 en fase de construcci\xF3n.");
  if (currentPlayer(state).id !== playerId) return fail(state, "No es tu turno.");
  let next = clone(state);
  const idx = next.turnPlayerIndex;
  while (next.players[idx].hand.length < next.config.drawToHandSize) {
    const drawn = drawOne(next);
    next = drawn.state;
    if (!drawn.card) break;
    next.players[idx].hand.push(drawn.card);
  }
  const actorName = next.players[idx].name;
  next.hasDiscardedThisTurn = false;
  next.hasPlayedIngredientThisTurn = false;
  next.condimentsPlayedThisTurn = 0;
  next.log.push(`${actorName} termina su turno.`);
  advanceTurn(next);
  return {
    ok: true,
    state: next
  };
}
__name(endTurn, "endTurn");
function drawChef(state, playerId) {
  if (state.status !== "chefDraw") return fail(state, "No es momento de repartir chefs.");
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return fail(state, "Jugador desconocido.");
  if (player.chefId) return fail(state, "Ya tienes un chef asignado.");
  if (state.chefDeck.length === 0) return fail(state, "No quedan chefs por repartir.");
  const next = clone(state);
  const [rngState, index] = randomInt(next.rngState, next.chefDeck.length);
  next.rngState = rngState;
  const chefId = next.chefDeck.splice(index, 1)[0];
  const actor = next.players.find((p) => p.id === playerId);
  actor.chefId = chefId;
  next.log.push(`${actor.name} recibe al chef ${getChef(chefId).name}.`);
  if (next.players.every((p) => p.chefId)) {
    next.status = "trading";
    next.log.push("Todos tienen chef. Se abre la fase de trueque.");
  }
  return {
    ok: true,
    state: next
  };
}
__name(drawChef, "drawChef");
function proposeTrade(state, fromPlayerId, toPlayerId) {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  if (fromPlayerId === toPlayerId) return fail(state, "No puedes proponerte un trueque a ti mismo.");
  if (!state.players.some((p) => p.id === fromPlayerId) || !state.players.some((p) => p.id === toPlayerId)) return fail(state, "Jugador desconocido.");
  const next = clone(state);
  const id = `trade_${next.pendingTrades.length}_${fromPlayerId}_${toPlayerId}`;
  next.pendingTrades.push({
    id,
    fromPlayerId,
    toPlayerId,
    status: "pending"
  });
  next.log.push(`${fromPlayerId} propone un trueque de chef a ${toPlayerId}.`);
  return {
    ok: true,
    state: next
  };
}
__name(proposeTrade, "proposeTrade");
function acceptTrade(state, tradeId) {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const trade = state.pendingTrades.find((t) => t.id === tradeId);
  if (!trade) return fail(state, "Oferta de trueque no encontrada.");
  const next = clone(state);
  const from = next.players.find((p) => p.id === trade.fromPlayerId);
  const to = next.players.find((p) => p.id === trade.toPlayerId);
  const tmp = from.chefId;
  from.chefId = to.chefId;
  to.chefId = tmp;
  next.pendingTrades = next.pendingTrades.filter((t) => t.id !== tradeId);
  next.log.push(`${from.name} y ${to.name} intercambian de chef.`);
  return {
    ok: true,
    state: next
  };
}
__name(acceptTrade, "acceptTrade");
function rejectTrade(state, tradeId) {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const next = clone(state);
  next.pendingTrades = next.pendingTrades.filter((t) => t.id !== tradeId);
  return {
    ok: true,
    state: next
  };
}
__name(rejectTrade, "rejectTrade");
function finishTrading(state) {
  if (state.status !== "trading") return fail(state, "No es momento de negociar chefs.");
  const next = clone(state);
  next.status = "scoring";
  next.pendingTrades = [];
  next.log.push("Trueque cerrado. Calculando puntuaciones...");
  return {
    ok: true,
    state: next
  };
}
__name(finishTrading, "finishTrading");
function finishScoring(state) {
  if (state.status !== "scoring") return fail(state, "La partida no est\xE1 en fase de puntuaci\xF3n.");
  const next = clone(state);
  next.winnerId = winnerOf(scoreGame(next));
  const winnerName = next.players.find((p) => p.id === next.winnerId)?.name ?? "nadie";
  next.status = "finished";
  next.log.push(`Partida terminada. \xA1Gana ${winnerName}!`);
  return {
    ok: true,
    state: next
  };
}
__name(finishScoring, "finishScoring");

// src/index.ts
import { DurableObject } from "cloudflare:workers";

// ../../packages/protocol/src/index.ts
var PROTOCOL_VERSION = 2;
var HIDDEN_LAYER_ID = "hidden_layer";
var CHAT_EMOJIS = ["\u{1F35D}", "\u{1F9C0}", "\u{1F345}", "\u{1F525}", "\u{1F602}", "\u{1F631}", "\u{1F44F}", "\u{1F90C}"];
function parseVisibility(value) {
  return value === "public" || value === "secret" ? value : null;
}
__name(parseVisibility, "parseVisibility");
function parseClientMessage(value) {
  if (!value || typeof value !== "object") return null;
  const message = value;
  if (typeof message.type !== "string") return null;
  if (message.type === "join") {
    if (typeof message.name !== "string" || !message.name.trim()) return null;
    return {
      type: "join",
      protocolVersion: Number(message.protocolVersion),
      name: message.name.trim(),
      sessionId: typeof message.sessionId === "string" ? message.sessionId : void 0
    };
  }
  if (message.type === "ready") return { type: "ready", ready: Boolean(message.ready) };
  if (message.type === "options") {
    const options = message.options;
    const visibility = parseVisibility(options?.visibility);
    if (!visibility) return null;
    return { type: "options", options: { visibility } };
  }
  if (message.type === "chat") {
    const emoji = CHAT_EMOJIS.find((item) => item === message.emoji);
    if (!emoji) return null;
    return { type: "chat", emoji };
  }
  if (message.type === "start") return { type: "start" };
  if (message.type === "leave") return { type: "leave" };
  if (message.type === "action") {
    const allowed = [
      "playIngredient",
      "discardAndDraw",
      "playCondiment",
      "endTurn",
      "drawChef",
      "proposeTrade",
      "acceptTrade",
      "rejectTrade",
      "finishTrading",
      "finishScoring"
    ];
    if (typeof message.action !== "string" || !allowed.includes(message.action)) return null;
    return {
      type: "action",
      action: message.action,
      cardId: typeof message.cardId === "string" ? message.cardId : void 0,
      targetPlayerId: typeof message.targetPlayerId === "string" ? message.targetPlayerId : void 0,
      tradeId: typeof message.tradeId === "string" ? message.tradeId : void 0
    };
  }
  return null;
}
__name(parseClientMessage, "parseClientMessage");

// src/index.ts
var CODE = /^[A-Z0-9]{4}$/;
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([A-Z0-9]{4})$/i);
    if (!match) return new Response("Usa /room/ABCD", { status: 404 });
    const code = match[1].toUpperCase();
    if (!CODE.test(code)) return new Response("C\xF3digo de sala inv\xE1lido", { status: 400 });
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
      return new Response("WebSocket requerido", { status: 426 });
    return env.LASANA_ROOMS.get(env.LASANA_ROOMS.idFromName(code)).fetch(request);
  }
};
var HIDDEN_LAYER = {
  cardId: HIDDEN_LAYER_ID,
  cardName: "Capa oculta",
  origin: "own",
  op: "add",
  value: 0
};
var LasanaRoom = class extends DurableObject {
  static {
    __name(this, "LasanaRoom");
  }
  code = "ROOM";
  players = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  state = null;
  options = { visibility: "public" };
  loaded = false;
  async ensureLoaded() {
    if (this.loaded) return;
    const saved = await this.ctx.storage.get("room");
    if (saved) {
      this.code = saved.code;
      this.players = new Map(
        saved.players.map((player) => [player.id, player])
      );
      this.state = saved.state;
      if (saved.options) this.options = saved.options;
    }
    this.loaded = true;
  }
  async persist() {
    await this.ctx.storage.put("room", {
      code: this.code,
      players: [...this.players.values()],
      state: this.state,
      options: this.options
    });
  }
  async fetch(request) {
    await this.ensureLoaded();
    const url = new URL(request.url);
    this.code = url.pathname.split("/").pop()?.toUpperCase() ?? this.code;
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, raw) {
    await this.ensureLoaded();
    let payload = null;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }
    const message = parseClientMessage(payload);
    if (!message) return this.send(ws, { type: "error", message: "Mensaje inv\xE1lido." });
    if (message.type === "join") return this.join(ws, message);
    const session = this.sessions.get(ws);
    if (!session)
      return this.send(ws, { type: "error", message: "Primero debes unirte a la sala." });
    if (message.type === "ready") return this.setReady(session.playerId, message.ready);
    if (message.type === "options") return this.setOptions(session.playerId, message.options);
    if (message.type === "chat") return this.chat(session.playerId, message.emoji);
    if (message.type === "start") return this.start(session.playerId);
    if (message.type === "leave") return this.leave(ws);
    this.action(session.playerId, message);
  }
  async webSocketClose(ws) {
    await this.ensureLoaded();
    await this.leave(ws);
  }
  join(ws, message) {
    if (message.protocolVersion !== PROTOCOL_VERSION)
      return this.send(ws, { type: "error", message: "Versi\xF3n incompatible. Actualiza la app." });
    if (this.state && !message.sessionId)
      return this.send(ws, { type: "error", message: "La partida ya ha empezado." });
    if (this.players.size >= 6 && !message.sessionId)
      return this.send(ws, { type: "error", message: "La sala est\xE1 llena." });
    const existing = message.sessionId ? this.players.get(message.sessionId) : void 0;
    const playerId = existing?.id ?? crypto.randomUUID();
    const player = existing ?? {
      id: playerId,
      name: message.name.slice(0, 24),
      isHost: this.players.size === 0,
      ready: false,
      connected: true
    };
    player.connected = true;
    this.players.set(playerId, player);
    this.sessions.set(ws, { playerId, ws });
    void this.persist();
    this.send(ws, { type: "joined", sessionId: playerId, room: this.snapshot() });
    this.broadcast({ type: "room", room: this.snapshot() });
  }
  setReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (!player || this.state) return;
    player.ready = ready;
    void this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }
  setOptions(playerId, options) {
    const host = this.players.get(playerId);
    if (!host?.isHost) return this.reject(playerId, "Solo el anfitri\xF3n puede cambiar las reglas.");
    if (this.state) return this.reject(playerId, "La partida ya ha empezado.");
    this.options = options;
    void this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }
  chat(playerId, emoji) {
    const player = this.players.get(playerId);
    if (!player) return;
    this.broadcast({
      type: "chat",
      entry: { playerId, name: player.name, emoji, at: Date.now() }
    });
  }
  start(playerId) {
    const host = this.players.get(playerId);
    if (!host?.isHost) return this.reject(playerId, "Solo el anfitri\xF3n puede empezar.");
    if (this.players.size < 2) return this.reject(playerId, "Necesitas al menos 2 jugadores.");
    if ([...this.players.values()].some((player) => !player.ready))
      return this.reject(playerId, "Todos los jugadores deben estar listos.");
    this.state = createGame(
      [...this.players.values()].map((player) => ({ id: player.id, name: player.name })),
      { seed: this.code, config: { visibility: this.options.visibility } }
    );
    void this.persist();
    this.broadcastState({ kind: "play", message: "\xA1La partida ha comenzado!", playerId });
  }
  action(playerId, message) {
    if (!this.state) return this.reject(playerId, "La partida todav\xEDa no ha empezado.");
    const state = this.state;
    if ((message.action === "acceptTrade" || message.action === "rejectTrade") && state.pendingTrades.find((trade) => trade.id === message.tradeId)?.toPlayerId !== playerId) {
      return this.reject(playerId, "Solo el destinatario puede responder a ese trueque.");
    }
    if ((message.action === "finishTrading" || message.action === "finishScoring") && playerId !== this.snapshot().hostId) {
      return this.reject(playerId, "Solo el anfitri\xF3n puede avanzar la partida.");
    }
    let result;
    switch (message.action) {
      case "playIngredient":
        result = playIngredient(state, playerId, message.cardId ?? "");
        break;
      case "discardAndDraw":
        result = discardAndDraw(state, playerId, message.cardId ?? "");
        break;
      case "playCondiment":
        result = playCondiment(state, playerId, message.cardId ?? "", message.targetPlayerId);
        break;
      case "endTurn":
        result = endTurn(state, playerId);
        break;
      case "drawChef":
        result = drawChef(state, playerId);
        break;
      case "proposeTrade":
        result = proposeTrade(state, playerId, message.targetPlayerId ?? "");
        break;
      case "acceptTrade":
        result = acceptTrade(state, message.tradeId ?? "");
        break;
      case "rejectTrade":
        result = rejectTrade(state, message.tradeId ?? "");
        break;
      case "finishTrading":
        result = finishTrading(state);
        break;
      case "finishScoring":
        result = finishScoring(state);
        break;
    }
    if (!result.ok) return this.reject(playerId, result.reason);
    this.state = result.state;
    void this.persist();
    const event = this.eventFor(message.action, playerId, message.cardId);
    this.broadcastState(event);
  }
  eventFor(action, playerId, cardId) {
    const cardName = cardId && this.state ? getCard(cardId).name : "";
    const map = {
      playIngredient: "play",
      discardAndDraw: "discard",
      playCondiment: "attack",
      endTurn: "turn",
      drawChef: "chef",
      proposeTrade: "trade",
      acceptTrade: "trade",
      rejectTrade: "trade",
      finishTrading: "score",
      finishScoring: "score"
    };
    return {
      kind: map[action],
      message: cardName ? `${cardName} resuelto` : "Acci\xF3n resuelta",
      playerId
    };
  }
  async leave(ws) {
    const session = this.sessions.get(ws);
    if (!session) return;
    this.sessions.delete(ws);
    const player = this.players.get(session.playerId);
    if (player) player.connected = false;
    await this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }
  snapshot() {
    return {
      code: this.code,
      hostId: [...this.players.values()].find((player) => player.isHost)?.id ?? "",
      status: this.state ? "playing" : "lobby",
      players: [...this.players.values()],
      options: this.options
    };
  }
  redact(playerId) {
    if (!this.state) throw new Error("No hay partida");
    const state = this.state;
    const hideLayers = state.config.visibility === "secret" && state.status !== "scoring" && state.status !== "finished";
    return {
      ...state,
      deck: [],
      discard: [],
      chefDeck: [],
      players: state.players.map(
        (player) => player.id === playerId ? { ...player, hand: [...player.hand] } : {
          ...player,
          hand: player.hand.map((_, index) => `hidden_${index}`),
          lasagna: hideLayers ? player.lasagna.map(() => HIDDEN_LAYER) : [...player.lasagna]
        }
      )
    };
  }
  broadcastState(event) {
    for (const session of this.sessions.values())
      this.send(session.ws, { type: "stateSync", state: this.redact(session.playerId), event });
  }
  reject(playerId, reason) {
    const session = [...this.sessions.values()].find((item) => item.playerId === playerId);
    if (session) this.send(session.ws, { type: "rejected", reason });
  }
  send(ws, message) {
    ws.send(JSON.stringify(message));
  }
  broadcast(message) {
    for (const session of this.sessions.values()) this.send(session.ws, message);
  }
};

// ../../node_modules/.pnpm/wrangler@4.116.0_@cloudflare+workers-types@5.20260730.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@4.116.0_@cloudflare+workers-types@5.20260730.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-HZf1AF/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.pnpm/wrangler@4.116.0_@cloudflare+workers-types@5.20260730.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-HZf1AF/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  LasanaRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
