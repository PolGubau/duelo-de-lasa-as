import { useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
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
  const resetGame = useGameStore((s) => s.resetGame);
  const [tutorial, setTutorial] = useState(false);
  const [splashPhase, setSplashPhase] = useState<"enter" | "exit" | "done">("enter");

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setSplashPhase("exit"), 900);
    const finishTimer = window.setTimeout(() => {
      setSplashPhase("done");
      const bootSplash = document.getElementById("boot-splash");
      bootSplash?.classList.add("boot-splash-hidden");
      window.setTimeout(() => bootSplash?.remove(), 400);
    }, 1320);
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
        <ErrorBoundary key="game" title="¡Se nos quemó la partida!" onReset={resetGame}>
          <GameScreen />
        </ErrorBoundary>
      ) : room ? (
        <ErrorBoundary key="lobby" title="¡Se nos cayó la sala!" onReset={resetGame}>
          <LobbyView />
        </ErrorBoundary>
      ) : tutorial ? (
        <ErrorBoundary
          key="tutorial"
          title="¡Se nos quemó el tutorial!"
          onReset={() => setTutorial(false)}
        >
          <TutorialScreen onExit={() => setTutorial(false)} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary key="home" title="¡Algo salió mal!">
          <HomeScreen onTutorial={() => setTutorial(true)} />
        </ErrorBoundary>
      )}
    </div>
  );
}
