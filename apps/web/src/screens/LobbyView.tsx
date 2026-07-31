import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { CHAT_EMOJIS } from "../../../../packages/protocol/src/index.ts";
import { Avatar } from "../components/Avatar.tsx";
import { Button } from "../components/Button.tsx";
import { ConnectionBanner } from "../components/ConnectionBanner.tsx";
import { Modal } from "../components/Modal.tsx";
import { useGameStore } from "../store/gameStore.ts";

export function LobbyView() {
  const room = useGameStore((s) => s.room)!;
  const sessionId = useGameStore((s) => s.sessionId);
  const connection = useGameStore((s) => s.connection);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const startRoom = useGameStore((s) => s.startRoom);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const setVisibility = useGameStore((s) => s.setVisibility);
  const sendChat = useGameStore((s) => s.sendChat);
  const chat = useGameStore((s) => s.chat);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const me = room.players.find((player) => player.id === sessionId);
  const isHost = room.hostId === sessionId;
  const canStart =
    isHost && room.players.length >= 2 && room.players.every((player) => player.ready);
  const inviteUrl = `${window.location.origin}${window.location.pathname}?sala=${room.code}`;

  function copyInvite(): void {
    void navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-6">
      <ConnectionBanner />
      <div className="flex justify-center">
        <img
          src="/assets/ui/logo_lasana_game_compact.png"
          alt="¡Lasaña!"
          className="h-28 w-auto drop-shadow-[0_8px_0_rgba(74,40,16,0.65)]"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-brand-bechamel/70">Código de sala</p>
        <h1 className="font-display text-5xl tracking-[0.28em] text-brand-cheese">{room.code}</h1>
        <p className="mt-2 text-xs text-brand-bechamel/60">
          Comparte este código con tus rivales ·{" "}
          {connection === "connected" ? "conectado" : "conectando…"}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={copyInvite}>
            {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowQr(true)}>
            Ver QR
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border-3 border-brand-crust bg-brand-table/70 p-4">
        <h2 className="mb-2 font-display text-lg text-brand-cheese">Reglas de la sala</h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-brand-bechamel/70">
            {room.options.visibility === "secret"
              ? "Lasaña oculta: las capas rivales se revelan al puntuar."
              : "Lasaña visible: todos ven las capas de todos."}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant={room.options.visibility === "public" ? "secondary" : "ghost"}
              disabled={!isHost}
              onClick={() => setVisibility("public")}
            >
              Visible
            </Button>
            <Button
              size="sm"
              variant={room.options.visibility === "secret" ? "secondary" : "ghost"}
              disabled={!isHost}
              onClick={() => setVisibility("secret")}
            >
              Oculta
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border-3 border-brand-crust bg-brand-table/70 p-4">
        <h2 className="mb-3 font-display text-xl text-brand-cheese">
          Jugadores ({room.players.length}/6)
        </h2>
        <div className="flex flex-col gap-2">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-xl border-2 border-brand-crust/70 bg-brand-table px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar id={player.id} name={player.name} size="sm" />
                <span className="font-display">
                  {player.name} {player.isHost && "👑"}
                </span>
              </div>
              <span className={player.ready ? "text-brand-basil" : "text-brand-bechamel/50"}>
                {player.ready ? "Listo" : "Esperando…"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border-3 border-brand-crust bg-brand-table/70 p-4">
        <h2 className="mb-2 font-display text-lg text-brand-cheese">Chat rápido</h2>
        <div className="flex flex-wrap gap-2">
          {CHAT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendChat(emoji)}
              className="cursor-pointer rounded-xl border-2 border-brand-crust bg-brand-table px-3 py-2 text-xl transition-transform active:translate-y-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-3 flex max-h-28 flex-col gap-1 overflow-y-auto text-xs">
          {chat.length === 0 ? (
            <p className="text-brand-bechamel/50">Manda un emoji para romper el hielo.</p>
          ) : (
            chat.map((entry) => (
              <p key={`${entry.playerId}_${entry.at}`}>
                <span className="text-brand-bechamel/70">{entry.name}:</span>{" "}
                <span className="text-lg">{entry.emoji}</span>
              </p>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant={me?.ready ? "ghost" : "secondary"} onClick={toggleReady}>
          {me?.ready ? "No estoy listo" : "Estoy listo"}
        </Button>
        {room.hostId === sessionId && (
          <Button disabled={!canStart} onClick={startRoom}>
            Empezar partida
          </Button>
        )}
        <Button variant="danger" onClick={leaveRoom}>
          Salir
        </Button>
      </div>
      {room.hostId === sessionId && !canStart && (
        <p className="text-center text-xs text-brand-bechamel/60">
          Necesitas al menos 2 jugadores listos.
        </p>
      )}

      <Modal open={showQr} title="Código QR de la sala" onClose={() => setShowQr(false)}>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-2xl border-4 border-brand-crust bg-white p-4 shadow-xl">
            <QRCodeSVG value={inviteUrl} size={200} includeMargin />
          </div>
          <p className="text-center text-sm text-brand-bechamel/70">
            Tus amigos pueden escanear este código para unirse directamente.
          </p>
          <Button onClick={() => setShowQr(false)}>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
}
