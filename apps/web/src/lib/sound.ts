export type SoundCue =
  | "select"
  | "hover"
  | "deal"
  | "whoosh"
  | "phase"
  | "close"
  | "play"
  | "positive"
  | "attack"
  | "discard"
  | "turn"
  | "chef"
  | "trade"
  | "score"
  | "win"
  | "error"
  | "splash"
  | "pop";

export interface AudioSettings {
  musicVolume: number;
  fxVolume: number;
  muted: boolean;
  haptics: boolean;
}

let context: AudioContext | null = null;
let settings: AudioSettings = { musicVolume: 0.4, fxVolume: 0.8, muted: false, haptics: true };
let musicTimer: number | null = null;
let musicAudioEl: HTMLAudioElement | null = null;

/** Ruta de la pista de música personalizada; si no existe, se usa el tema sintetizado. */
const CUSTOM_TRACK_URL = "/assets/music/theme.mp3";

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

/** Sincroniza el motor de audio con las preferencias guardadas del jugador. */
export function applyAudioSettings(next: AudioSettings): void {
  settings = next;
  if (musicAudioEl) {
    musicAudioEl.volume = settings.musicVolume;
    musicAudioEl.muted = settings.muted;
  }
  if (settings.muted || settings.musicVolume <= 0) {
    if (!musicAudioEl) stopMusic();
  } else if (musicTimer !== null && !musicAudioEl) {
    startMusic();
  }
}

