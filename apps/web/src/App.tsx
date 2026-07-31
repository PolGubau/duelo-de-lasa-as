import { useEffect, useState } from "react";
import { startMusic } from "./lib/sound.ts";
import { GameScreen } from "./screens/GameScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { LobbyView } from "./screens/LobbyView.tsx";
import { SplashScreen } from "./screens/SplashScreen.tsx";
import { TutorialScreen } from "./screens/TutorialScreen.tsx";
import { useGameStore } from "./store/gameStore.ts";

export default function App() {
  const state = useGameStore((s) => s.state);
  const room = useGameStore((s) => s.room);
  const [tutorial, setTutorial] = useState(false);
  const [splashPhase, setSplashPhase] = useState<"enter" | "exit" | "done">("enter");

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setSplashPhase("exit"), 900);
    const finishTimer = window.setTimeout(() => setSplashPhase("done"), 1320);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  /**
   * Los navegadores bloquean el audio hasta el primer gesto del usuario, así
   * que arrancamos la música (si no está silenciada) en cuanto se produce esa
   * primera interacción, sea cual sea el botón o zona que se toque.
   */
  useEffect(() => {
    function begin(): void {
      startMusic();
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    }
    window.addEventListener("pointerdown", begin);
    window.addEventListener("keydown", begin);
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-table">
      {splashPhase !== "done" ? (
        <SplashScreen phase={splashPhase} />
      ) : state ? (
        <GameScreen />
      ) : room ? (
        <LobbyView />
      ) : tutorial ? (
        <TutorialScreen onExit={() => setTutorial(false)} />
      ) : (
        <HomeScreen onTutorial={() => setTutorial(true)} />
      )}
    </div>
  );
}
