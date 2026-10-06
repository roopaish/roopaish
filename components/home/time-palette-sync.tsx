"use client";

import { palettes, useTimePalette } from "@/stores/time-palette";
import { useEffect } from "react";

/** Applies the chosen palette's colours to the page. It never changes on its own. */
export default function TimePaletteSync() {
  const palette = useTimePalette((state) => state.palette);

  useEffect(() => {
    const root = document.documentElement;
    const { paper, ink } = palettes[palette];
    root.style.setProperty("--paper", paper);
    root.style.setProperty("--ink", ink);
    root.style.colorScheme = palette === "night" ? "dark" : "light";
  }, [palette]);

  return null;
}
