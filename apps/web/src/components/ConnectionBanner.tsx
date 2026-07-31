import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../store/gameStore.ts";

/**
 * Aviso flotante de "reconectando…" para cuando ya había sala o partida en
 * curso y el socket se cae (pantalla en segundo plano, red inestable…).
 * No bloquea la interfaz: el jugador sigue viendo el último estado conocido.
 */
export function ConnectionBanner() {
  const connection = useGameStore((s) => s.connection);

  return (
    <AnimatePresence>
      {connection === "connecting" && (
        <motion.div
          key="reconnecting"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none fixed inset-x-0 top-2 z-50 flex justify-center"
          role="status"
          aria-live="polite"
        >
          <span className="flex items-center gap-2 rounded-full border-2 border-brand-crust bg-brand-crust/90 px-3 py-1 text-xs text-brand-bechamel shadow-button">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Reconectando…
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
