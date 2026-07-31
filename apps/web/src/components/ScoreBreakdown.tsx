import type { PlayerScore, PlayerState } from "@lasana/engine";
import { motion } from "framer-motion";
import { Avatar } from "./Avatar.tsx";

interface ScoreBreakdownProps {
  player: PlayerState;
  score: PlayerScore;
  /** Nº de capas ya reveladas en la calculadora final; sin valor se muestra todo. */
  revealed?: number;
}

export function ScoreBreakdown({ player, score, revealed }: ScoreBreakdownProps) {
  const steps = revealed === undefined ? score.steps : score.steps.slice(0, revealed);
  const chefVisible =
    Boolean(score.chefStep) && (revealed === undefined || revealed > score.steps.length);
  const total = chefVisible ? score.total : (steps.at(-1)?.after ?? 0);

  return (
    <div className="flex flex-col gap-1 rounded-xl border-2 border-brand-crust bg-brand-table/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar id={player.id} name={player.name} size="sm" />
          <span className="font-display">{player.name}</span>
        </div>
        <motion.span
          key={total}
          initial={{ scale: 1.6, color: "#FFB703" }}
          animate={{ scale: 1, color: "#FFB703" }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="font-display text-lg text-brand-cheese"
        >
          {total}
        </motion.span>
      </div>
      <div className="flex flex-col gap-0.5 text-[11px] text-brand-bechamel/70">
        {steps.map((step, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="truncate">{step.label}</span>
            <span className="shrink-0">
              {step.before} {step.op === "add" ? "+" : "×"} {step.value} = {step.after}
            </span>
          </div>
        ))}
        {score.chefStep && chefVisible && (
          <div className="flex justify-between gap-2 text-brand-cheese">
            <span className="truncate">{score.chefStep.label} (chef)</span>
            <span className="shrink-0">
              {score.chefStep.before} {score.chefStep.op === "add" ? "+" : "×"}{" "}
              {score.chefStep.value} = {score.chefStep.after}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
