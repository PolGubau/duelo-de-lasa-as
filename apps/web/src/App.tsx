import { useEffect, useRef, useState } from "react";
import { Button } from "./components/Button.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { roomPath, useAppRouter } from "./lib/routes.ts";
import { startMusic } from "./lib/sound.ts";
import { GameScreen } from "./screens/GameScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { LobbyView } from "./screens/LobbyView.tsx";
import { SplashScreen } from "./screens/SplashScreen.tsx";
import { TutorialScreen } from "./screens/TutorialScreen.tsx";
import { useGameStore } from "./store/gameStore.ts";

interface RoomRouteProps {
  code: string;
  onExit: () => void;
  onRoomSelected: (code: string) => void;
}

function RoomRoute({ code, onExit, onRoomSelected }: RoomRouteProps) {
  const state = useGameStore((s) => s.state);
  const room = useGameStore((s) => s.room);
  const connection = useGameStore((s) => s.connection);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const attemptedCode = useRef<string | null>(null);
  const name = window.localStorage.getItem("lasana-player-name")?.trim();
  const hasExpectedRoom = room?.code === code;

  useEffect(() => {
    if (!name || hasExpectedRoom || connection === "connecting" || attemptedCode.current === code)
      return;
    attemptedCode.current = code;
    joinRoom(code, name);
  }, [code, connection, hasExpectedRoom, joinRoom, name]);

  if (!name)
    return (
      <HomeScreen
        initialRoomCode={code}
        onRoomSelected={onRoomSelected}
        onRoomJoinDismiss={onExit}
        onTutorial={onExit}
      />
    );

  if (hasExpectedRoom && state)
    return (
      <ErrorBoundary key="game" title="¡Se nos quemó la partida!" onReset={onExit}>
        <GameScreen onExit={onExit} />
      </ErrorBoundary>
    );

  if (hasExpectedRoom)
    return (
      <ErrorBoundary key="lobby" title="¡Se nos cayó la sala!" onReset={onExit}>
        <LobbyView onExit={onExit} />
      </ErrorBoundary>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <img
        src="/assets/ui/icon_duelo_lasanas.png"
        alt=""
        aria-hidden="true"
        className="h-20 w-20 object-contain drop-shadow-[0_8px_0_rgba(74,40,16,0.65)]"
      />
      <h1 className="font-display text-2xl text-brand-cheese">Entrando en la sala {code}</h1>
      <p className="text-sm text-brand-bechamel/80">
        {connection === "error" ? "No hemos podido abrir la sala." : "Conectando con tus rivales…"}
      </p>
      {connection === "error" && (
        <Button variant="secondary" onClick={onExit}>
          Volver al inicio
        </Button>
      )}
    </div>
  );
}

export default function App() {
  const resetGame = useGameStore((s) => s.resetGame);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const [route, navigate] = useAppRouter();
  const [splashPhase, setSplashPhase] = useState<"enter" | "exit" | "done">("enter");

  function goHome(): void {
    leaveRoom();
    resetGame();
    navigate("/", true);
  }

  function selectRoom(code: string): void {
    navigate(roomPath(code));
  }

  useEffect(() => {
    const bootSplash = document.getElementById("boot-splash");
    bootSplash?.classList.add("boot-splash-hidden");
    const bootSplashTimer = window.setTimeout(() => bootSplash?.remove(), 400);
    const exitTimer = window.setTimeout(() => setSplashPhase("exit"), 3500);
    const finishTimer = window.setTimeout(() => {
      setSplashPhase("done");
    }, 4000);
    return () => {
      window.clearTimeout(bootSplashTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    if (route.kind === "room") {
      if (route.legacy) navigate(roomPath(route.code), true);
      return;
    }
    leaveRoom();
  }, [leaveRoom, navigate, route]);

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
    <div className="bg-brand-table">
      {splashPhase !== "done" ? (
        <SplashScreen phase={splashPhase} />
      ) : route.kind === "room" ? (
        <RoomRoute code={route.code} onExit={goHome} onRoomSelected={selectRoom} />
      ) : route.kind === "tutorial" ? (
        <ErrorBoundary key="tutorial" title="¡Se nos quemó el tutorial!" onReset={goHome}>
          <TutorialScreen onExit={goHome} />
        </ErrorBoundary>
      ) : route.kind === "notFound" ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="font-display text-3xl text-brand-cheese">Esta receta no existe</h1>
          <Button onClick={goHome}>Volver al inicio</Button>
        </div>
      ) : (
        <ErrorBoundary key="home" title="¡Algo salió mal!">
          <HomeScreen onRoomSelected={selectRoom} onTutorial={() => navigate("/tutorial")} />
        </ErrorBoundary>
      )}
    </div>
  );
}
