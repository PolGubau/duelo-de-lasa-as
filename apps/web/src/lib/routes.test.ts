import { describe, expect, test } from "vite-plus/test";
import { isRoomCode, roomPath, routeFromLocation } from "./routes.ts";

describe("rutas de la aplicación", () => {
  test("normaliza el código de una sala en su ruta canónica", () => {
    expect(routeFromLocation("/sala/a2bz", "")).toEqual({
      kind: "room",
      code: "A2BZ",
      legacy: false,
    });
    expect(roomPath("a2bz")).toBe("/sala/A2BZ");
  });

  test("redirige invitaciones antiguas y rechaza códigos inválidos", () => {
    expect(routeFromLocation("/", "?sala=ab12")).toEqual({
      kind: "room",
      code: "AB12",
      legacy: true,
    });
    expect(routeFromLocation("/sala/abc", "")).toEqual({ kind: "notFound" });
    expect(isRoomCode("A!12")).toBe(false);
  });
});
