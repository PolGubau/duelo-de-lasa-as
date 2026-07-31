import type { Card } from "@lasana/engine";

/** Resuelve la ruta pública de la imagen de una carta según su tipo. */
export function cardImageSrc(card: Card): string {
  switch (card.kind) {
    case "ingredient":
      return `/assets/cards/ingredients/${card.image}`;
    case "condiment":
      return `/assets/cards/condiments/${card.image}`;
    case "chef":
      return `/assets/cards/chefs/${card.image}`;
  }
}
