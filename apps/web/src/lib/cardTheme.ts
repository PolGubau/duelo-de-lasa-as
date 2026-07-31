import type { Card } from "@lasana/engine";

export interface CardTheme {
  /** Degradado del fondo de la carta; las ilustraciones son PNG con transparencia. */
  background: string;
  /** Color del borde y de la placa inferior con el nombre. */
  frame: string;
  /** Color del texto sobre la placa. */
  ink: string;
  /** Etiqueta corta del tipo, en la esquina superior izquierda. */
  badge: string;
}

const FLAVOR_TINTS: Record<string, [string, string]> = {
  salado: ["#8ecae6", "#219ebc"],
  dulce: ["#ffc8dd", "#f072a9"],
  herbal: ["#b7e4c7", "#40916c"],
  picante: ["#ffb4a2", "#e5383b"],
  neutro: ["#ffe8c2", "#e9a23b"],
};

const SUBTYPE_TINTS: Record<string, [string, string]> = {
  relleno: ["#ffb4a2", "#c1121f"],
  bechamel: ["#fff5e1", "#d8b98a"],
  pasta: ["#ffe08a", "#e08c14"],
};

function gradient([from, to]: [string, string]): string {
  return `radial-gradient(circle at 50% 32%, ${from} 0%, ${to} 78%)`;
}

/** Paleta del marco de una carta, derivada de su tipo y sabor. */
export function cardTheme(card: Card): CardTheme {
  if (card.kind === "ingredient") {
    return {
      background: gradient(SUBTYPE_TINTS[card.subtype] ?? SUBTYPE_TINTS.relleno!),
      frame: "#4a2810",
      ink: "#fff6e5",
      badge: card.subtype,
    };
  }
  if (card.kind === "condiment") {
    return {
      background: gradient(FLAVOR_TINTS[card.flavor] ?? FLAVOR_TINTS.neutro!),
      frame: "#2c1a3d",
      ink: "#fff6e5",
      badge: card.mode === "throw" ? "arrojable" : card.mode === "dual" ? "doble" : "condimento",
    };
  }
  return {
    background: gradient(["#f2e9ff", "#7b2cbf"]),
    frame: "#2c1a3d",
    ink: "#fff6e5",
    badge: "chef",
  };
}
