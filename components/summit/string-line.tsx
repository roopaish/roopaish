"use client";

import { useEffect, useRef } from "react";
import { useIntroTyped } from "./intro-state";
import { CABLE_DRAW_MS } from "./timing";
import { CANVAS_TRAVEL_VW, CANVAS_VW, CABLE, getThreadSamples, THREAD } from "./thread";

// While scrolling, the string's tip is anchored to ~55% of the viewport width,
// so the freshly drawn thread always stays on screen instead of lagging behind.
export const TIP_SCREEN_ANCHOR = 0.55;
// How quickly the story catches up with the scrollbar each frame (0–1).
export const SCROLL_EASE = 0.085;
// Content sharpens in as it enters from the right edge: it's revealed once
// its x is this far (vw) inside the screen, so it's clear by the time you read it.
export const REVEAL_INSET = 4;

export type Subscribe = (listen: (progress: number) => void) => () => void;

export function StringLine({ subscribe }: { subscribe: Subscribe }) {
  // The cable waits for the keyboard to finish typing its greeting.
  const typed = useIntroTyped();
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const { xs, lengths, total } = getThreadSamples();
    const count = xs.length - 1;

    const draw = (progress: number) => {
    // Where the tip should sit: viewport's left edge (in viewBox units) plus
    // 55% of the visible width (1000 units).
    // Over the last stretch the tip runs ahead of its anchor, so the thread
    // reaches the button at the very end instead of stopping mid-screen.
    const catchUp = Math.max(0, (progress - 0.9) / 0.1) * 150;
    const targetX = progress * CANVAS_TRAVEL_VW * 10 + TIP_SCREEN_ANCHOR * 1000 + catchUp;
    let i = 0;
    while (i < count && (xs[i] ?? 0) < targetX) i += 1;
    const length = lengths[i] ?? total;

    path.style.strokeDashoffset = `${1 - length / total}`;
    };
    draw(0);
    return subscribe(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${CANVAS_VW * 10} 1000`} preserveAspectRatio="none">
      <path ref={pathRef} pathLength="1" style={{ strokeDashoffset: 1 }} d={THREAD} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" />
      <path className={typed ? "animate-draw-string" : undefined} style={{ strokeDashoffset: 1, animationDuration: `${CABLE_DRAW_MS}ms`, animationTimingFunction: "cubic-bezier(0.45, 0, 0.3, 1)" }} pathLength="1" strokeDasharray="1" d={CABLE} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
