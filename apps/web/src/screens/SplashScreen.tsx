import { useEffect } from "react";
import { playSound } from "../lib/sound.ts";

interface SplashScreenProps {
  phase: "enter" | "exit";
}

export function SplashScreen({ phase }: SplashScreenProps) {
  useEffect(() => {
    playSound("splash");
  }, []);

  return (
    <main
      className={`splash-screen splash-screen-${phase} relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-table`}
      aria-label="Cargando ¡Lasaña!"
    >
      <div className="splash-burst absolute inset-0" aria-hidden="true" />
      <div className="splash-rays absolute inset-[-35%] opacity-70" aria-hidden="true" />
      <img
        src="/assets/ui/logo_lasana_game.png"
        alt="¡Lasaña!"
        className="splash-logo relative z-10 w-[min(86vw,30rem)] drop-shadow-[0_14px_0_rgba(74,40,16,0.7)]"
      />
    </main>
  );
}
