import {
  acceptTrade,
  createGame,
  discardAndDraw,
  drawChef,
  endTurn,
  finishScoring,
  finishTrading,
  getCard,
  playCondiment,
  playIngredient,
  proposeTrade,
  rejectTrade,
  type ActionResult,
  type GameState,
  type LayerEvent,
} from "@lasana/engine";
import { DurableObject } from "cloudflare:workers";
import {
  HIDDEN_LAYER_ID,
  parseClientMessage,
  PROTOCOL_VERSION,
  type ChatEmoji,
  type ClientMessage,
  type RoomOptions,
  type RoomPlayer,
  type RoomSnapshot,
  type ServerEvent,
  type ServerMessage,
} from "../../../packages/protocol/src/index.ts";

export interface Env {
  LASANA_ROOMS: DurableObjectNamespace<LasanaRoom>;
}

const CODE = /^[A-Z0-9]{4}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([A-Z0-9]{4})$/i);
    if (!match) return new Response("Usa /room/ABCD", { status: 404 });
    const code = match[1]!.toUpperCase();
    if (!CODE.test(code)) return new Response("Código de sala inválido", { status: 400 });
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
      return new Response("WebSocket requerido", { status: 426 });
    return env.LASANA_ROOMS.get(env.LASANA_ROOMS.idFromName(code)).fetch(request);
  },
};

type Session = { playerId: string; ws: WebSocket };

/** Capa anónima que sustituye a las capas rivales en las salas secretas. */
const HIDDEN_LAYER: LayerEvent = {
  cardId: HIDDEN_LAYER_ID,
  cardName: "Capa oculta",
  origin: "own",
  op: "add",
  value: 0,
};

