import { useEffect, useState } from "react";
import { Button } from "../components/Button.tsx";
import { Modal } from "../components/Modal.tsx";
import { useGameStore } from "../store/gameStore.ts";

interface PlayDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Código de sala precargado cuando se entra por un enlace de invitación. */
function codeFromUrl(): string {
  if (typeof window === "undefined") return "";
  return (new URL(window.location.href).searchParams.get("sala") ?? "").toUpperCase().slice(0, 4);
}

export function PlayDialog({ open, onClose }: PlayDialogProps) {
  const [name, setName] = useState(() => window.localStorage.getItem("lasana-player-name") ?? "");
  const [code, setCode] = useState(codeFromUrl);
  const [pendingAction, setPendingAction] = useState<"create" | "join" | null>(null);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const error = useGameStore((s) => s.error);
  const connection = useGameStore((s) => s.connection);
  const validName = name.trim().length >= 2;
  const isCreating = pendingAction === "create" && connection === "connecting";
  const isJoining = pendingAction === "join" && connection === "connecting";

  /** Si la conexión falla o el diálogo se reabre, se libera el estado de carga. */
  useEffect(() => {
    if (connection !== "connecting") setPendingAction(null);
  }, [connection]);
  useEffect(() => {
    if (!open) setPendingAction(null);
  }, [open]);

  function remember(): void {
    window.localStorage.setItem("lasana-player-name", name.trim());
  }

  return (
    <Modal open={open} title="Jugar online" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border-3 border-brand-crust bg-brand-bechamel px-4 py-3 text-brand-crust"
          placeholder="Tu nombre"
          maxLength={24}
        />

        <Button
          disabled={!validName || isCreating || isJoining}
          onClick={() => {
            remember();
            setPendingAction("create");
            createRoom(name);
          }}
        >
          {isCreating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creando sala…
            </span>
          ) : (
            "Crear sala"
          )}
        </Button>

        <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-brand-bechamel/30 p-3">
          <p className="text-xs text-brand-bechamel/70">¿Te han pasado un código?</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="min-w-0 flex-1 rounded-xl border-3 border-brand-crust bg-brand-bechamel px-3 py-2 text-center font-display text-xl tracking-[0.35em] text-brand-crust"
              placeholder="ABCD"
              maxLength={4}
            />
            <Button
              variant="secondary"
              disabled={!validName || code.length !== 4 || isCreating || isJoining}
              onClick={() => {
                remember();
                setPendingAction("join");
                joinRoom(code, name);
              }}
            >
              {isJoining ? "Uniendo…" : "Unirse"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-brand-tomato/20 px-3 py-2 text-center text-sm">{error}</p>
        )}
      </div>
    </Modal>
  );
}
