import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../store/gameStore.ts";

const ICONS: Record<string, string> = {
  attack: "⚡",
  discard: "🃏",
  error: "⚠️",
  chef: "👨‍🍳",
  win: "🏆",
  score: "✨",
  positive: "✅",
};

export function FeedbackToast() {
  const feedback = useGameStore((s) => s.feedback);
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: -18, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className={`feedback-toast feedback-${feedback.cue}`}
          role="status"
        >
          <span className="text-xl">{ICONS[feedback.cue] ?? "✨"}</span>
          <span>{feedback.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
