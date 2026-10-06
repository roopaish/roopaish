import { create } from "zustand";

export type PaletteId = "dawn" | "day" | "dusk" | "night";

export const palettes: Record<
  PaletteId,
  { paper: string; ink: string; label: string }
> = {
  dawn: { paper: "#ffffff", ink: "#1f1a14", label: "early morning" },
  day: { paper: "#ffffff", ink: "#111111", label: "daytime" },
  dusk: { paper: "#fffdfb", ink: "#2b1c16", label: "evening" },
  night: { paper: "#121211", ink: "#ecebe6", label: "night" },
};

export const paletteOrder: PaletteId[] = ["dawn", "day", "dusk", "night"];

type TimePaletteStore = {
  palette: PaletteId;
  cycle: () => void;
  /** Flip between the day and night looks (what the sun / moon does). */
  toggleNight: () => void;
};

export const useTimePalette = create<TimePaletteStore>((set) => ({
  palette: "day",
  toggleNight: () =>
    set((state) => ({
      palette: state.palette === "night" ? "day" : "night",
    })),
  cycle: () =>
    set((state) => ({
      palette:
        paletteOrder[
          (paletteOrder.indexOf(state.palette) + 1) % paletteOrder.length
        ],
    })),
}));
