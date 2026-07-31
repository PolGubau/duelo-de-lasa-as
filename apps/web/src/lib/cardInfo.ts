import type { Card, CondimentEffect } from "@lasana/engine";

export interface CardInfo {
  /** Etiqueta corta del tipo de carta (p.ej. "Ingrediente · Pasta"). */
  typeLabel: string;
  /** Estadísticas breves para mostrar como chips (sabor, valor, uso…). */
  statLines: string[];
  /** Explicación en lenguaje llano de qué hace la carta al jugarla. */
  description: string;
}

const SUBTYPE_LABELS: Record<string, string> = {
  relleno: "Relleno",
  bechamel: "Bechamel",
  pasta: "Pasta",
};

const FLAVOR_LABELS: Record<string, string> = {
  salado: "Salado",
  dulce: "Dulce",
  herbal: "Herbal",
  picante: "Picante",
  neutro: "Neutro",
};

function effectText(effect: CondimentEffect): string {
  if (effect.op === "add") {
    return effect.value >= 0
      ? `suma ${effect.value} puntos`
      : `resta ${Math.abs(effect.value)} puntos`;
  }
  return `multiplica el total ×${effect.factor}`;
}

/** Genera una descripción legible de las estadísticas y el efecto de una carta. */
export function describeCard(card: Card): CardInfo {
  if (card.kind === "ingredient") {
    const subtypeLabel = SUBTYPE_LABELS[card.subtype] ?? card.subtype;
    const valueText =
      card.value >= 0
        ? `Suma ${card.value} puntos a tu lasaña.`
        : `Resta ${Math.abs(card.value)} puntos a tu lasaña.`;
    return {
      typeLabel: `Ingrediente · ${subtypeLabel}`,
      statLines: [
        `Sabor: ${FLAVOR_LABELS[card.flavor] ?? card.flavor}`,
        `Valor: ${card.value >= 0 ? "+" : ""}${card.value}`,
      ],
      description: `Solo se puede colocar en la fase de ${subtypeLabel.toLowerCase()}. ${valueText}`,
    };
  }

  if (card.kind === "condiment") {
    const modeLabel =
      card.mode === "self"
        ? "Solo en tu propia lasaña"
        : card.mode === "throw"
          ? "Solo se puede lanzar a un rival"
          : "En tu lasaña o lanzándolo a un rival";
    const parts: string[] = [];
    if (card.selfEffect) parts.push(`Usado en tu lasaña: ${effectText(card.selfEffect)}.`);
    if (card.throwEffect) parts.push(`Lanzado a un rival: ${effectText(card.throwEffect)}.`);
    return {
      typeLabel: "Condimento",
      statLines: [`Sabor: ${FLAVOR_LABELS[card.flavor] ?? card.flavor}`, `Uso: ${modeLabel}`],
      description: parts.join(" "),
    };
  }

  return {
    typeLabel: "Chef",
    statLines: [],
    description: `${card.description} Se revela y aplica al calcular la puntuación final.`,
  };
}
