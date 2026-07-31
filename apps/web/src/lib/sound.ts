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

// Bajo "walking" y melodía saltarina en modo swing, al estilo de una banda de
// dibujos animados de los años 30 (Cuphead): notas cortas, acentos y un
// pequeño golpe de platillo cada compás para dar sensación de ritmo vivo.
const BASS_NOTES = [130.81, 130.81, 164.81, 196.0, 174.61, 174.61, 146.83, 196.0];
const MELODY_NOTES = [523.25, 587.33, 659.25, 587.33, 698.46, 659.25, 587.33, 523.25];

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

/** Tema animado tipo swing sintetizado con la Web Audio API. */
function startSynthMusic(): void {
  let step = 0;
  const tick = () => {
    const audio = getContext();
    if (!audio) return;
    const now = audio.currentTime;
    const swing = step % 2 === 0 ? 1 : 0.65;
    const bass = BASS_NOTES[step % BASS_NOTES.length]!;
    const melody = MELODY_NOTES[step % MELODY_NOTES.length]!;
    tone(audio, bass, now, 0.32 * swing, 0.05 * settings.musicVolume, "square");
    tone(audio, melody, now + 0.02, 0.26 * swing, 0.045 * settings.musicVolume, "triangle");
    if (step % 4 === 2) {
      tone(audio, 2200, now, 0.045, 0.02 * settings.musicVolume, "square");
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
