import { playSound, startMusic, stopMusic, vibrate } from "../lib/sound.ts";
import { useSettingsStore } from "../store/settingsStore.ts";
import { Button } from "./Button.tsx";
import { Modal } from "./Modal.tsx";

interface OptionsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-brand-cheese">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-brand-tomato"
      />
    </label>
  );
}

export function OptionsDialog({ open, onClose }: OptionsDialogProps) {
  const settings = useSettingsStore();

  return (
    <Modal open={open} title="Opciones" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Slider
          label="Música"
          value={settings.musicVolume}
          onChange={(value) => {
            settings.setMusicVolume(value);
            if (value > 0 && !settings.muted) startMusic();
            else stopMusic();
          }}
        />
        <Slider
          label="Efectos"
          value={settings.fxVolume}
          onChange={(value) => {
            settings.setFxVolume(value);
            playSound("select");
          }}
        />

        <div className="flex items-center justify-between text-sm">
          <span>Silenciar todo</span>
          <Button
            size="sm"
            variant={settings.muted ? "danger" : "ghost"}
            onClick={() => {
              settings.toggleMute();
              if (settings.muted) startMusic();
              else stopMusic();
            }}
          >
            {settings.muted ? "Silenciado" : "Con sonido"}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Visibilidad por defecto</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={settings.defaultVisibility === "public" ? "secondary" : "ghost"}
              onClick={() => settings.setDefaultVisibility("public")}
            >
              Visible
            </Button>
            <Button
              size="sm"
              variant={settings.defaultVisibility === "secret" ? "secondary" : "ghost"}
              onClick={() => settings.setDefaultVisibility("secret")}
            >
              Oculta
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Vibración háptica</span>
          <Button
            size="sm"
            variant={settings.haptics ? "secondary" : "ghost"}
            onClick={() => {
              settings.toggleHaptics();
              vibrate(20);
            }}
          >
            {settings.haptics ? "Activada" : "Desactivada"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