/** Vibración corta en móviles; respeta el ajuste de háptica. */
export function vibrate(pattern: number | number[] = 12): void {
  if (!settings.haptics || typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

interface BackgroundMusicPhrase {
  bass: readonly (number | null)[];
  melody: readonly (number | null)[];
  chords: readonly (readonly number[])[];
  cymbalAccents: readonly number[];
}

/**
 * Frases de 16 corcheas para que el tema tenga estrofas, respuesta y puente,
 * en vez de repetir el mismo compás. Los silencios dejan respirar la melodía.
 */
export const BACKGROUND_MUSIC_PHRASES: readonly BackgroundMusicPhrase[] = [
  {
    bass: [130.81, 130.81, 164.81, 196, 130.81, null, 164.81, 196, 174.61, 174.61, 220, 196, 146.83, null, 196, 146.83],
    melody: [523.25, 587.33, 659.25, null, 587.33, 698.46, 659.25, null, 783.99, 698.46, 659.25, 587.33, 523.25, null, 587.33, 523.25],
    chords: [[261.63, 329.63, 392], [246.94, 293.66, 369.99], [220, 261.63, 329.63], [174.61, 261.63, 349.23]],
    cymbalAccents: [2, 6, 10, 14],
  },
  {
    bass: [130.81, null, 196, 164.81, 220, 220, 196, null, 174.61, 174.61, 146.83, 196, 130.81, 130.81, 196, null],
    melody: [659.25, 783.99, 880, 783.99, 659.25, null, 587.33, 659.25, 698.46, 783.99, 698.46, null, 659.25, 587.33, 523.25, 659.25],
    chords: [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 261.63, 349.23], [196, 246.94, 293.66]],
    cymbalAccents: [2, 7, 10, 15],
  },
  {
    bass: [174.61, 174.61, 220, 261.63, 196, null, 246.94, 293.66, 130.81, 130.81, 164.81, 196, 146.83, 174.61, 196, null],
    melody: [698.46, 783.99, 880, null, 987.77, 880, 783.99, 698.46, 659.25, null, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25],
    chords: [[174.61, 261.63, 349.23], [196, 246.94, 293.66], [261.63, 329.63, 392], [146.83, 220, 293.66]],
    cymbalAccents: [3, 6, 11, 14],
  },
  {
    bass: [220, null, 261.63, 220, 146.83, 146.83, 174.61, 220, 196, null, 246.94, 293.66, 130.81, 196, 164.81, 130.81],
    melody: [880, 783.99, 698.46, null, 783.99, 880, 987.77, 880, 783.99, 698.46, 659.25, null, 587.33, 659.25, 698.46, 783.99],
    chords: [[220, 261.63, 329.63], [146.83, 220, 293.66], [196, 246.94, 293.66], [261.63, 329.63, 392]],
    cymbalAccents: [2, 5, 10, 13],
  },
];

const PHRASE_ORDER = [0, 1, 0, 2, 0, 1, 3, 2] as const;

/** Intenta reproducir una pista propia; si no existe, activa el tema sintetizado. */
export function startMusic(): void {
  stopMusic();
  if (settings.muted || settings.musicVolume <= 0) return;
  if (startCustomTrack()) return;
  startSynthMusic();
}

function startCustomTrack(): boolean {
  if (typeof Audio === "undefined") return false;
  const audio = new Audio(CUSTOM_TRACK_URL);
  audio.loop = true;
  audio.volume = settings.musicVolume;
  audio.addEventListener(
    "error",
    () => {
      if (musicAudioEl !== audio) return;
      musicAudioEl = null;
      startSynthMusic();
    },
    { once: true },
  );
  audio.play().catch(() => {
    // Reproducción automática bloqueada; se reintentará en la próxima interacción.
  });
  musicAudioEl = audio;
  return true;
}

/** Tema animado de swing sintetizado, con una estructura AABA ampliada. */
function startSynthMusic(): void {
  let step = 0;
  const tick = () => {
    const audio = getContext();
    if (!audio) return;
    const now = audio.currentTime;
    const phraseStep = step % 16;
    const phrasePosition = Math.floor(step / 16) % PHRASE_ORDER.length;
    const phrase = BACKGROUND_MUSIC_PHRASES[PHRASE_ORDER[phrasePosition]!]!;
    const swing = phraseStep % 2 === 0 ? 1 : 0.65;
    const bass = phrase.bass[phraseStep]!;
    const melody = phrase.melody[phraseStep]!;

    if (bass !== null) {
      tone(audio, bass, now, 0.3 * swing, 0.047 * settings.musicVolume, "square");
    }
    if (melody !== null) {
      tone(audio, melody, now + 0.025, 0.24 * swing, 0.042 * settings.musicVolume, "triangle");
    }
    if (phraseStep % 4 === 0) {
      const chord = phrase.chords[phraseStep / 4]!;
      for (const note of chord) {
        tone(audio, note, now + 0.01, 0.5, 0.012 * settings.musicVolume, "sine");
      }
    }
    if (phraseStep === 0 || phraseStep === 8) {
      tone(audio, 73.42, now, 0.12, 0.025 * settings.musicVolume, "sine");
    }
    if (phrase.cymbalAccents.includes(phraseStep)) {
      tone(audio, 2200, now, 0.04, 0.016 * settings.musicVolume, "square");
    }
    step += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 260);
}

export function stopMusic(): void {
  if (musicAudioEl) {
    musicAudioEl.pause();
    musicAudioEl = null;
  }
  if (musicTimer === null) return;
  window.clearInterval(musicTimer);
  musicTimer = null;
}

function tone(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "triangle",
) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSound(cue: SoundCue): void {
  if (settings.muted || settings.fxVolume <= 0) return;
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;
  const note = (
    frequency: number,
    offset: number,
    duration = 0.14,
    volume = 0.055,
    type?: OscillatorType,
  ) => tone(audio, frequency, now + offset, duration, volume * settings.fxVolume, type);
  switch (cue) {
    case "select":
      note(420, 0, 0.08, 0.035);
      break;
    case "close":
      note(380, 0, 0.07, 0.03);
      note(260, 0.05, 0.1, 0.03);
      break;
    case "play":
      note(280, 0, 0.12);
      note(420, 0.08, 0.18);
      break;
    case "splash":
      note(220, 0, 0.16, 0.04, "sine");
      note(330, 0.08, 0.16, 0.045, "triangle");
      note(660, 0.18, 0.24, 0.055, "triangle");
      note(990, 0.27, 0.18, 0.035, "sine");
      break;
    case "pop":
      note(620, 0, 0.06, 0.035, "triangle");
      note(980, 0.045, 0.1, 0.03, "sine");
      break;
    case "positive":
      note(440, 0, 0.12);
      note(660, 0.1, 0.2);
      break;
    case "attack":
      note(180, 0, 0.12, 0.07);
      note(120, 0.1, 0.22, 0.06);
      break;
    case "discard":
      note(360, 0, 0.1, 0.04);
      note(220, 0.08, 0.18, 0.04);
      break;
    case "turn":
      note(330, 0, 0.1);
      note(494, 0.12, 0.18);
      break;
    case "chef":
      note(392, 0, 0.12);
      note(523, 0.1, 0.12);
      note(784, 0.2, 0.24);
      break;
    case "trade":
      note(330, 0, 0.12);
      note(415, 0.11, 0.12);
      note(330, 0.22, 0.18);
      break;
    case "score":
      note(392, 0, 0.11);
      note(494, 0.1, 0.11);
      note(659, 0.2, 0.24);
      break;
    case "win":
      note(523, 0, 0.12, 0.06);
      note(659, 0.12, 0.12, 0.06);
      note(784, 0.24, 0.32, 0.07);
      break;
    case "error":
      note(150, 0, 0.18, 0.06, "sawtooth");
      note(110, 0.12, 0.22, 0.05, "sawtooth");
      break;
  }
}