export class LasanaRoom extends DurableObject<Env> {
  private code = "ROOM";
  private players = new Map<string, RoomPlayer>();
  private sessions = new Map<WebSocket, Session>();
  private state: GameState | null = null;
  private options: RoomOptions = { visibility: "public" };
  private loaded = false;

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const saved = await this.ctx.storage.get<{
      code: string;
      players: RoomPlayer[];
      state: GameState | null;
      options?: RoomOptions;
    }>("room");
    if (saved) {
      this.code = saved.code;
      this.players = new Map<string, RoomPlayer>(
        saved.players.map((player: RoomPlayer) => [player.id, player]),
      );
      this.state = saved.state;
      if (saved.options) this.options = saved.options;
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await this.ctx.storage.put("room", {
      code: this.code,
      players: [...this.players.values()],
      state: this.state,
      options: this.options,
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.ensureLoaded();
    const url = new URL(request.url);
    this.code = url.pathname.split("/").pop()?.toUpperCase() ?? this.code;
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client } as ResponseInit & {
      webSocket: WebSocket;
    });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    await this.ensureLoaded();
    let payload: unknown = null;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }
    const message = parseClientMessage(payload);
    if (!message) return this.send(ws, { type: "error", message: "Mensaje inválido." });
    if (message.type === "join") return this.join(ws, message);
    const session = this.sessions.get(ws);
    if (!session)
      return this.send(ws, { type: "error", message: "Primero debes unirte a la sala." });
    if (message.type === "ready") return this.setReady(session.playerId, message.ready);
    if (message.type === "options") return this.setOptions(session.playerId, message.options);
    if (message.type === "chat") return this.chat(session.playerId, message.emoji);
    if (message.type === "start") return this.start(session.playerId);
    if (message.type === "leave") return this.leave(ws);
    this.action(session.playerId, message);
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    await this.ensureLoaded();
    await this.leave(ws);
  }

  private join(ws: WebSocket, message: Extract<ClientMessage, { type: "join" }>): void {
    if (message.protocolVersion !== PROTOCOL_VERSION)
      return this.send(ws, { type: "error", message: "Versión incompatible. Actualiza la app." });
    if (this.state && !message.sessionId)
      return this.send(ws, { type: "error", message: "La partida ya ha empezado." });
    if (this.players.size >= 6 && !message.sessionId)
      return this.send(ws, { type: "error", message: "La sala está llena." });
    const existing = message.sessionId ? this.players.get(message.sessionId) : undefined;
    const playerId = existing?.id ?? crypto.randomUUID();
    const player: RoomPlayer = existing ?? {
      id: playerId,
      name: message.name.slice(0, 24),
      isHost: this.players.size === 0,
      ready: false,
      connected: true,
    };
    player.connected = true;
    this.players.set(playerId, player);
    this.sessions.set(ws, { playerId, ws });
    void this.persist();
    this.send(ws, { type: "joined", sessionId: playerId, room: this.snapshot() });
    this.broadcast({ type: "room", room: this.snapshot() });
  }

  private setReady(playerId: string, ready: boolean): void {
    const player = this.players.get(playerId);
    if (!player || this.state) return;
    player.ready = ready;
    void this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }

  private setOptions(playerId: string, options: RoomOptions): void {
    const host = this.players.get(playerId);
    if (!host?.isHost) return this.reject(playerId, "Solo el anfitrión puede cambiar las reglas.");
    if (this.state) return this.reject(playerId, "La partida ya ha empezado.");
    this.options = options;
    void this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }

  private chat(playerId: string, emoji: ChatEmoji): void {
    const player = this.players.get(playerId);
    if (!player) return;
    this.broadcast({
      type: "chat",
      entry: { playerId, name: player.name, emoji, at: Date.now() },
    });
  }

  private start(playerId: string): void {
    const host = this.players.get(playerId);
    if (!host?.isHost) return this.reject(playerId, "Solo el anfitrión puede empezar.");
    if (this.players.size < 2) return this.reject(playerId, "Necesitas al menos 2 jugadores.");
    if ([...this.players.values()].some((player) => !player.ready))
      return this.reject(playerId, "Todos los jugadores deben estar listos.");
    this.state = createGame(
      [...this.players.values()].map((player) => ({ id: player.id, name: player.name })),
      { seed: this.code, config: { visibility: this.options.visibility } },
    );
    void this.persist();
    this.broadcastState({ kind: "play", message: "¡La partida ha comenzado!", playerId });
  }

  private action(playerId: string, message: Extract<ClientMessage, { type: "action" }>): void {
    if (!this.state) return this.reject(playerId, "La partida todavía no ha empezado.");
    const state = this.state;
    if (
      (message.action === "acceptTrade" || message.action === "rejectTrade") &&
      state.pendingTrades.find((trade) => trade.id === message.tradeId)?.toPlayerId !== playerId
    ) {
      return this.reject(playerId, "Solo el destinatario puede responder a ese trueque.");
    }
    if (
      (message.action === "finishTrading" || message.action === "finishScoring") &&
      playerId !== this.snapshot().hostId
    ) {
      return this.reject(playerId, "Solo el anfitrión puede avanzar la partida.");
    }
    let result: ActionResult;
    switch (message.action) {
      case "playIngredient":
        result = playIngredient(state, playerId, message.cardId ?? "");
        break;
      case "discardAndDraw":
        result = discardAndDraw(state, playerId, message.cardId ?? "");
        break;
      case "playCondiment":
        result = playCondiment(state, playerId, message.cardId ?? "", message.targetPlayerId);
        break;
      case "endTurn":
        result = endTurn(state, playerId);
        break;
      case "drawChef":
        result = drawChef(state, playerId);
        break;
      case "proposeTrade":
        result = proposeTrade(state, playerId, message.targetPlayerId ?? "");
        break;
      case "acceptTrade":
        result = acceptTrade(state, message.tradeId ?? "");
        break;
      case "rejectTrade":
        result = rejectTrade(state, message.tradeId ?? "");
        break;
      case "finishTrading":
        result = finishTrading(state);
        break;
      case "finishScoring":
        result = finishScoring(state);
        break;
    }
    if (!result.ok) return this.reject(playerId, result.reason);
    this.state = result.state;
    void this.persist();
    const event = this.eventFor(message.action, playerId, message.cardId, message.targetPlayerId);
    this.broadcastState(event);
  }

  private eventFor(
    action: Extract<ClientMessage, { type: "action" }>["action"],
    playerId: string,
    cardId?: string,
    targetPlayerId?: string,
  ): ServerEvent {
    const cardName = cardId && this.state ? getCard(cardId).name : "";
    const map = {
      playIngredient: "play",
      discardAndDraw: "discard",
      playCondiment: "attack",
      endTurn: "turn",
      drawChef: "chef",
      proposeTrade: "trade",
      acceptTrade: "trade",
      rejectTrade: "trade",
      finishTrading: "score",
      finishScoring: "score",
    } as const;
    return {
      kind: map[action],
      message: cardName ? `${cardName} resuelto` : "Acción resuelta",
      playerId,
      targetPlayerId:
        action === "playCondiment" && targetPlayerId && targetPlayerId !== playerId
          ? targetPlayerId
          : undefined,
    };
  }

  private async leave(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;
    this.sessions.delete(ws);
    const player = this.players.get(session.playerId);
    if (player) player.connected = false;
    await this.persist();
    this.broadcast({ type: "room", room: this.snapshot() });
  }

  private snapshot(): RoomSnapshot {
    return {
      code: this.code,
      hostId: [...this.players.values()].find((player) => player.isHost)?.id ?? "",
      status: this.state ? "playing" : "lobby",
      players: [...this.players.values()],
      options: this.options,
    };
  }

  private redact(playerId: string): GameState {
    if (!this.state) throw new Error("No hay partida");
    const state = this.state;
    /** En modo secreto las capas rivales solo se revelan al puntuar. */
    const hideLayers =
      state.config.visibility === "secret" &&
      state.status !== "scoring" &&
      state.status !== "finished";
    return {
      ...state,
      deck: [],
      discard: [],
      chefDeck: [],
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, hand: [...player.hand] }
          : {
              ...player,
              hand: player.hand.map((_, index) => `hidden_${index}`),
              lasagna: hideLayers ? player.lasagna.map(() => HIDDEN_LAYER) : [...player.lasagna],
            },
      ),
    };
  }

  private broadcastState(event?: ServerEvent): void {
    for (const session of this.sessions.values())
      this.send(session.ws, { type: "stateSync", state: this.redact(session.playerId), event });
  }

  private reject(playerId: string, reason: string): void {
    const session = [...this.sessions.values()].find((item) => item.playerId === playerId);
    if (session) this.send(session.ws, { type: "rejected", reason });
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    ws.send(JSON.stringify(message));
  }
  private broadcast(message: ServerMessage): void {
    for (const session of this.sessions.values()) this.send(session.ws, message);
  }
}
