import { useEffect, useState } from "react";
import { playSound } from "../lib/sound.ts";

interface SplashScreenProps {
  phase: "enter" | "exit";
}

export function SplashScreen({ phase }: SplashScreenProps) {
  const messages = [
    "Precalentando el horno",
    "Rallando el queso de los rivales",
    "Colocando las capas perfectas",
    "Untando la salsa con cuidado",
    "Buscando una mesa libre",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    playSound("splash");
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length);
    }, 650);
    return () => window.clearInterval(timer);
  }, [messages.length]);

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
      <p className="splash-copy" aria-live="polite">
        {messages[messageIndex]}
        <span className="splash-dots" aria-hidden="true" />
      </p>
    </main>
  );
}
