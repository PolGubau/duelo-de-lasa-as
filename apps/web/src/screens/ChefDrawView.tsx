import type { GameState } from "@lasana/engine";
import { getChef } from "@lasana/engine";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardView } from "../components/CardView.tsx";
import { cn } from "../lib/cn.ts";
import { playSound, vibrate } from "../lib/sound.ts";
import { useGameStore } from "../store/gameStore.ts";

interface ChefDrawViewProps {
  state: GameState;
}

const CONFETTI_EMOJIS = ["🍅", "🧀", "🌿", "🥄", "🔥", "✨", "🧅"];

/** Ráfaga de partículas al revelar un chef, al estilo de un sobre de Balatro. */
function ConfettiBurst({ seed }: { seed: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (360 / 12) * i + ((seed * 37) % 30);
        const distance = 70 + ((i * 13 + seed * 7) % 50);
        const rad = (angle * Math.PI) / 180;
        return {
          emoji: CONFETTI_EMOJIS[(i + seed) % CONFETTI_EMOJIS.length]!,
          x: Math.cos(rad) * distance,
          y: Math.sin(rad) * distance,
          rotate: angle,
          delay: (i % 4) * 0.03,
        };
      }),
    [seed],
  );
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.1, rotate: p.rotate }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

export function ChefDrawView({ state }: ChefDrawViewProps) {
  const drawChef = useGameStore((s) => s.drawChef);
  const sessionId = useGameStore((s) => s.sessionId);
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const [burstSeed, setBurstSeed] = useState<number | null>(null);
  const seenChefs = useRef<Set<string>>(new Set());

  const me = state.players.find((p) => p.id === sessionId);
  const choices = me ? state.chefChoices[me.id] : undefined;
  const drawnCount = state.players.filter((p) => p.chefId).length;

  useEffect(() => {
    if (choices?.length) {
      setOpening(false);
      return;
    }
    if (me?.chefId && !seenChefs.current.has(me.id)) {
      seenChefs.current.add(me.id);
      setOpening(false);
      setBurstSeed(Date.now());
      playSound("chef");
      vibrate([12, 30, 18]);
      const timer = window.setTimeout(() => setBurstSeed(null), 900);
      return () => window.clearTimeout(timer);
    }
    for (const p of state.players) if (p.chefId) seenChefs.current.add(p.id);
  }, [choices, me, state.players]);

  /** Evita que el sobre se quede "abriendo" para siempre si la acción se rechaza. */
  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => setOpening(false), 4000);
    return () => window.clearTimeout(timer);
  }, [opening]);

  function handleDraw(): void {
    if (!me || me.chefId || choices?.length || opening) return;
    playSound("select");
    vibrate(10);
    setOpening(true);
    drawChef();
  }

  function chooseChef(chefId: string): void {
    if (opening) return;
    playSound("select");
    vibrate(10);
    setOpening(true);
    drawChef(chefId);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-6">
      <motion.h2
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="font-display text-2xl text-brand-cheese"
      >
        ¡Reparto de Chefs!
      </motion.h2>
      <p className="text-center text-sm text-brand-bechamel/80">
        Cada jugador elige uno de dos chefs. Su efecto se aplicará al puntuar.
      </p>

      <div className="flex gap-1.5" aria-hidden="true">
        {state.players.map((p) => (
          <motion.span
            key={p.id}
            className={cn(
              "h-2.5 w-2.5 rounded-full border border-brand-crust/60",
              p.chefId ? "bg-brand-cheese" : "bg-brand-bechamel/20",
            )}
            animate={p.chefId ? { scale: [0.6, 1.3, 1] } : {}}
            transition={{ duration: 0.35 }}
          />
        ))}
      </div>

      {me && (
        <div className="relative flex min-h-56 flex-col items-center justify-center gap-2">
          {burstSeed !== null && <ConfettiBurst seed={burstSeed} />}
          {!reduceMotion && (
            <div
              className="splash-rays pointer-events-none absolute h-128 w-lg opacity-20"
              aria-hidden="true"
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            {!me.chefId && choices ? (
              <motion.div
                key="choices"
                className="relative z-10 flex items-start justify-center gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {choices.map((chefId) => {
                  const chef = getChef(chefId);
                  return (
                    <div
                      key={chefId}
                      className="flex flex-col items-center"
                    >
                      <CardView
                        card={chef}
                        size="md"
                        hideInfo
                        onClick={() => chooseChef(chefId)}
                      />
                      <span className="mt-1 block max-w-22 text-center text-xs text-brand-cheese">
                        Elegir {chef.name}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            ) : !me.chefId ? (
              <motion.button
                key="pack"
                type="button"
                onClick={handleDraw}
                onHoverStart={!opening ? () => playSound("hover") : undefined}
                disabled={opening}
                className="relative z-10 h-48 w-32 cursor-pointer overflow-hidden rounded-2xl border-3 border-brand-crust shadow-card"
                style={{
                  background: "radial-gradient(circle at 50% 32%, #f2e9ff 0%, #7b2cbf 78%)",
                }}
                initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                animate={
                  opening
                    ? { opacity: 1, rotateY: [0, 180, 360], scale: [1, 1.08, 1] }
                    : reduceMotion
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : { opacity: 1, scale: 1, rotate: 0, y: [0, -8, 0] }
                }
                exit={{ opacity: 0, scale: 0.5, rotate: 8 }}
                whileHover={!opening ? { scale: 1.06, rotate: -2 } : undefined}
                whileTap={!opening ? { scale: 0.94 } : undefined}
                transition={
                  opening
                    ? { duration: 0.6, ease: "easeInOut" }
                    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/20"
                />
                <span className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                  👨‍🍳
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-brand-crust/85 py-1.5 text-center font-display text-xs text-brand-bechamel">
                  {opening ? "Abriendo…" : "Toca para sacar"}
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="revealed"
                className="relative z-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CardView card={getChef(me.chefId)} size="lg" hideInfo />
                <p className="max-w-xs text-center text-sm text-brand-cheese">
                  {getChef(me.chefId).description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-brand-bechamel/60">
        {drawnCount} / {state.players.length} chefs elegidos
      </p>

      <div className="flex w-full flex-col gap-2">
        <AnimatePresence initial={false}>
          {state.players.map((p, index) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2 transition-colors",
                p.chefId
                  ? "border-brand-basil/60 bg-brand-basil/10"
                  : "border-brand-crust bg-brand-table/60",
              )}
            >
              <span className="font-display">{p.name}</span>
              <AnimatePresence mode="wait" initial={false}>
                {p.chefId ? (
                  <motion.span
                    key="chef"
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-right text-sm text-brand-cheese"
                  >
                    {getChef(p.chefId).name} — {getChef(p.chefId).description}
                  </motion.span>
                ) : p.id === sessionId ? (
                  <motion.span
                    key="you"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-brand-cheese/80"
                  >
                    ¡Elige arriba!
                  </motion.span>
                ) : (
                  <motion.span
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="text-brand-bechamel/50"
                  >
                    Esperando a su jugador…
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
