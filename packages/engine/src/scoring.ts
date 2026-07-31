import { getChef } from "./cards.ts";
import type { GameState, PlayerScore, PlayerState, ScoreStep } from "./types.ts";

/**
 * Evalúa la puntuación de una lasaña estrictamente de abajo hacia arriba:
 * cada capa (propia o condimento rival arrojado) es un paso sobre el acumulado,
 * en el orden exacto en que ocurrió. El chef aplica su efecto al final.
 */
export function scorePlayer(player: PlayerState): PlayerScore {
  const steps: ScoreStep[] = [];
  let acc = 0;
  for (const layer of player.lasagna) {
    const before = acc;
    const after = layer.op === "add" ? acc + layer.value : acc * layer.value;
    steps.push({
      label: `${layer.cardName}${layer.origin === "opponent" ? " (rival)" : ""}`,
      op: layer.op,
      value: layer.value,
      before,
      after,
    });
    acc = after;
  }

  let chefStep: ScoreStep | undefined;
  if (player.chefId) {
    const chef = getChef(player.chefId);
    const before = acc;
    switch (chef.effect.kind) {
      case "multiplyTotal": {
        acc = before * chef.effect.factor;
        chefStep = {
          label: chef.name,
          op: "multiply",
          value: chef.effect.factor,
          before,
          after: acc,
        };
        break;
      }
      case "addFlat": {
        acc = before + chef.effect.value;
        chefStep = { label: chef.name, op: "add", value: chef.effect.value, before, after: acc };
        break;
      }
      case "addPerLayerType": {
        const { subtype, value } = chef.effect;
        const count = player.lasagna.filter(
          (l) => l.origin === "own" && l.subtype === subtype,
        ).length;
        const bonus = count * value;
        acc = before + bonus;
        chefStep = { label: chef.name, op: "add", value: bonus, before, after: acc };
        break;
      }
      case "addPerCondimentPlayed": {
        const count = player.lasagna.filter(
          (l) => l.origin === "own" && l.subtype === undefined,
        ).length;
        const bonus = count * chef.effect.value;
        acc = before + bonus;
        chefStep = { label: chef.name, op: "add", value: bonus, before, after: acc };
        break;
      }
    }
  }

  return { playerId: player.id, steps, chefStep, total: acc };
}

export function scoreGame(state: GameState): PlayerScore[] {
  return state.players.map(scorePlayer);
}

export function winnerOf(scores: PlayerScore[]): string | undefined {
  if (scores.length === 0) return undefined;
  return scores.reduce((best, s) => (s.total > best.total ? s : best), scores[0]!).playerId;
}
