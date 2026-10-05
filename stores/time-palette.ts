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

export function paletteForHour(hour: number): PaletteId {
  if (hour >= 5 && hour < 10) return "dawn";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

type TimePaletteStore = {
  palette: PaletteId;
  /** True once the visitor picked a palette themselves ("time travel"). */
  overridden: boolean;
  setFromClock: (hour: number) => void;
  cycle: () => void;
  /** Flip between the day and night looks (what the sun / moon does). */
  toggleNight: () => void;
};

export const useTimePalette = create<TimePaletteStore>((set) => ({
  palette: "day",
  overridden: false,
  setFromClock: (hour) =>
    set((state) =>
      state.overridden ? state : { palette: paletteForHour(hour) },
    ),
  toggleNight: () =>
    set((state) => ({
      overridden: true,
      palette: state.palette === "night" ? "day" : "night",
    })),
  cycle: () =>
    set((state) => ({
      overridden: true,
      palette:
        paletteOrder[
          (paletteOrder.indexOf(state.palette) + 1) % paletteOrder.length
        ],
    })),
}));
