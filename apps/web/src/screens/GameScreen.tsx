import { motion } from "framer-motion";
import { ActionSplash } from "../components/ActionSplash.tsx";
import { FeedbackToast } from "../components/FeedbackToast.tsx";
import { useGameStore } from "../store/gameStore.ts";
import { ChefDrawView } from "./ChefDrawView.tsx";
import { FinishedView } from "./FinishedView.tsx";
import { PlayingView } from "./PlayingView.tsx";
import { ScoringView } from "./ScoringView.tsx";
import { TradingView } from "./TradingView.tsx";

export function GameScreen() {
  const state = useGameStore((s) => s.state)!;
  const error = useGameStore((s) => s.error);
  const clearError = useGameStore((s) => s.clearError);
  const feedback = useGameStore((s) => s.feedback);
  /** Sacudida de pantalla cuando alguien lanza un condimento arrojable. */
  const shake = feedback?.cue === "attack";

  return (
    <motion.div
      className="h-dvh overflow-hidden"
      key={shake ? feedback.id : "calm"}
      animate={shake ? { x: [0, -10, 9, -6, 4, 0], y: [0, 5, -4, 3, 0, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FeedbackToast />
      <ActionSplash />
      {error && (
        <div className="fixed inset-x-0 top-14 z-40 mx-auto flex max-w-lg items-center justify-between rounded-xl border-2 border-brand-tomato bg-brand-tomato/90 px-4 py-2 text-sm">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="font-display text-brand-cheese">
            ✕
          </button>
        </div>
      )}
      {state.status === "playing" && <PlayingView state={state} />}
      {state.status === "chefDraw" && <ChefDrawView state={state} />}
      {state.status === "trading" && <TradingView state={state} />}
      {state.status === "scoring" && <ScoringView state={state} />}
      {state.status === "finished" && <FinishedView state={state} />}
    </motion.div>
  );
}
