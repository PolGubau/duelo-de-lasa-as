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

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

/** Sincroniza el motor de audio con las preferencias guardadas del jugador. */
export function applyAudioSettings(next: AudioSettings): void {
  settings = next;
  if (settings.muted || settings.musicVolume <= 0) {
    stopMusic();
  } else if (musicTimer !== null) {
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
  percussionAccents: readonly number[];
}

/**
 * Tema original de trattoria en re menor: cuatro frases con melodía de acordeón,
 * bajo de vals y silencios para que la partida conserve protagonismo.
 */
export const BACKGROUND_MUSIC_PHRASES: readonly BackgroundMusicPhrase[] = [
  {
    bass: [146.83, null, 146.83, 110, null, 110, 98, null, 98, 110, null, 110, 146.83, null, 146.83, 110],
    melody: [587.33, 698.46, 880, null, 880, 783.99, 698.46, null, 659.25, 698.46, 783.99, null, 587.33, 659.25, 698.46, null],
    chords: [[293.66, 349.23, 440], [196, 233.08, 293.66], [220, 277.18, 329.63], [174.61, 220, 261.63]],
    percussionAccents: [2, 5, 8, 11, 14],
  },
  {
    bass: [110, null, 110, 146.83, null, 146.83, 130.81, null, 130.81, 110, null, 110, 98, null, 98, 110],
    melody: [783.99, 880, 1046.5, 880, 783.99, null, 698.46, 783.99, 880, null, 783.99, 698.46, 659.25, 587.33, 659.25, null],
    chords: [[220, 277.18, 329.63], [293.66, 349.23, 440], [261.63, 329.63, 392], [196, 233.08, 293.66]],
    percussionAccents: [1, 5, 7, 11, 13],
  },
  {
    bass: [146.83, null, 146.83, 130.81, null, 130.81, 110, null, 110, 98, null, 98, 110, null, 110, 146.83],
    melody: [698.46, 783.99, 880, null, 1046.5, 987.77, 880, 783.99, 698.46, null, 783.99, 880, 987.77, null, 880, 783.99],
    chords: [[293.66, 349.23, 440], [261.63, 329.63, 392], [220, 277.18, 329.63], [196, 233.08, 293.66]],
    percussionAccents: [2, 4, 8, 10, 14],
  },
  {
    bass: [98, null, 98, 110, null, 110, 146.83, null, 146.83, 110, null, 110, 146.83, null, 146.83, null],
    melody: [783.99, 698.46, 659.25, null, 698.46, 783.99, 880, 783.99, 698.46, null, 659.25, 587.33, 587.33, 659.25, 698.46, 587.33],
    chords: [[196, 233.08, 293.66], [220, 277.18, 329.63], [293.66, 349.23, 440], [293.66, 349.23, 440]],
    percussionAccents: [1, 4, 7, 10, 13],
  },
];

const PHRASE_ORDER = [0, 1, 0, 2, 0, 1, 3, 2] as const;

/** Inicia el tema original de trattoria tras una interacción del jugador. */
export function startMusic(): void {
  stopMusic();
  if (settings.muted || settings.musicVolume <= 0) return;
  startSynthMusic();
}

/** Vals ligero de acordeón, guitarra y pandereta, generado con Web Audio. */
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
      tone(audio, bass, now, 0.34 * swing, 0.05 * settings.musicVolume, "triangle");
    }
    if (melody !== null) {
      accordionTone(audio, melody, now + 0.02, 0.28 * swing, 0.036 * settings.musicVolume);
    }
    if (phraseStep % 4 === 0) {
      const chord = phrase.chords[phraseStep / 4]!;
      for (const note of chord) {
        tone(audio, note, now + 0.01, 0.38, 0.011 * settings.musicVolume, "triangle");
      }
    }
    if (phraseStep === 0 || phraseStep === 8) {
      tone(audio, 74, now, 0.08, 0.018 * settings.musicVolume, "sine");
    }
    if (phrase.percussionAccents.includes(phraseStep)) {
      tone(audio, 2600, now, 0.035, 0.012 * settings.musicVolume, "square");
    }
    step += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 260);
}

export function stopMusic(): void {
  if (musicTimer === null) return;
  window.clearInterval(musicTimer);
  musicTimer = null;
}

function accordionTone(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
) {
  tone(audio, frequency, start, duration, volume * 0.42, "sawtooth", -7);
  tone(audio, frequency, start, duration, volume * 0.42, "sawtooth", 7);
  tone(audio, frequency, start, duration, volume * 0.24, "triangle");
}

function tone(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "triangle",
  detune = 0,
) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
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
