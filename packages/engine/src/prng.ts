// PRNG determinista (mulberry32). Prohibido Math.random() en el resto del engine.

/** Avanza el estado del PRNG y devuelve [nuevoEstado, valorEn0..1). */
export function mulberry32(state: number): [number, number] {
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [t >>> 0, value];
}

/** Deriva una semilla numérica a partir de un string (código de sala, por ejemplo). */
export function seedFromString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

/** Devuelve un entero aleatorio en [0, max) junto con el nuevo estado del PRNG. */
export function randomInt(state: number, max: number): [number, number] {
  const [nextState, value] = mulberry32(state);
  return [nextState, Math.floor(value * max)];
}

/** Fisher-Yates determinista. Devuelve el array barajado y el nuevo estado del PRNG. */
export function shuffle<T>(state: number, items: readonly T[]): [number, T[]] {
  const result = [...items];
  let currentState = state;
  for (let i = result.length - 1; i > 0; i--) {
    const [nextState, j] = randomInt(currentState, i + 1);
    currentState = nextState;
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return [currentState, result];
}
