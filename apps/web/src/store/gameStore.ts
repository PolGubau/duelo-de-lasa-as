import type { GameState } from "@lasana/engine";
import { create } from "zustand";
import {
  PROTOCOL_VERSION,
  type ChatEmoji,
  type ChatEntry,
  type RoomOptions,
  type RoomSnapshot,
  type ServerMessage,
} from "../../../../packages/protocol/src/index.ts";
import { playSound, vibrate, type SoundCue } from "../lib/sound.ts";
import { useSettingsStore } from "./settingsStore.ts";

type Feedback = {
  id: number;
  message: string;
  cue: SoundCue;
  playerId?: string;
  targetPlayerId?: string;
};

interface GameStore {
  state: GameState | null;
  room: RoomSnapshot | null;
  sessionId: string | null;
  connection: "idle" | "connecting" | "connected" | "error";
  error: string | null;
  pendingThrowCardId: string | null;
  feedback: Feedback | null;
  chat: ChatEntry[];
  pendingVisibility: RoomOptions["visibility"] | null;

  createRoom: (name: string) => string;
  joinRoom: (code: string, name: string) => void;
  toggleReady: () => void;
  setVisibility: (visibility: RoomOptions["visibility"]) => void;
  sendChat: (emoji: ChatEmoji) => void;
  startRoom: () => void;
  leaveRoom: () => void;
  resetGame: () => void;
  clearError: () => void;
  clearFeedback: () => void;

  playIngredient: (cardId: string) => void;
  discardAndDraw: (cardId: string) => void;
  playCondimentSelf: (cardId: string) => void;
  beginThrow: (cardId: string) => void;
  cancelThrow: () => void;
  throwAt: (targetPlayerId: string) => void;
  endTurn: () => void;
  drawChef: (chefId?: string) => void;
  proposeTrade: (fromPlayerId: string, toPlayerId: string) => void;
  acceptTrade: (tradeId: string) => void;
  rejectTrade: (tradeId: string) => void;
  finishTrading: () => void;
  finishScoring: () => void;
}

const PARTY_URL = (import.meta.env.VITE_PARTY_URL as string | undefined) ?? "ws://localhost:8787";
let socket: WebSocket | null = null;
let feedbackId = 0;
/** Última sala a la que se entró, para reconectar al volver a primer plano. */
let lastRoom: { code: string; name: string } | null = null;
let reconnectTimer: number | null = null;

function roomCode(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(4)),
    (value) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[value % 32],
  ).join("");
}

function cueFor(kind: string): SoundCue {
  if (kind === "attack") return "attack";
  if (kind === "discard") return "discard";
  if (kind === "chef") return "chef";
  if (kind === "trade") return "trade";
  if (kind === "score") return "score";
  if (kind === "turn") return "turn";
  return "play";
}

