import { CHEFS, createGame } from "@lasana/engine";
import { describe, expect, test } from "vite-plus/test";
import { chefForActionSplash, winnerForActionSplash } from "./ActionSplash.tsx";

describe("splash de chef", () => {
  test("muestra el chef asignado al jugador del evento", () => {
    const state = createGame(
      [
        { id: "p1", name: "Laia" },
        { id: "p2", name: "Pol" },
      ],
      {
        seed: "chef-splash",
      },
    );
    state.players[0]!.chefId = CHEFS[0]!.id;

    expect(chefForActionSplash(state, "chef", "p1")).toBe(CHEFS[0]);
    expect(chefForActionSplash(state, "chef", "p2")).toBeUndefined();
    expect(chefForActionSplash(state, "attack", "p1")).toBeUndefined();
  });
  test("revela ganador, chef y puntos al terminar la partida", () => {
    const state = createGame(
      [
        { id: "p1", name: "Laia" },
        { id: "p2", name: "Pol" },
      ],
      {
        seed: "winner-splash",
      },
    );
    state.status = "finished";
    state.winnerId = "p1";
    state.players[0]!.chefId = CHEFS[0]!.id;
    state.players[0]!.lasagna.push({
      cardId: "prueba",
      cardName: "Capa de prueba",
      origin: "own",
      op: "add",
      value: 4,
    });

    expect(winnerForActionSplash(state, "score")).toMatchObject({
      player: state.players[0],
      chef: CHEFS[0],
      score: 5,
    });
    expect(winnerForActionSplash(state, "chef")).toBeUndefined();
  });
});
