"use client";

import { flagColors } from "@/data/journey";
import { getThreadSamples } from "./thread";

// Flags hang only on the last stretch of the trail, the run after the habit's
// git graph into "let's look at the flags i planted" (canvas vw).
const STRETCHES: [from: number, to: number][] = [[494, 512]];
const SPACING = 4.6;

type Flag = { x: number; y: number; color: string; delay: number };

// Placed from the same samples the thread is drawn with, so every flag hangs
// exactly from the line. Flags hang straight down like real cloth, so no
// per-screen tilt is needed and server and client agree.
function buildFlags(): Flag[] {
  const { xs, ys } = getThreadSamples();
  const flags: Flag[] = [];
  let index = 0;
  for (const [from, to] of STRETCHES) {
    for (let x = from; x <= to; x += SPACING) {
      let i = 0;
      while (i < xs.length - 1 && (xs[i] ?? 0) / 10 < x) i += 1;
      flags.push({
        x: (xs[i] ?? 0) / 10,
        y: (ys[i] ?? 0) / 10,
        color: flagColors[index % flagColors.length] ?? "#c43a30",
        delay: (index % 7) * 0.35,
      });
      index += 1;
    }
  }
  return flags;
}

const FLAGS = buildFlags();

export function PrayerFlags() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {FLAGS.map((flag, index) => (
        <div
          key={index}
          className="prayer-flag absolute -translate-x-1/2"
          data-at={flag.x}
          data-mode="thread"
          style={{ left: `${flag.x}vw`, top: `calc(${flag.y}cqh + 1px)`, "--flag-delay": `${(index % 5) * 0.04}s`, "--flag-sway": `-${flag.delay}s` } as React.CSSProperties}
        >
          <span style={{ background: flag.color, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.18)" }} />
        </div>
      ))}
    </div>
  );
}
