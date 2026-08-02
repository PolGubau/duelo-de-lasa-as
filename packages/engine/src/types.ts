// Tipos puros del motor de "Lasaña!". Cero dependencias de UI/red/plataforma.

export type IngredientSubtype = "relleno" | "bechamel" | "pasta";
/** La fase de una ronda coincide siempre con una subcategoría de ingrediente. */
export type Phase = IngredientSubtype;
export const PHASE_ORDER: readonly Phase[] = ["relleno", "bechamel", "pasta"];

export type Flavor = "salado" | "dulce" | "herbal" | "picante" | "neutro";

export interface IngredientCard {
  kind: "ingredient";
  id: string;
  subtype: IngredientSubtype;
  name: string;
  value: number;
  image: string;
  flavor: Flavor;
}

export type CondimentEffect = { op: "add"; value: number } | { op: "multiply"; factor: number };

export interface CondimentCard {
  kind: "condiment";
  id: string;
  name: string;
  /** self: solo sobre la propia lasaña. throw: solo arrojable a un rival. dual: el jugador elige. */
  mode: "self" | "throw" | "dual";
  flavor: Flavor;
  selfEffect?: CondimentEffect;
  throwEffect?: CondimentEffect;
  image: string;
}

export type ChefEffectSpec =
  | { kind: "multiplyTotal"; factor: number }
  | { kind: "addFlat"; value: number }
  | { kind: "addPerLayerType"; subtype: IngredientSubtype; value: number }
  | { kind: "addPerDifferentLayerType"; value: number }
  | { kind: "addPerCondimentPlayed"; value: number };

export interface ChefCard {
  kind: "chef";
  id: string;
  name: string;
  description: string;
  effect: ChefEffectSpec;
  image: string;
}

export type Card = IngredientCard | CondimentCard | ChefCard;

export interface LayerEvent {
  cardId: string;
  cardName: string;
  subtype?: IngredientSubtype;
  /** own: colocado por el propio jugador. opponent: condimento arrojado por un rival. */
  origin: "own" | "opponent";
  op: "add" | "multiply";
  value: number;
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  hand: string[];
  lasagna: LayerEvent[];
  chefId?: string;
  ready: boolean;
}

export type GameStatus = "setup" | "playing" | "chefDraw" | "trading" | "scoring" | "finished";

export interface GameConfig {
  layersPerGame: number;
  roundsCount: number;
  handSize: number;
  drawToHandSize: number;
  maxCondimentsPerTurn: number;
  visibility: "public" | "secret";
}

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  status: "pending" | "accepted" | "rejected";
}

export interface GameState {
  config: GameConfig;
  seed: number;
  rngState: number;
  players: PlayerState[];
  deck: string[];
  discard: string[];
  chefDeck: string[];
  /** Dos chefs reservados para cada jugador que haya abierto la selección. */
  chefChoices: Record<string, string[]>;
  round: number;
  phaseIndex: number;
  turnPlayerIndex: number;
  hasDiscardedThisTurn: boolean;
  hasPlayedIngredientThisTurn: boolean;
  condimentsPlayedThisTurn: number;
  status: GameStatus;
  pendingTrades: TradeOffer[];
  log: string[];
  winnerId?: string;
}

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; state: GameState; reason: string };

export interface ScoreStep {
  label: string;
  op: "add" | "multiply";
  value: number;
  before: number;
  after: number;
}

export interface PlayerScore {
  playerId: string;
  steps: ScoreStep[];
  chefStep?: ScoreStep;
  total: number;
}
