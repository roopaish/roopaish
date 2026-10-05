"use client";

import { BASE_ALTITUDE } from "@/data/journey";
import { profile } from "@/data/profile";
import { scrollToElement, scrollToY } from "@/lib/lenis";
import { useContactFormModal } from "@/stores/contact-form-modal";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

const TICKS = 31;
const SUMMIT = 6100;

export default function SiteHeader() {
  const openContact = useContactFormModal((state) => state.open);
  const linkedin = profile.socials.find((s) => s.platform === "LinkedIn");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 bg-linear-to-b from-(--paper) via-(--paper)/70 to-transparent px-5 pt-6 pb-10 md:px-8">
      <div className="pointer-events-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => scrollToY(0)}
          className="font-display text-2xl leading-none font-bold tracking-tight"
          aria-label="Back to the start"
        >
          {profile.name}
        </button>

        <Ruler />

        <nav className="flex items-center gap-5 text-sm md:gap-7">
          <button type="button" onClick={() => scrollToY(0)}>
            trail
          </button>
          <button
            type="button"
            onClick={() => scrollToElement(document.getElementById("work"))}
          >
            work
          </button>
          {linkedin && (
            <a
              href={linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline"
            >
              linkedin
            </a>
          )}
          <button type="button" onClick={openContact}>
            say namaste
          </button>
        </nav>
      </div>
    </header>
  );
}

/**
 * Altimeter: page position as a row of ticks plus the "altitude" you've
 * climbed, from the valley floor in Kathmandu to the summit.
 */
function Ruler() {
  const { scrollY, scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);
  const [climbed, setClimbed] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) =>
    setActive(value * (TICKS - 1)),
  );
  // Altitude follows the pinned trail, so the summit reads 6,100 m.
  useMotionValueEvent(scrollY, "change", (value) => {
    const spacer = document.querySelector<HTMLElement>(".pin-spacer");
    const climb = spacer ? spacer.offsetHeight - window.innerHeight : 1;
    setClimbed(Math.min(1, Math.max(0, value / climb)));
  });

  const altitude =
    Math.round((BASE_ALTITUDE + climbed * (SUMMIT - BASE_ALTITUDE)) / 10) * 10;

  return (
    <div
      className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[5px] md:flex"
      aria-hidden="true"
    >
      <span className="mr-3 w-20 text-right font-mono text-[11px] tabular-nums opacity-60">
        ▲ {altitude.toLocaleString("en-US")} m
      </span>
      {Array.from({ length: TICKS }, (_, index) => {
        const closeness = Math.max(0, 1 - Math.abs(index - active) / 3);
        return (
          <button
            key={index}
            type="button"
            tabIndex={-1}
            onClick={() =>
              scrollToY(
                (index / (TICKS - 1)) *
                  (document.documentElement.scrollHeight - window.innerHeight),
              )
            }
            className="flex h-6 items-center"
          >
            <span
              className="block w-px bg-current transition-[height,opacity] duration-150"
              style={{
                height: 8 + closeness * 12,
                opacity: 0.25 + closeness * 0.75,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
