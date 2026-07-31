import { useState } from "react";
import { Button } from "../components/Button.tsx";
import { IngredientRain } from "../components/IngredientRain.tsx";
import { OptionsDialog } from "../components/OptionsDialog.tsx";
import { useInstallPrompt } from "../lib/pwa.ts";
import { playSound, startMusic } from "../lib/sound.ts";
import { PlayDialog } from "./PlayDialog.tsx";

interface HomeScreenProps {
  onTutorial: () => void;
  onRoomSelected: (code: string) => void;
  initialRoomCode?: string;
  onRoomJoinDismiss?: () => void;
}

export function HomeScreen({
  onTutorial,
  onRoomSelected,
  initialRoomCode,
  onRoomJoinDismiss,
}: HomeScreenProps) {
  const [dialog, setDialog] = useState<"play" | "options" | null>(initialRoomCode ? "play" : null);
  const { canInstall, install } = useInstallPrompt();

  function open(next: "play" | "options"): void {
    playSound("select");
    startMusic();
    setDialog(next);
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-brand-table">
      <div className="home-backdrop" aria-hidden="true" />
      <IngredientRain />
      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-center gap-6 overflow-y-auto p-6">
        <div className="text-center">
          <img
            src="/assets/ui/logo_lasana_game.png"
            alt="¡Lasaña!"
            className="mx-auto w-full max-w-sm drop-shadow-[0_12px_0_rgba(74,40,16,0.65)]"
          />
          <p className="mt-2 text-sm text-brand-bechamel/80">
            Cocina la lasaña más sabrosa y sabotea la de tus rivales.
          </p>
        </div>

        {canInstall && (
          <div className="w-full rounded-2xl border-3 border-brand-cheese bg-brand-cheese/10 p-4 text-center">
            <p className="text-sm">Instala la app en tu móvil para jugar a pantalla completa.</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={install}>
              Instalar
            </Button>
          </div>
        )}

        <div className="flex w-full flex-col gap-3">
          <Button className="animate-target py-4 text-xl" onClick={() => open("play")}>
            Jugar
          </Button>
          <Button variant="secondary" className="py-4 text-xl" onClick={() => open("options")}>
            Opciones
          </Button>
          <Button
            variant="ghost"
            className="py-4 text-xl"
            onClick={() => {
              playSound("select");
              onTutorial();
            }}
          >
            Tutorial
          </Button>
        </div>

        <PlayDialog
          open={dialog === "play"}
          initialRoomCode={initialRoomCode}
          onRoomSelected={onRoomSelected}
          onClose={() => {
            setDialog(null);
            onRoomJoinDismiss?.();
          }}
        />
        <OptionsDialog open={dialog === "options"} onClose={() => setDialog(null)} />
      </div>
    </div>
  );
}
