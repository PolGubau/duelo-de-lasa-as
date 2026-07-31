import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoomOptions } from "../../../../packages/protocol/src/index.ts";
import { applyAudioSettings } from "../lib/sound.ts";

export interface Settings {
  musicVolume: number;
  fxVolume: number;
  muted: boolean;
  defaultVisibility: RoomOptions["visibility"];
  haptics: boolean;
}

interface SettingsStore extends Settings {
  setMusicVolume: (value: number) => void;
  setFxVolume: (value: number) => void;
  toggleMute: () => void;
  setDefaultVisibility: (visibility: RoomOptions["visibility"]) => void;
  toggleHaptics: () => void;
}

const DEFAULTS: Settings = {
  musicVolume: 0.4,
  fxVolume: 0.8,
  muted: false,
  defaultVisibility: "public",
  haptics: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => {
      function sync(): void {
        const { musicVolume, fxVolume, muted, haptics } = get();
        applyAudioSettings({ musicVolume, fxVolume, muted, haptics });
      }
      return {
        ...DEFAULTS,
        setMusicVolume: (value) => {
          set({ musicVolume: value });
          sync();
        },
        setFxVolume: (value) => {
          set({ fxVolume: value });
          sync();
        },
        toggleMute: () => {
          set({ muted: !get().muted });
          sync();
        },
        setDefaultVisibility: (defaultVisibility) => set({ defaultVisibility }),
        toggleHaptics: () => {
          set({ haptics: !get().haptics });
          sync();
        },
      };
    },
    {
      name: "lasana-settings",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyAudioSettings({
          musicVolume: state.musicVolume,
          fxVolume: state.fxVolume,
          muted: state.muted,
          haptics: state.haptics,
        });
      },
    },
  ),
);
