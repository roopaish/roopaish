"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.08,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
      allowNestedScroll: true,
      // Explicit escape hatch for any area that should bypass Lenis handling.
      prevent: (node) => {
        if (!(node instanceof HTMLElement)) return false;
        return Boolean(
          node.closest(
            "[data-lenis-prevent], [data-lenis-prevent-wheel], [data-lenis-prevent-touch]",
          ),
        );
      },
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
