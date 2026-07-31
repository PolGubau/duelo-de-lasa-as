import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Registra el service worker que permite instalar la app y jugar offline el tutorial.
 *
 * Solo se registra en producción: en desarrollo, su caché "cache-first" intercepta
 * también los módulos que sirve el servidor de Vite (con hashes que cambian al
 * reoptimizar dependencias), lo que acaba mezclando versiones antiguas y nuevas de
 * React en la misma página y provoca errores de "Invalid hook call".
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

/** Expone el prompt nativo de instalación mientras la app no esté instalada. */
export function useInstallPrompt(): { canInstall: boolean; install: () => void } {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (raw: Event) => {
      raw.preventDefault();
      setEvent(raw as InstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return {
    canInstall: event !== null,
    install: () => {
      if (!event) return;
      void event.prompt().then(() => setEvent(null));
    },
  };
}
