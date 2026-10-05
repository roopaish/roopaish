"use client";

import { flagColors } from "@/data/journey";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const FLAG_W = 34;
const FLAG_H = 44;
const GAP = 5;
const PITCH = FLAG_W + GAP;
/** How far down the cord sits inside the strip (px). */
const CORD_Y = 20;

/**
 * A cord of triangular prayer flags in the five flag colours. They sway on
 * their own, blow up when you scroll down and settle when you scroll up (the
 * wind always runs against the scroll), and flap when you click one.
 */
export function FlagBunting({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(24);
  // Click energy per flag; the loop below spends it as fluttering.
  const kicks = useRef<number[]>([]);

  // As many flags as fit the width.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setCount(Math.max(4, Math.floor(root.clientWidth / PITCH)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const flags = Array.from(root.querySelectorAll<HTMLElement>("[data-flag]"));
    const lift = new Float32Array(flags.length);
    // Flutter phase and (eased) click energy per flag. The phase is advanced
    // frame by frame so a change in energy never makes the wave jump.
    const phase = new Float32Array(flags.length);
    const energy = new Float32Array(flags.length);
    let last = 0;
    let visible = false;
    let frame = 0;
    let lastY = window.scrollY;
    let velocity = 0;

    const tick = (now: number) => {
      if (!visible) {
        frame = 0;
        return;
      }
      const dt = last ? Math.min(50, now - last) : 16.7;
      last = now;
      const decay = Math.pow(0.955, dt / 16.7);
      const y = window.scrollY;
      velocity += (y - lastY - velocity) * 0.2;
      lastY = y;
      // Wind blows against the scroll: scrolling down sends it upward.
      const wind = Math.max(-1, Math.min(1, velocity / 28));
      const gust = Math.abs(wind);
      flags.forEach((el, i) => {
        // The gust reaches each flag a touch later than its neighbour.
        lift[i]! += (Math.max(0, wind) - lift[i]!) * (0.08 + ((i * 7) % 5) * 0.018);
        const kick = kicks.current[i] ?? 0;
        kicks.current[i] = kick * decay;
        energy[i]! += (kick - energy[i]!) * 0.2;
        phase[i]! += dt * (0.006 + energy[i]! * 0.004);
        const flutter = 2.5 + gust * 18 + energy[i]! * 24;
        const skew = flutter * Math.sin(phase[i]! + i * 0.7);
        const sway = 2.5 * Math.sin(now * 0.0016 + i * 0.5) - Math.min(0, wind) * 5;
        // Lifted flags fold up over the cord (scaleY runs from 1 to -0.35).
        const scaleY = 1 - 1.35 * Math.min(1, lift[i]! + energy[i]! * 0.2);
        el.style.transform = `rotate(${sway.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) scaleY(${scaleY.toFixed(3)})`;
      });
      frame = requestAnimationFrame(tick);
    };

    // Only animate while the strip is on (or near) the screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible && !frame) {
          lastY = window.scrollY;
          last = 0;
          frame = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [count]);

  // A click sets the flag flapping and the ones beside it, fading with distance.
  const flap = (index: number) => {
    [1, 0.7, 0.45, 0.25].forEach((strength, distance) => {
      for (const i of distance === 0 ? [index] : [index - distance, index + distance]) {
        if (i >= 0) kicks.current[i] = Math.max(kicks.current[i] ?? 0, strength);
      }
    });
  };

  return (
    <div ref={rootRef} aria-hidden="true" className={cn("relative h-16 w-full overflow-x-clip", className)}>
      <span className="absolute inset-x-0 h-px bg-foreground/45" style={{ top: CORD_Y }} />
      <div className="absolute inset-x-0 flex justify-center" style={{ top: CORD_Y, gap: GAP }}>
        {Array.from({ length: count }, (_, i) => {
          const color = flagColors[i % flagColors.length] ?? "#c43a30";
          return (
            <span
              key={i}
              data-flag
              data-cursor="give it a tug"
              onClick={() => flap(i)}
              className="block shrink-0 cursor-pointer will-change-transform"
              style={{ width: FLAG_W, height: FLAG_H, transformOrigin: "50% 0" }}
            >
              <svg viewBox={`0 0 ${FLAG_W} ${FLAG_H}`} width={FLAG_W} height={FLAG_H} className="block overflow-visible">
                <polygon points={`0,0 ${FLAG_W},0 ${FLAG_W / 2},${FLAG_H}`} fill={color} stroke="rgb(0 0 0 / 0.22)" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </span>
          );
        })}
      </div>
    </div>
  );
}
