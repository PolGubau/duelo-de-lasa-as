import type { GameStatus, Phase } from "@lasana/engine";

export interface PhaseInfo {
  /** Nombre corto que se muestra en la cabecera. */
  label: string;
  icon: string;
  /** Explicación que aparece al pulsar el botón de ayuda de la cabecera. */
  help: string;
  /** Color de acento (variable CSS del tema) asociado a la fase. */
  accent: string;
}

export const PHASE_INFO: Record<Phase, PhaseInfo> = {
  relleno: {
    label: "Relleno",
    icon: "🥘",
    help: "Es el turno del relleno: solo puedes colocar ingredientes de relleno en tu lasaña. Los condimentos sí se pueden usar o lanzar en cualquier fase.",
    accent: "var(--color-brand-tomato)",
  },
  bechamel: {
    label: "Bechamel",
    icon: "🥛",
    help: "Toca la bechamel: solo entran cartas de bechamel. Ojo con la bechamel quemada, resta puntos a quien la coloque.",
    accent: "var(--color-brand-bechamel)",
  },
  pasta: {
    label: "Pasta",
    icon: "🍝",
    help: "Fase de pasta: cierras la capa con una lámina de pasta. Después de la pasta empieza una ronda nueva por el relleno.",
    accent: "var(--color-brand-cheese)",
  },
};

export const STATUS_INFO: Record<Exclude<GameStatus, "playing">, PhaseInfo> = {
  setup: {
    label: "Preparando",
    icon: "⏳",
    help: "La partida se está preparando.",
    accent: "var(--color-brand-basil)",
  },
  chefDraw: {
    label: "Chefs",
    icon: "👨‍🍳",
    help: "Cada jugador roba un chef al azar. El efecto del chef se aplica al calcular la puntuación final.",
    accent: "var(--color-brand-basil)",
  },
  trading: {
    label: "Trueque",
    icon: "🤝",
    help: "Podéis intercambiar chefs entre jugadores. Si a nadie le convence su chef, es el momento de negociar.",
    accent: "var(--color-brand-sauce)",
  },
  scoring: {
    label: "Puntuación",
    icon: "🧮",
    help: "La lasaña se calcula de abajo arriba: cada capa suma o multiplica sobre el total acumulado, y al final se aplica el chef.",
    accent: "var(--color-brand-cheese)",
  },
  finished: {
    label: "Final",
    icon: "🏆",
    help: "Partida terminada: gana quien tenga la lasaña con más puntos.",
    accent: "var(--color-brand-cheese)",
  },
};

/** Metadatos de la fase o estado en curso, para cabecera y avisos. */
export function phaseInfoFor(status: GameStatus, phase: Phase): PhaseInfo {
  return status === "playing" ? PHASE_INFO[phase] : STATUS_INFO[status];
}
