import { AnimatePresence, motion } from "framer-motion";
import type { RoomSnapshot } from "../../../../packages/protocol/src/index.ts";
import { useGameStore } from "../store/gameStore.ts";

export function disconnectedPlayerNames(
  room: RoomSnapshot | null,
  sessionId: string | null,
): string[] {
  return room?.players.filter((player) => player.id !== sessionId && !player.connected).map((player) => player.name) ?? [];
}

/**
 * Aviso flotante de "reconectando…" para cuando ya había sala o partida en
 * curso y el socket se cae (pantalla en segundo plano, red inestable…).
 * No bloquea la interfaz: el jugador sigue viendo el último estado conocido.
 */
export function ConnectionBanner() {
  const connection = useGameStore((s) => s.connection);
  const room = useGameStore((s) => s.room);
  const sessionId = useGameStore((s) => s.sessionId);
  const disconnectedPlayers = disconnectedPlayerNames(room, sessionId);
  const hasDisconnectedPlayers = disconnectedPlayers.length > 0;
  const disconnectedMessage =
    disconnectedPlayers.length === 1
      ? `${disconnectedPlayers[0]} se ha quedado sin conexión. Esperando a que vuelva a la mesa…`
      : `${disconnectedPlayers.join(", ")} se han quedado sin conexión. Esperando a que vuelvan a la mesa…`;

  return (
    <AnimatePresence>
      {(connection === "connecting" || hasDisconnectedPlayers) && (
        <motion.div
          key="connection-status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-3"
          role="status"
          aria-live="polite"
        >
          {connection === "connecting" && (
            <span className="flex items-center gap-2 rounded-full border-2 border-brand-crust bg-brand-crust/90 px-3 py-1 text-xs text-brand-bechamel shadow-button">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Reconectando con la sala…
            </span>
          )}
          {hasDisconnectedPlayers && (
            <span className="max-w-md rounded-full border-2 border-brand-tomato bg-brand-crust/95 px-3 py-1 text-center text-xs text-brand-bechamel shadow-button">
              ⚠️ {disconnectedMessage}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
