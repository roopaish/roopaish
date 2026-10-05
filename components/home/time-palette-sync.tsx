"use client";

import { palettes, useTimePalette } from "@/stores/time-palette";
import { useEffect } from "react";

/** Colours follow the visitor's clock (dawn, day, dusk, night). */
export default function TimePaletteSync() {
  const palette = useTimePalette((state) => state.palette);
  const setFromClock = useTimePalette((state) => state.setFromClock);

  useEffect(() => {
    const update = () => setFromClock(new Date().getHours());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [setFromClock]);

  useEffect(() => {
    const root = document.documentElement;
    const { paper, ink } = palettes[palette];
    root.style.setProperty("--paper", paper);
    root.style.setProperty("--ink", ink);
    root.style.colorScheme = palette === "night" ? "dark" : "light";
  }, [palette]);

  return null;
}
