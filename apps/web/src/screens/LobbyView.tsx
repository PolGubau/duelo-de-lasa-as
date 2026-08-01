import {
  Check,
  Clipboard,
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
import { cn } from "../lib/cn.ts";
import { roomPath } from "../lib/routes.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";

interface LobbyViewProps {
  onExit: () => void;
}

type CopyStatus = "code" | "link" | "error" | null;

export function LobbyView({ onExit }: LobbyViewProps) {
  const room = useGameStore((s) => s.room)!;
  const sessionId = useGameStore((s) => s.sessionId);
  const connection = useGameStore((s) => s.connection);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const startRoom = useGameStore((s) => s.startRoom);
  const setVisibility = useGameStore((s) => s.setVisibility);
  const sendChat = useGameStore((s) => s.sendChat);
  const chat = useGameStore((s) => s.chat);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [showQr, setShowQr] = useState(false);
  const [mobileTab, setMobileTab] = useState<"table" | "rules">("table");
  const me = room.players.find((player) => player.id === sessionId);
  const isHost = room.hostId === sessionId;
  const canStart =
    isHost && room.players.length >= 2 && room.players.every((player) => player.ready);
  const inviteUrl = `${window.location.origin}${roomPath(room.code)}`;

  function showCopyStatus(status: Exclude<CopyStatus, null>): void {
    setCopyStatus(status);
    window.setTimeout(() => setCopyStatus(null), 1800);
  }

  function copy(value: string, target: Exclude<CopyStatus, "error" | null>): void {
    vibrate(8);
    if (!navigator.clipboard) {
      playSound("error");
      showCopyStatus("error");
      return;
    }
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        playSound("positive");
        showCopyStatus(target);
      })
      .catch(() => {
        playSound("error");
        showCopyStatus("error");
      });
  }

  function switchTab(tab: "table" | "rules"): void {
    playSound("select");
    setMobileTab(tab);
  }

  function exitRoom(): void {
    playSound("close");
    vibrate(10);
    onExit();
  }

  return (
    <div className="lobby-shell min-h-screen overflow-x-hidden px-3 py-3 sm:px-6 sm:py-5">
      <FeedbackToast />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4">
        <ConnectionBanner />

        <header className="lobby-header">
          <img
            src="/assets/ui/logo_lasana_game.png"
            alt="Duelo de Lasañas"
            className="h-8 w-auto drop-shadow-[0_3px_0_rgba(74,40,16,0.7)] sm:h-10"
          />
          <button
            type="button"
            className="lobby-exit"
            onClick={exitRoom}
            aria-label="Salir de la sala"
          >
            <LogOut size={16} aria-hidden="true" /> Salir
          </button>
        </header>

        <main className="lobby-layout grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="flex flex-col gap-4">
            <div className="lobby-room-card">
              <div className="lobby-room-intro">
                <div>
                  <p className="lobby-eyebrow">Tu mesa está servida</p>
                  <h1 className="font-display text-xl text-brand-bechamel sm:text-2xl">
                    Invita a tus rivales
                  </h1>
                </div>
                <button type="button" className="lobby-room-exit" onClick={exitRoom}>
                  <LogOut size={15} aria-hidden="true" /> Salir
                </button>
              </div>
              <button
                type="button"
                className="lobby-code-tile mt-3"
                onClick={() => copy(room.code, "code")}
                aria-describedby="room-code-help"
                aria-label={`Copiar el código de sala ${room.code}`}
              >
                <span>{room.code}</span>
              </button>
              <p
                id="room-code-help"
                className="mt-3 text-center text-pretty text-xs text-brand-bechamel/60"
                role="status"
              >
                {copyStatus === "code"
                  ? "Código copiado"
                  : copyStatus === "link"
                    ? "Enlace copiado"
                    : copyStatus === "error"
                      ? "No se pudo copiar. Prueba de nuevo"
                      : "Toca el código para copiarlo"}
              </p>
              <div className="lobby-share-actions mt-3 flex justify-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => copy(inviteUrl, "link")}>
                  <Clipboard size={15} className="mr-1.5 inline" /> Copiar enlace
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowQr(true)}>
                  <QrCode size={15} className="mr-1.5 inline" /> QR
                </Button>
              </div>
            </div>

            {isHost && (
              <div className="lobby-mobile-tabs" role="tablist" aria-label="Secciones de la sala">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileTab === "table"}
                  className={mobileTab === "table" ? "is-active" : ""}
                  onClick={() => switchTab("table")}
                >
                  Sala
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileTab === "rules"}
                  className={mobileTab === "rules" ? "is-active" : ""}
                  onClick={() => switchTab("rules")}
                >
                  Reglas
                </button>
              </div>
            )}

            <section
              className="lobby-panel lobby-tab-content"
              data-tab="table"
              data-active={mobileTab === "table"}
            >
              <div className="lobby-section-heading mb-3">
                <div>
                  <h2 className="lobby-panel-title">En la mesa</h2>
                  <p className="text-pretty text-[11px] text-brand-bechamel/55">
                    Comensales listos para cocinar
                  </p>
                </div>
                <span className="lobby-count-badge">
                  {room.players.length}
                  <b>/6</b>
                </span>
              </div>
              <div className="lobby-seats">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className={`lobby-seat ${player.id === sessionId ? "lobby-seat-self" : ""}`}
                  >
                    <div className="lobby-seat-avatar">
                      <Avatar id={player.id} name={player.name} size="md" />
                      {player.ready && (
                        <span className="lobby-seat-check" aria-label="Listo">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                    <p className="max-w-full truncate font-display text-sm">{player.name}</p>
                    <p className="lobby-seat-role">
                      {player.isHost ? (
                        <>
                          <Crown size={10} className="mr-1 inline text-brand-cheese" /> Anfitrión
                        </>
                      ) : player.id === sessionId ? (
                        "Tú"
                      ) : (
                        "Comensal"
                      )}
                    </p>
                    {player.ready ? (
                      <span className="lobby-seat-status is-ready">Listo</span>
                    ) : (
                      <span className="lobby-seat-status">Esperando</span>
                    )}
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - room.players.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="lobby-seat lobby-seat-empty">
                    <span>+</span>
                    <small>Libre</small>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="lobby-secondary flex flex-col gap-4">
            <section
              className="lobby-panel lobby-tab-content"
              data-tab="rules"
              data-active={isHost && mobileTab === "rules"}
            >
              <h2 className="lobby-panel-title">
                <Shield size={18} /> Reglas de la mesa
              </h2>
              <p className="mt-2 text-pretty text-xs leading-relaxed text-brand-bechamel/65">
                {room.options.visibility === "secret"
                  ? "Lasaña oculta: las capas rivales se revelan al puntuar."
                  : "Lasaña visible: todos ven las capas de todos."}
              </p>
              {isHost && (
                <div className="lobby-rule-choices mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="lobby-rule-button"
                    variant={room.options.visibility === "public" ? "secondary" : "ghost"}
                    aria-pressed={room.options.visibility === "public"}
                    onClick={() => setVisibility("public")}
                  >
                    <Eye size={14} className="mr-1 inline" /> Para todos
                  </Button>
                  <Button
                    size="sm"
                    className="lobby-rule-button"
                    variant={room.options.visibility === "secret" ? "secondary" : "ghost"}
                    aria-pressed={room.options.visibility === "secret"}
                    onClick={() => setVisibility("secret")}
                  >
                    <EyeOff size={14} className="mr-1 inline" /> Oculto
                  </Button>
                </div>
              )}
              <div className="lobby-rule-status">
                <span className="lobby-rule-dot" />
                {room.options.visibility === "secret"
                  ? "Modo secreto activo"
                  : "Todos ven las capas"}
              </div>
            </section>

            <section
              className="lobby-panel lobby-tab-content flex min-h-[170px] flex-col"
              data-tab="table"
              data-active={mobileTab === "table"}
            >
              <h2 className="lobby-panel-title">
                <MessageCircle size={18} /> Chat de cocina
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CHAT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={connection !== "connected"}
                    title={
                      connection === "connected" ? `Enviar ${emoji}` : "Reconectando con la sala"
                    }
                    onClick={() => {
                      playSound("select");
                      vibrate(6);
                      sendChat(emoji);
                    }}
                    className="lobby-emoji"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {connection !== "connected" && (
                <p className="mt-2 text-pretty text-xs text-brand-bechamel/55" role="status">
                  Reconectando: el chat estará disponible enseguida.
                </p>
              )}
              <div className="lobby-chat-history mt-3 flex flex-1 flex-col gap-1 overflow-y-auto text-xs">
                {chat.length === 0 ? (
                  <p className="m-auto text-center text-pretty text-brand-bechamel/40">
                    Manda un emoji para romper el hielo.
                  </p>
                ) : (
                  chat.map((entry) => (
                    <p key={`${entry.playerId}_${entry.at}`}>
                      <span className="text-brand-bechamel/60">{entry.name}:</span>{" "}
                      <span className="text-lg">{entry.emoji}</span>
                    </p>
                  ))
                )}
              </div>
            </section>
          </aside>
        </main>

        <footer className="lobby-actions">
          {isHost && !canStart && (
            <p className="text-pretty text-xs text-brand-bechamel/55">
              Necesitas 2 listos para empezar
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="lobby-ready-cta min-h-10 px-3 text-sm"
              disabled={connection !== "connected"}
              variant={me?.ready ? "ghost" : "secondary"}
              onClick={toggleReady}
            >
              {me?.ready ? "No estoy listo" : "Estoy listo"}
            </Button>
            {isHost && (
              <Button
                size="sm"
                className={cn("lobby-start-cta min-h-10 px-3 text-sm", canStart && "animate-target")}
                disabled={!canStart || connection !== "connected"}
                onClick={startRoom}
              >
                <Play size={15} className="mr-1 inline fill-current" /> Empezar partida
              </Button>
            )}
          </div>
        </footer>
      </div>

      <Modal open={showQr} title="QR de la sala" onClose={() => setShowQr(false)}>
        <div className="flex flex-col items-center gap-3 py-2 sm:gap-4 sm:py-4">
          <div className="rounded-2xl border-4 border-brand-crust bg-white p-3 shadow-xl sm:p-4">
            <QRCodeSVG
              value={inviteUrl}
              size={200}
              includeMargin
              className="h-auto w-40 sm:w-[200px]"
            />
          </div>
          <p className="text-center text-pretty text-sm text-brand-bechamel/70">
            Tus amigos pueden escanear este código para unirse directamente.
          </p>
          <Button onClick={() => setShowQr(false)}>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
}
