import { describe, expect, test } from "vite-plus/test";
import { BACKGROUND_MUSIC_PHRASES } from "./sound.ts";

describe("arreglo de música de fondo", () => {
  test("combina cuatro frases completas y melódicamente distintas", () => {
    expect(BACKGROUND_MUSIC_PHRASES).toHaveLength(4);
    expect(new Set(BACKGROUND_MUSIC_PHRASES.map((phrase) => phrase.melody.join(","))).size).toBe(4);
    for (const phrase of BACKGROUND_MUSIC_PHRASES) {
      expect(phrase.bass).toHaveLength(16);
      expect(phrase.melody).toHaveLength(16);
      expect(phrase.chords).toHaveLength(4);
      expect(phrase.melody).toContain(null);
    }
  });
});