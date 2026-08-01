import { describe, expect, test } from "vite-plus/test";
import type { PlayerState } from "../src/index.ts";
import {
  acceptTrade,
  buildMainDeck,
  createGame,
  currentPhase,
  currentPlayer,
  DEFAULT_CONFIG,
  discardAndDraw,
  drawChef,
  endTurn,
  finishScoring,
  finishTrading,
  isIngredientPlayable,
  playCondiment,
  playIngredient,
  proposeTrade,
  scorePlayer,
} from "../src/index.ts";

function makeGame(seed = "test-seed") {
  return createGame(
    [
      { id: "p1", name: "Ana" },
      { id: "p2", name: "Beto" },
    ],
    { seed },
  );
}

describe("scoring", () => {
  test("aplica capas de abajo hacia arriba y multiplicadores sobre el acumulado", () => {
    const player: PlayerState = {
      id: "p1",
      name: "Ana",
      isBot: false,
      hand: [],
      ready: false,
      lasagna: [
        { cardId: "a", cardName: "Pollo", origin: "own", op: "add", value: 3 },
        { cardId: "b", cardName: "Sal", origin: "own", op: "add", value: 2 },
        { cardId: "c", cardName: "Azúcar rival", origin: "opponent", op: "multiply", value: 0.5 },
      ],
    };
    const result = scorePlayer(player);
    // (0 + 3 + 2) * 0.5 = 2.5
    expect(result.total).toBe(2.5);
    expect(result.steps).toHaveLength(3);
  });

  test("aplica el efecto del chef al final", () => {
    const player: PlayerState = {
      id: "p1",
      name: "Ana",
      isBot: false,
      hand: [],
      ready: false,
      chefId: "chef_pol",
      lasagna: [{ cardId: "a", cardName: "Pollo", origin: "own", op: "add", value: 4 }],
    };
    const result = scorePlayer(player);
    expect(result.total).toBe(5); // 4 * 1.25
    expect(result.chefStep?.label).toBe("Pol");
  });
});

describe("legalidad de fases", () => {
  test("solo se puede jugar el ingrediente de la fase actual", () => {
    const state = makeGame();
    expect(currentPhase(state)).toBe("relleno");
    const player = currentPlayer(state);
    const bechamelCard = player.hand.find((id) => id.startsWith("bechamel_"));
    if (bechamelCard) {
      expect(isIngredientPlayable(state, bechamelCard)).toBe(false);
      const result = playIngredient(state, player.id, bechamelCard);
      expect(result.ok).toBe(false);
    }
  });
});

describe("descartar y robar", () => {
  test("descarta una carta y roba una nueva sin terminar el turno", () => {
    const state = makeGame();
    const player = currentPlayer(state);
    const cardToDiscard = player.hand[0]!;
    const result = discardAndDraw(state, player.id, cardToDiscard);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const updatedPlayer = currentPlayer(result.state);
      expect(updatedPlayer.hand).not.toContain(cardToDiscard);
      expect(updatedPlayer.hand).toHaveLength(player.hand.length);
      expect(result.state.hasDiscardedThisTurn).toBe(true);
    }
  });
});

describe("cartas duplicadas en la mano", () => {
  test("jugar un ingrediente solo retira una copia, no todas las duplicadas", () => {
    const state = makeGame();
    const player = currentPlayer(state);
    player.hand = ["relleno_chicken", "relleno_chicken", "cond_salt"];
    const result = playIngredient(state, player.id, "relleno_chicken");
    expect(result.ok).toBe(true);
    if (result.ok) {
      const updated = currentPlayer(result.state);
      expect(updated.hand).toEqual(["relleno_chicken", "cond_salt"]);
    }
  });

  test("descartar una copia duplicada conserva la otra copia en la mano", () => {
    const state = makeGame();
    const player = currentPlayer(state);
    player.hand = ["relleno_chicken", "relleno_chicken", "cond_salt"];
    const result = discardAndDraw(state, player.id, "relleno_chicken");
    expect(result.ok).toBe(true);
    if (result.ok) {
      const updated = currentPlayer(result.state);
      expect(updated.hand.filter((id) => id === "relleno_chicken")).toHaveLength(1);
      expect(updated.hand).toHaveLength(3);
    }
  });
});

describe("condimentos", () => {
  test("un condimento arrojable requiere un objetivo distinto del jugador", () => {
    const state = makeGame();
    const player = currentPlayer(state);
    player.hand.push("cond_thyme");
    expect(playCondiment(state, player.id, "cond_thyme").ok).toBe(false);
    expect(playCondiment(state, player.id, "cond_thyme", player.id).ok).toBe(false);
    const opponent = state.players.find((p) => p.id !== player.id)!;
    const result = playCondiment(state, player.id, "cond_thyme", opponent.id);
    expect(result.ok).toBe(true);
  });
});

describe("balance del mazo", () => {
  test("ofrece la misma cantidad de ingredientes para cada fase", () => {
    const deck = buildMainDeck();
    const count = (prefix: string) => deck.filter((cardId) => cardId.startsWith(prefix)).length;

    expect(count("relleno_")).toBe(21);
    expect(count("bechamel_")).toBe(21);
    expect(count("pasta_")).toBe(21);
    expect(DEFAULT_CONFIG.maxCondimentsPerTurn).toBe(2);
  });
});

describe("partida determinista completa", () => {
  test("la misma semilla produce siempre el mismo reparto inicial", () => {
    const a = makeGame("misma-semilla");
    const b = makeGame("misma-semilla");
    expect(a.players[0]!.hand).toEqual(b.players[0]!.hand);
    expect(a.deck).toEqual(b.deck);
  });

  test("chefs y trueque llevan la partida hasta el final", () => {
    let state = makeGame("final-completo");
    // Termina las 12 capas jugando lo que se pueda o pasando turno.
    let safety = 0;
    while (state.status === "playing" && safety < 500) {
      safety++;
      const player = currentPlayer(state);
      const playable = player.hand.find((id) => isIngredientPlayable(state, id));
      if (playable) {
        const result = playIngredient(state, player.id, playable);
        if (result.ok) state = result.state;
      }
      const ended = endTurn(state, currentPlayer(state).id);
      if (ended.ok) state = ended.state;
    }
    expect(state.status).toBe("chefDraw");

    for (const player of state.players) {
      const offer = drawChef(state, player.id);
      expect(offer.ok).toBe(true);
      if (!offer.ok) continue;
      state = offer.state;
      const choice = state.chefChoices[player.id]![0];
      const result = drawChef(state, player.id, choice);
      expect(result.ok).toBe(true);
      if (result.ok) state = result.state;
    }
    expect(state.status).toBe("trading");

    const propose = proposeTrade(state, state.players[0]!.id, state.players[1]!.id);
    expect(propose.ok).toBe(true);
    if (propose.ok) state = propose.state;
    const trade = state.pendingTrades[0]!;
    const accepted = acceptTrade(state, trade.id);
    expect(accepted.ok).toBe(true);
    if (accepted.ok) state = accepted.state;

    const traded = finishTrading(state);
    expect(traded.ok).toBe(true);
    if (traded.ok) state = traded.state;

    const scored = finishScoring(state);
    expect(scored.ok).toBe(true);
    if (scored.ok) state = scored.state;

    expect(state.status).toBe("finished");
    expect(state.winnerId).toBeDefined();
  });
});
