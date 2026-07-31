import type { LayerEvent } from "@lasana/engine";

/** Acumulado de la lasaña aplicando cada capa en el orden en que ocurrió. */
export function runningTotal(layers: LayerEvent[]): number {
  return layers.reduce((acc, l) => (l.op === "add" ? acc + l.value : acc * l.value), 0);
}

/** Presenta los puntos como enteros legibles sin afectar al cálculo real. */
export function formatScore(value: number): string {
  return Math.round(value).toLocaleString("es-ES");
}
