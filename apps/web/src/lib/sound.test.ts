import { describe, expect, test } from "vite-plus/test";
import { BACKGROUND_MUSIC_PHRASES } from "./sound.ts";

describe("arreglo de música de fondo", () => {
  test("combina cuatro frases completas de un tema en tonalidad menor", () => {
    expect(BACKGROUND_MUSIC_PHRASES).toHaveLength(4);
    expect(new Set(BACKGROUND_MUSIC_PHRASES.map((phrase) => phrase.melody.join(","))).size).toBe(4);
    expect(BACKGROUND_MUSIC_PHRASES.some((phrase) => phrase.chords.some((chord) => chord.includes(277.18)))).toBe(true);
    for (const phrase of BACKGROUND_MUSIC_PHRASES) {
      expect(phrase.bass).toHaveLength(16);
      expect(phrase.melody).toHaveLength(16);
      expect(phrase.chords).toHaveLength(4);
      expect(phrase.melody).toContain(null);
    }
  });
});
