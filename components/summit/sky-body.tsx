"use client";

import { cn } from "@/lib/utils";
import { useTimePalette } from "@/stores/time-palette";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

const RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

// The drawing itself. `night` picks the moon; it morphs between the two. `tight`
// crops the view to the rays' reach, so it fills its box edge to edge.
function SkyIcon({ night, tight = false }: { night: boolean; tight?: boolean }) {
  const reduce = useReducedMotion();
  const maskId = useId();
  const transition = reduce ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.25, 1] as const };
  return (
    <motion.svg
      aria-hidden="true"
      viewBox={tight ? "4 4 56 56" : "0 0 64 64"}
      className="size-full"
      initial={false}
      animate={{ rotate: night ? -25 : 0 }}
      transition={transition}
      style={{ overflow: tight ? "hidden" : "visible" }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="white" />
          {/* slides over the face at night, leaving a crescent; parked off to the side by day */}
          <motion.circle initial={false} animate={night ? { cx: 39, cy: 25, r: 13 } : { cx: 74, cy: 4, r: 13 }} transition={transition} fill="black" />
        </mask>
      </defs>
      <motion.g initial={false} animate={{ opacity: night ? 0 : 1, scale: night ? 0.55 : 1 }} transition={transition} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {RAYS.map((angle) => (
          <line key={angle} x1={32 + Math.cos(angle) * 19} y1={32 + Math.sin(angle) * 19} x2={32 + Math.cos(angle) * 26} y2={32 + Math.sin(angle) * 26} stroke="#f2b134" strokeWidth="3" strokeLinecap="round" />
        ))}
      </motion.g>
      <motion.circle
        cx="32"
        cy="32"
        mask={`url(#${maskId})`}
        initial={false}
        animate={{ r: night ? 15 : 12.5, fill: night ? "#e5e7eb" : "#f2b134" }}
        transition={transition}
      />
    </motion.svg>
  );
}

// The sun by day and a crescent moon at night, hanging in the sky above the
// range. When the palette changes they morph into each other: the rays draw in,
// a dark disc slides over the face to carve the crescent, the colour cools and
// the whole thing turns a little.
export function SkyBody({ className }: { className?: string }) {
  const night = useTimePalette((state) => state.palette === "night");
  const toggleNight = useTimePalette((state) => state.toggleNight);
  return (
    <button
      type="button"
      onClick={toggleNight}
      aria-label={night ? "Switch to day" : "Switch to night"}
      data-cursor={night ? "bring back the sun." : "lights out."}
      className={cn("cursor-pointer rounded-full transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40", className)}
    >
      <SkyIcon night={night} />
    </button>
  );
}

// The same toggle as a key on the keyboard (phones): it sits beside the
// display and presses down like the other keys.
export function SkyKey() {
  const night = useTimePalette((state) => state.palette === "night");
  const toggleNight = useTimePalette((state) => state.toggleNight);
  return (
    <button type="button" onClick={toggleNight} aria-label={night ? "Switch to day" : "Switch to night"} className="kb-key relative cursor-pointer">
      {/* fills the key with a 2px margin and stays inside it */}
      <span className="pointer-events-none absolute inset-0 block overflow-hidden rounded-[inherit] p-0.5">
        <SkyIcon night={night} tight />
      </span>
    </button>
  );
}
