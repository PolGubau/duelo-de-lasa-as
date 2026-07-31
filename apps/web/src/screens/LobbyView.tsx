import {
  Check,
  Clipboard,
  Clock3,
  Crown,
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  Play,
  QrCode,
  Shield,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { CHAT_EMOJIS } from "../../../../packages/protocol/src/index.ts";
import { Avatar } from "../components/Avatar.tsx";
import { Button } from "../components/Button.tsx";
import { ConnectionBanner } from "../components/ConnectionBanner.tsx";
import { FeedbackToast } from "../components/FeedbackToast.tsx";
import { Modal } from "../components/Modal.tsx";
import { roomPath } from "../lib/routes.ts";
import { useGameStore } from "../store/gameStore.ts";

interface LobbyViewProps {
  onExit: () => void;
}

export function LobbyView({ onExit }: LobbyViewProps) {
  const room = useGameStore((s) => s.room)!;
  const sessionId = useGameStore((s) => s.sessionId);
  const connection = useGameStore((s) => s.connection);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const startRoom = useGameStore((s) => s.startRoom);
  const setVisibility = useGameStore((s) => s.setVisibility);
  const sendChat = useGameStore((s) => s.sendChat);
  const chat = useGameStore((s) => s.chat);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const me = room.players.find((player) => player.id === sessionId);
  const isHost = room.hostId === sessionId;
  const canStart = isHost && room.players.length >= 2 && room.players.every((player) => player.ready);
  const inviteUrl = `${window.location.origin}${roomPath(room.code)}`;

  function copyInvite(): void {
    void navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="lobby-shell min-h-screen overflow-x-hidden px-3 py-3 sm:px-6 sm:py-5">
      <FeedbackToast />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4">
        <ConnectionBanner />

        <header className="lobby-header">
          <img
            src="/assets/ui/logo_lasana_game.png"
            alt="¡Lasaña!"
            className="h-8 w-auto drop-shadow-[0_3px_0_rgba(74,40,16,0.7)] sm:h-10"
          />
          <button type="button" className="lobby-exit" onClick={onExit} aria-label="Salir de la sala">
            <LogOut size={16} aria-hidden="true" /> Salir
          </button>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="flex flex-col gap-4">
            <div className="lobby-room-card">
              <h1 className="font-display text-xl text-brand-bechamel sm:text-3xl">Código de sala</h1>
              <div className="lobby-code-tile mt-4">
                <span>{room.code}</span>
              </div>
              <p className="mt-3 text-center text-pretty text-xs text-brand-bechamel/60">Comparte el código o invita directamente a tus rivales.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button size="sm" variant="ghost" onClick={copyInvite}>
                  <Clipboard size={15} className="mr-1.5 inline" /> {copied ? "¡Copiado!" : "Copiar enlace"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowQr(true)}>
                  <QrCode size={15} className="mr-1.5 inline" /> QR
                </Button>
              </div>
            </div>

            <section className="lobby-panel">
              <div className="lobby-section-heading mb-3">
                <div>
                  <h2 className="lobby-panel-title">En la mesa</h2>
                  <p className="text-pretty text-[11px] text-brand-bechamel/55">Comensales listos para cocinar</p>
                </div>
                <span className="lobby-count-badge">{room.players.length}<b>/6</b></span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {room.players.map((player) => (
                  <div key={player.id} className={`lobby-player ${player.id === sessionId ? "lobby-player-self" : ""}`}>
                    <Avatar id={player.id} name={player.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base">{player.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-brand-bechamel/50">
                        {player.isHost ? <><Crown size={11} className="mr-1 inline text-brand-cheese" /> Chef de mesa</> : player.id === sessionId ? "Tu sitio" : "Comensal"}
                      </p>
                    </div>
                    {player.ready ? <span className="lobby-ready"><Check size={13} /> Listo</span> : <span className="lobby-waiting"><Clock3 size={13} /> Pendiente</span>}
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - room.players.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="lobby-player lobby-player-empty"><span>+</span><small>Hueco libre</small></div>
                ))}
              </div>
            </section>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="lobby-panel">
              <h2 className="lobby-panel-title"><Shield size={18} /> Reglas de la mesa</h2>
              <p className="mt-2 text-pretty text-xs leading-relaxed text-brand-bechamel/65">
                {room.options.visibility === "secret" ? "Lasaña oculta: las capas rivales se revelan al puntuar." : "Lasaña visible: todos ven las capas de todos."}
              </p>
              <div className="lobby-rule-choices mt-3 grid grid-cols-2 gap-2">
                <Button size="sm" className="lobby-rule-button" variant={room.options.visibility === "public" ? "secondary" : "ghost"} disabled={!isHost} aria-pressed={room.options.visibility === "public"} onClick={() => setVisibility("public")}>
                  <Eye size={14} className="mr-1 inline" /> Para todos
                </Button>
                <Button size="sm" className="lobby-rule-button" variant={room.options.visibility === "secret" ? "secondary" : "ghost"} disabled={!isHost} aria-pressed={room.options.visibility === "secret"} onClick={() => setVisibility("secret")}>
                  <EyeOff size={14} className="mr-1 inline" /> Oculto
                </Button>
              </div>
              <div className="lobby-rule-status">
                <span className="lobby-rule-dot" />
                {room.options.visibility === "secret" ? "Modo secreto activo" : "Todos ven las capas"}
              </div>
            </section>

            <section className="lobby-panel flex min-h-[220px] flex-col">
              <h2 className="lobby-panel-title"><MessageCircle size={18} /> Chat de cocina</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CHAT_EMOJIS.map((emoji) => <button key={emoji} type="button" disabled={connection !== "connected"} title={connection === "connected" ? `Enviar ${emoji}` : "Reconectando con la sala"} onClick={() => sendChat(emoji)} className="lobby-emoji">{emoji}</button>)}
              </div>
              {connection !== "connected" && <p className="mt-2 text-pretty text-xs text-brand-bechamel/55" role="status">Reconectando: el chat estará disponible enseguida.</p>}
              <div className="mt-3 flex flex-1 flex-col gap-1 overflow-y-auto rounded-xl bg-black/10 p-2 text-xs">
                {chat.length === 0 ? <p className="m-auto text-center text-pretty text-brand-bechamel/40">Manda un emoji para romper el hielo.</p> : chat.map((entry) => <p key={`${entry.playerId}_${entry.at}`}><span className="text-brand-bechamel/60">{entry.name}:</span> <span className="text-lg">{entry.emoji}</span></p>)}
              </div>
            </section>
          </aside>
        </main>

        <footer className="lobby-actions">
          {isHost && !canStart && <p className="text-pretty text-xs text-brand-bechamel/55">Necesitas 2 listos para empezar</p>}
          <div className="flex gap-2">
            <Button size="sm" className="min-h-10 px-3 text-sm" disabled={connection !== "connected"} variant={me?.ready ? "ghost" : "secondary"} onClick={toggleReady}>{me?.ready ? "No listo" : "Listo"}</Button>
            {isHost && <Button size="sm" className="min-h-10 px-3 text-sm" disabled={!canStart || connection !== "connected"} onClick={startRoom}><Play size={15} className="mr-1 inline fill-current" /> Empezar</Button>}
          </div>
        </footer>
      </div>

      <Modal open={showQr} title="QR de la sala" onClose={() => setShowQr(false)}>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-2xl border-4 border-brand-crust bg-white p-4 shadow-xl"><QRCodeSVG value={inviteUrl} size={200} includeMargin /></div>
          <p className="text-center text-pretty text-sm text-brand-bechamel/70">Tus amigos pueden escanear este código para unirse directamente.</p>
          <Button onClick={() => setShowQr(false)}>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
}
