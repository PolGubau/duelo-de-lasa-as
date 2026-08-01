import type { Card, ChefCard, CondimentCard, IngredientCard } from "./types.ts";

// Catálogo declarativo. Nombres de archivo alineados con docs/cards.md.

export const INGREDIENTS: readonly IngredientCard[] = [
  {
    kind: "ingredient",
    id: "relleno_chicken",
    subtype: "relleno",
    name: "Pollo",
    value: 3,
    flavor: "neutro",
    image: "card_fill_chicken.png",
  },
  {
    kind: "ingredient",
    id: "relleno_tomato_sauce",
    subtype: "relleno",
    name: "Salsa de Tomate",
    value: 2,
    flavor: "salado",
    image: "card_fill_tomato_sauce.png",
  },
  {
    kind: "ingredient",
    id: "relleno_mercadona",
    subtype: "relleno",
    name: "Relleno del Mercadona",
    value: 1,
    flavor: "neutro",
    image: "card_fill_mercadona.png",
  },
  {
    kind: "ingredient",
    id: "relleno_spinach",
    subtype: "relleno",
    name: "Espinacas",
    value: 2,
    flavor: "herbal",
    image: "card_fill_spinach.png",
  },
  {
    kind: "ingredient",
    id: "relleno_zucchini",
    subtype: "relleno",
    name: "Calabacín",
    value: 2,
    flavor: "neutro",
    image: "card_fill_zucchini.png",
  },
  {
    kind: "ingredient",
    id: "relleno_tuna",
    subtype: "relleno",
    name: "Atún",
    value: 3,
    flavor: "salado",
    image: "card_fill_tuna.png",
  },
  {
    kind: "ingredient",
    id: "relleno_fried_tomato",
    subtype: "relleno",
    name: "Tomate Frito",
    value: 3,
    flavor: "dulce",
    image: "card_fill_fried_tomato.png",
  },
  {
    kind: "ingredient",
    id: "bechamel_smooth",
    subtype: "bechamel",
    name: "Bechamel Sin Grumos",
    value: 3,
    flavor: "neutro",
    image: "card_bechamel_smooth.png",
  },
  {
    kind: "ingredient",
    id: "bechamel_lumpy",
    subtype: "bechamel",
    name: "Bechamel Con Grumos",
    value: 1,
    flavor: "neutro",
    image: "card_bechamel_lumpy.png",
  },
  {
    kind: "ingredient",
    id: "bechamel_burnt",
    subtype: "bechamel",
    name: "Bechamel Quemada",
    value: -2,
    flavor: "neutro",
    image: "card_bechamel_burnt.png",
  },
  {
    kind: "ingredient",
    id: "pasta_fresh",
    subtype: "pasta",
    name: "Pasta Fresca",
    value: 3,
    flavor: "neutro",
    image: "card_pasta_fresh.png",
  },
  {
    kind: "ingredient",
    id: "pasta_bought",
    subtype: "pasta",
    name: "Pasta Comprada",
    value: 1,
    flavor: "neutro",
    image: "card_pasta_bought.png",
  },
  {
    kind: "ingredient",
    id: "pasta_tortilla",
    subtype: "pasta",
    name: "Tortilla de Maíz",
    value: 2,
    flavor: "picante",
    image: "card_pasta_tortilla.png",
  },
];

