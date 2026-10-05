"use client";

import { BASE_ALTITUDE, SUMMIT_ALTITUDE } from "@/data/journey";
import { profile } from "@/data/profile";
import { scrollToElement, scrollToY } from "@/lib/lenis";
import { useContactFormModal } from "@/stores/contact-form-modal";
import { useEffect, useRef } from "react";

const TICKS = 31;

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
  const altitudeRef = useRef<HTMLSpanElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const active = progress * (TICKS - 1);
      const journey = document.querySelector<HTMLElement>(".journey");
      const spacer = journey?.parentElement?.classList.contains("pin-spacer")
        ? journey.parentElement
        : null;
      const climb = spacer ? spacer.offsetHeight - window.innerHeight : 1;
      const climbed = Math.min(1, Math.max(0, window.scrollY / Math.max(1, climb)));
      const altitude = Math.round((BASE_ALTITUDE + climbed * (SUMMIT_ALTITUDE - BASE_ALTITUDE)) / 10) * 10;
      if (altitudeRef.current) altitudeRef.current.textContent = `▲ ${altitude.toLocaleString("en-US")} m`;
      tickRefs.current.forEach((tick, index) => {
        if (!tick) return;
        const closeness = Math.max(0, 1 - Math.abs(index - active) / 3);
        tick.style.height = `${8 + closeness * 12}px`;
        tick.style.opacity = String(0.25 + closeness * 0.75);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[5px] md:flex"
      aria-hidden="true"
    >
      <span ref={altitudeRef} className="mr-3 w-20 text-right font-mono text-[11px] tabular-nums opacity-60">
        ▲ {BASE_ALTITUDE.toLocaleString("en-US")} m
      </span>
      {Array.from({ length: TICKS }, (_, index) => {
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
              ref={(el) => { tickRefs.current[index] = el; }}
              className="block w-px bg-current transition-[height,opacity] duration-150"
              style={{
                height: 8,
                opacity: 0.25,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
