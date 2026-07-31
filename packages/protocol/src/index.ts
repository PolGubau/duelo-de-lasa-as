import type { GameState } from "@lasana/engine";

export const PROTOCOL_VERSION = 2;

export type RoomPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
  connected: boolean;
};

/** Reglas de sala configurables por el anfitrión antes de empezar. */
export type RoomOptions = {
  visibility: "public" | "secret";
};

export type RoomSnapshot = {
  code: string;
  hostId: string;
  status: "lobby" | "playing";
  players: RoomPlayer[];
  options: RoomOptions;
};

/** Identificador de las capas rivales ocultas en salas secretas. */
export const HIDDEN_LAYER_ID = "hidden_layer";

/** Mensaje de chat rápido del lobby: solo emoticonos de una lista cerrada. */
export const CHAT_EMOJIS = ["🍝", "🧀", "🍅", "🔥", "😂", "😱", "👏", "🤌"] as const;
export type ChatEmoji = (typeof CHAT_EMOJIS)[number];

export type ChatEntry = {
  playerId: string;
  name: string;
  emoji: ChatEmoji;
  at: number;
};

export type ServerEvent = {
  kind:
    | "joined"
    | "left"
    | "play"
    | "discard"
    | "attack"
    | "turn"
    | "chef"
    | "trade"
    | "score"
    | "error";
  message: string;
  playerId?: string;
};

export type ClientMessage =
  | { type: "join"; protocolVersion: number; name: string; sessionId?: string }
  | { type: "ready"; ready: boolean }
  | { type: "options"; options: RoomOptions }
  | { type: "chat"; emoji: ChatEmoji }
  | { type: "start" }
  | {
      type: "action";
      action:
        | "playIngredient"
        | "discardAndDraw"
        | "playCondiment"
        | "endTurn"
        | "drawChef"
        | "proposeTrade"
        | "acceptTrade"
        | "rejectTrade"
        | "finishTrading"
        | "finishScoring";
      cardId?: string;
      targetPlayerId?: string;
      tradeId?: string;
    }
  | { type: "leave" };

export type ActionName = Extract<ClientMessage, { type: "action" }>["action"];

export type ServerMessage =
  | { type: "joined"; sessionId: string; room: RoomSnapshot }
  | { type: "room"; room: RoomSnapshot }
  | { type: "chat"; entry: ChatEntry }
  | { type: "stateSync"; state: GameState; event?: ServerEvent }
  | { type: "rejected"; reason: string }
  | { type: "error"; message: string };

function parseVisibility(value: unknown): RoomOptions["visibility"] | null {
  return value === "public" || value === "secret" ? value : null;
}

export function parseClientMessage(value: unknown): ClientMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;
  if (typeof message.type !== "string") return null;
  if (message.type === "join") {
    if (typeof message.name !== "string" || !message.name.trim()) return null;
    return {
      type: "join",
      protocolVersion: Number(message.protocolVersion),
      name: message.name.trim(),
      sessionId: typeof message.sessionId === "string" ? message.sessionId : undefined,
    };
  }
  if (message.type === "ready") return { type: "ready", ready: Boolean(message.ready) };
  if (message.type === "options") {
    const options = message.options as Record<string, unknown> | undefined;
    const visibility = parseVisibility(options?.visibility);
    if (!visibility) return null;
    return { type: "options", options: { visibility } };
  }
  if (message.type === "chat") {
    const emoji = CHAT_EMOJIS.find((item) => item === message.emoji);
    if (!emoji) return null;
    return { type: "chat", emoji };
  }
  if (message.type === "start") return { type: "start" };
  if (message.type === "leave") return { type: "leave" };
  if (message.type === "action") {
    const allowed = [
      "playIngredient",
      "discardAndDraw",
      "playCondiment",
      "endTurn",
      "drawChef",
      "proposeTrade",
      "acceptTrade",
      "rejectTrade",
      "finishTrading",
      "finishScoring",
    ];
    if (typeof message.action !== "string" || !allowed.includes(message.action)) return null;
    return {
      type: "action",
      action: message.action as ActionName,
      cardId: typeof message.cardId === "string" ? message.cardId : undefined,
      targetPlayerId:
        typeof message.targetPlayerId === "string" ? message.targetPlayerId : undefined,
      tradeId: typeof message.tradeId === "string" ? message.tradeId : undefined,
    };
  }
  return null;
}