export const CONDIMENTS: readonly CondimentCard[] = [
  {
    kind: "condiment",
    id: "cond_salt",
    name: "Sal",
    mode: "self",
    flavor: "salado",
    selfEffect: { op: "add", value: 1 },
    image: "card_cond_salt.png",
  },
  {
    kind: "condiment",
    id: "cond_rosemary",
    name: "Romero",
    mode: "self",
    flavor: "herbal",
    selfEffect: { op: "add", value: 1 },
    image: "card_cond_rosemary.png",
  },
  {
    kind: "condiment",
    id: "cond_basil",
    name: "Albahaca",
    mode: "self",
    flavor: "herbal",
    selfEffect: { op: "add", value: 1 },
    image: "card_cond_basil.png",
  },
  {
    kind: "condiment",
    id: "cond_oregano",
    name: "Orégano",
    mode: "self",
    flavor: "herbal",
    selfEffect: { op: "add", value: 2 },
    image: "card_cond_oregano.png",
  },
  {
    kind: "condiment",
    id: "cond_sugar",
    name: "Azúcar",
    mode: "dual",
    flavor: "dulce",
    selfEffect: { op: "add", value: 2 },
    throwEffect: { op: "multiply", factor: 0.7 },
    image: "card_cond_sugar.png",
  },
  {
    kind: "condiment",
    id: "cond_thyme",
    name: "Tomillo",
    mode: "throw",
    flavor: "herbal",
    throwEffect: { op: "add", value: -2 },
    image: "card_cond_thyme.png",
  },
  {
    kind: "condiment",
    id: "cond_cinnamon",
    name: "Canela",
    mode: "throw",
    flavor: "dulce",
    throwEffect: { op: "multiply", factor: 0.8 },
    image: "card_cond_cinnamon.png",
  },
  {
    kind: "condiment",
    id: "cond_turmeric",
    name: "Cúrcuma",
    mode: "throw",
    flavor: "picante",
    throwEffect: { op: "add", value: -3 },
    image: "card_cond_turmeric.png",
  },
];

export const CHEFS: readonly ChefCard[] = [
  {
    kind: "chef",
    id: "chef_pol",
    name: "Pol",
    description: "Multiplica tu puntuación total ×1.25.",
    effect: { kind: "multiplyTotal", factor: 1.25 },
    image: "card_chef_pol.png",
  },
  {
    kind: "chef",
    id: "chef_ylenia",
    name: "Ylenia",
    description: "Suma 5 puntos fijos al final.",
    effect: { kind: "addFlat", value: 5 },
    image: "card_chef_ylenia.png",
  },
  {
    kind: "chef",
    id: "chef_sara",
    name: "Sara",
    description: "Multiplica tu puntuación total ×1.1.",
    effect: { kind: "multiplyTotal", factor: 1.1 },
    image: "card_chef_sara.png",
  },
  {
    kind: "chef",
    id: "chef_victor",
    name: "Víctor",
    description: "Suma 2 puntos por cada capa de pasta.",
    effect: { kind: "addPerLayerType", subtype: "pasta", value: 2 },
    image: "card_chef_victor.png",
  },
  {
    kind: "chef",
    id: "chef_dama",
    name: "Dama",
    description: "Suma 1 punto por cada condimento que jugaste.",
    effect: { kind: "addPerCondimentPlayed", value: 1 },
    image: "card_chef_dama.png",
  },
  {
    kind: "chef",
    id: "chef_joan",
    name: "Joan",
    description: "Suma 2 puntos por cada capa de bechamel.",
    effect: { kind: "addPerLayerType", subtype: "bechamel", value: 2 },
    image: "card_chef_joan.png",
  },
  {
    kind: "chef",
    id: "chef_lidia",
    name: "Lidia",
    description: "Multiplica tu puntuación total ×1.15.",
    effect: { kind: "multiplyTotal", factor: 1.15 },
    image: "card_chef_lidia.png",
  },
];

export const ALL_CARDS: readonly Card[] = [...INGREDIENTS, ...CONDIMENTS, ...CHEFS];

const CARD_BY_ID = new Map<string, Card>(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`Carta desconocida: ${id}`);
  return card;
}

export function getIngredient(id: string): IngredientCard {
  const card = getCard(id);
  if (card.kind !== "ingredient") throw new Error(`${id} no es un ingrediente`);
  return card;
}

export function getCondiment(id: string): CondimentCard {
  const card = getCard(id);
  if (card.kind !== "condiment") throw new Error(`${id} no es un condimento`);
  return card;
}

export function getChef(id: string): ChefCard {
  const card = getCard(id);
  if (card.kind !== "chef") throw new Error(`${id} no es un chef`);
  return card;
}

/** Construye el mazo principal (ingredientes + condimentos) con copias repetidas. */
export function buildMainDeck(): string[] {
  const deck: string[] = [];
  for (const card of INGREDIENTS) {
    const copies = card.subtype === "relleno" ? 3 : 7;
    for (let i = 0; i < copies; i++) deck.push(card.id);
  }
  for (const card of CONDIMENTS) for (let i = 0; i < 4; i++) deck.push(card.id);
  return deck;
}

export function buildChefDeck(): string[] {
  return CHEFS.flatMap((chef) => [chef.id, chef.id]);
}