export const useGameStore = create<GameStore>((set, get) => {
  function announce(
    message: string,
    cue: SoundCue,
    playerId?: string,
    targetPlayerId?: string,
  ): void {
    const id = ++feedbackId;
    playSound(cue);
    if (cue === "attack") vibrate([18, 40, 24]);
    set({ feedback: { id, message, cue, playerId, targetPlayerId } });
    window.setTimeout(() => {
      if (get().feedback?.id === id) set({ feedback: null });
    }, 3200);
  }

  function notifyError(message: string): void {
    announce(message, "error");
  }

  function send(message: object): boolean {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const error = "No se pudo enviar: estamos reconectando con la sala.";
      set({ error });
      notifyError(error);
      return false;
    }
    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch {
      const error = "No se pudo enviar el mensaje a la sala.";
      set({ error });
      notifyError(error);
      return false;
    }
  }

  function connect(code: string, name: string): void {
    const savedSession = window.localStorage.getItem(`lasana-room-${code}`) ?? undefined;
    lastRoom = { code, name };
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    const previousSocket = socket;
    socket = null;
    previousSocket?.close();
    set({ connection: "connecting", error: null, room: null, state: null, sessionId: null });
    const roomSocket = new WebSocket(`${PARTY_URL.replace(/\/$/, "")}/room/${code}`);
    socket = roomSocket;
    roomSocket.onopen = () => {
      if (socket !== roomSocket) return;
      roomSocket.send(
        JSON.stringify({
          type: "join",
          protocolVersion: PROTOCOL_VERSION,
          name,
          sessionId: savedSession,
        }),
      );
    };
    roomSocket.onmessage = (event) => {
      if (socket !== roomSocket) return;
      let message: ServerMessage;
      try {
        message = JSON.parse(event.data as string) as ServerMessage;
      } catch {
        return;
      }
      if (message.type === "joined") {
        window.localStorage.setItem(`lasana-room-${message.room.code}`, message.sessionId);
        set({ sessionId: message.sessionId, room: message.room, connection: "connected" });
        announce(`Sala ${message.room.code}`, "positive");
        const preferred = useSettingsStore.getState().defaultVisibility;
        if (
          message.room.hostId === message.sessionId &&
          message.room.options.visibility !== preferred
        )
          send({ type: "options", options: { visibility: preferred } });
      } else if (message.type === "room") {
        const pendingVisibility = get().pendingVisibility;
        set({
          room: message.room,
          connection: "connected",
          pendingVisibility:
            pendingVisibility === message.room.options.visibility ? null : pendingVisibility,
        });
        if (pendingVisibility === message.room.options.visibility) {
          announce(
            message.room.options.visibility === "public"
              ? "Mesa visible para todos"
              : "Oculto: modo secreto",
            "positive",
          );
        }
      } else if (message.type === "chat") {
        playSound("select");
        set({ chat: [...get().chat, message.entry].slice(-20) });
      } else if (message.type === "stateSync") {
        set({
          state: message.state,
          room: get().room ? { ...get().room!, status: "playing" } : get().room,
        });
        if (message.event)
          announce(
            message.event.message,
            cueFor(message.event.kind),
            message.event.playerId,
            message.event.targetPlayerId,
          );
      } else if (message.type === "rejected") {
        set({ error: message.reason, pendingVisibility: null });
        notifyError(message.reason);
      } else if (message.type === "error") {
        set({ error: message.message, connection: "error", pendingVisibility: null });
        notifyError(message.message);
      }
    };
    roomSocket.onerror = () => {
      if (socket !== roomSocket) return;
      const error = "No se pudo conectar con el servidor de salas.";
      set({ connection: "error", error });
      notifyError(error);
    };
    roomSocket.onclose = () => {
      if (socket !== roomSocket || get().connection === "idle" || !lastRoom) return;
      set({ connection: "connecting" });
      scheduleReconnect();
    };
  }

  /** Reintenta la conexión: cubre cierres por minimizar la PWA o red inestable. */
  function scheduleReconnect(): void {
    if (reconnectTimer !== null || !lastRoom) return;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      if (lastRoom) connect(lastRoom.code, lastRoom.name);
    }, 1500);
  }

  function forget(): void {
    lastRoom = null;
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    socket?.close();
    socket = null;
  }

  if (typeof document !== "undefined")
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || !lastRoom) return;
      if (!socket || socket.readyState === WebSocket.CLOSED) connect(lastRoom.code, lastRoom.name);
    });

  function action(actionName: string, payload: Record<string, string> = {}): void {
    send({ type: "action", action: actionName, ...payload });
  }

  return {
    state: null,
    room: null,
    sessionId: null,
    connection: "idle",
    error: null,
    pendingThrowCardId: null,
    feedback: null,
    chat: [],
    pendingVisibility: null,
    createRoom: (name) => {
      const code = roomCode();
      connect(code, name);
      return code;
    },
    joinRoom: (code, name) => connect(code.trim().toUpperCase(), name),
    toggleReady: () => {
      const me = get().room?.players.find((player) => player.id === get().sessionId);
      send({ type: "ready", ready: !me?.ready });
    },
    setVisibility: (visibility) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        send({ type: "options", options: { visibility } });
        return;
      }
      set({ pendingVisibility: visibility });
      send({ type: "options", options: { visibility } });
    },
    sendChat: (emoji) => send({ type: "chat", emoji }),
    startRoom: () => send({ type: "start" }),
    leaveRoom: () => {
      forget();
      set({
        state: null,
        room: null,
        sessionId: null,
        connection: "idle",
        pendingThrowCardId: null,
        pendingVisibility: null,
        chat: [],
      });
    },
    resetGame: () => {
      forget();
      set({
        state: null,
        room: null,
        sessionId: null,
        connection: "idle",
        pendingThrowCardId: null,
        pendingVisibility: null,
        feedback: null,
        chat: [],
      });
    },
    clearError: () => set({ error: null }),
    clearFeedback: () => set({ feedback: null }),
    playIngredient: (cardId) => action("playIngredient", { cardId }),
    discardAndDraw: (cardId) => action("discardAndDraw", { cardId }),
    playCondimentSelf: (cardId) => action("playCondiment", { cardId }),
    beginThrow: (cardId) => {
      playSound("select");
      vibrate();
      set({ pendingThrowCardId: cardId });
    },
    cancelThrow: () => {
      playSound("select");
      set({ pendingThrowCardId: null });
    },
    throwAt: (targetPlayerId) => {
      const cardId = get().pendingThrowCardId;
      if (cardId) action("playCondiment", { cardId, targetPlayerId });
      set({ pendingThrowCardId: null });
    },
    endTurn: () => action("endTurn"),
    drawChef: (chefId) => action("drawChef", chefId ? { cardId: chefId } : {}),
    proposeTrade: (_fromPlayerId, toPlayerId) =>
      action("proposeTrade", { targetPlayerId: toPlayerId }),
    acceptTrade: (tradeId) => action("acceptTrade", { tradeId }),
    rejectTrade: (tradeId) => action("rejectTrade", { tradeId }),
    finishTrading: () => action("finishTrading"),
    finishScoring: () => action("finishScoring"),
  };
});
