import type { RoomSnapshot } from "../../../../packages/protocol/src/index.ts";
import { describe, expect, test } from "vite-plus/test";
import { disconnectedPlayerNames } from "./ConnectionBanner.tsx";

const room: RoomSnapshot = {
  code: "AB12",
  hostId: "ana",
  status: "playing",
  options: { visibility: "public" },
  players: [
    { id: "ana", name: "Ana", isHost: true, ready: true, connected: true },
    { id: "beto", name: "Beto", isHost: false, ready: true, connected: false },
    { id: "carmen", name: "Carmen", isHost: false, ready: true, connected: false },
  ],
};

describe("jugadores desconectados", () => {
  test("muestra solo a los rivales sin conexión", () => {
    expect(disconnectedPlayerNames(room, "ana")).toEqual(["Beto", "Carmen"]);
  });

  test("no muestra aviso si no hay sala", () => {
    expect(disconnectedPlayerNames(null, "ana")).toEqual([]);
  });
});