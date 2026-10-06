"use client";

import { setLenis } from "@/lib/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // The home page runs their own eased scroll loop; stacking Lenis on top would smooth it twice.
    if (pathname === "/") {
      return;
    }

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

    // Keep GSAP ScrollTrigger in sync with Lenis' smoothed scroll position.
    lenis.on("scroll", ScrollTrigger.update);
    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
