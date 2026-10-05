"use client";

import { copy, summitLinks, summitName } from "@/data/summit";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { say } from "./bubbles";
import { CuriousCursor, PhoneComment } from "./cursor-bubble";
import { Altimeter } from "./altimeter";
import { Closing } from "./ending";
import { PrayerFlags } from "./prayer-flags";
import { MobileStory } from "./mobile";
import { RANGE_LAYERS, RangeBackdrop } from "./range-backdrop";
import { FinaleScene, HabitScene, HeartScene, IntroScene, TimelineScene, TinkerScene } from "./scenes";
import { Showcase } from "./showcase";
import { REVEAL_INSET, SCROLL_EASE, StringLine, TIP_SCREEN_ANCHOR } from "./string-line";
import { CANVAS_TRAVEL_VW, CANVAS_VW } from "./thread";

export default function SummitHome() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rangeLayers = useRef<(HTMLDivElement | null)[]>([]);
  const listeners = useRef(new Set<(progress: number) => void>());
  const [noteRevealed, setNoteRevealed] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The header floats over the story, but gets the page colour from the work
  // section on, so the links don't sit on top of project images.
  const [solidHeader, setSolidHeader] = useState(false);
  useEffect(() => {
    const check = () => {
      const work = document.getElementById("work");
      if (work) setSolidHeader(window.scrollY >= work.offsetTop - 80);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  const [filter, setFilter] = useState("All");

  // First the mind arrives, then its note, and only then does scrolling take over.
  useEffect(() => {
    const root = document.documentElement;
    // Opening the page at #work lands straight on the work, no intro.
    if (window.location.hash === "#work") {
      setNoteRevealed(true);
      setScrollReady(true);
      // Next.js scrolls to the top after a client navigation, so land on the
      // work a few times until that has settled.
      const land = () => document.getElementById("work")?.scrollIntoView({ behavior: "instant" });
      const settle = [0, 80, 200, 400].map((ms) => window.setTimeout(land, ms));
      return () => settle.forEach((id) => window.clearTimeout(id));
    }
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    let greet = 0;
    const unlock = () => {
      root.style.overflow = "";
      setNoteRevealed(true);
      setScrollReady(true);
      window.clearTimeout(greet);
      greet = window.setTimeout(() => say("intro", copy.greeting), 1800);
      window.clearTimeout(noteTimer);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
    };
    const noteTimer = window.setTimeout(() => setNoteRevealed(true), 2200);
    const unlockTimer = window.setTimeout(unlock, 2600);
    // Anyone who tries to scroll early skips the rest of the intro.
    const skipEvents = ["wheel", "touchmove", "keydown"] as const;
    skipEvents.forEach((name) => window.addEventListener(name, unlock, { passive: true }));
    return () => {
      window.clearTimeout(greet);
      window.clearTimeout(noteTimer);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
      root.style.overflow = "";
    };
  }, []);

  // One animation-frame loop runs the whole story. It eases toward the scroll
  // position, so wheel steps become a glide, and then moves the canvas, draws
  // the thread and reveals whatever the thread has reached — all directly on
  // the DOM, without asking React to re-render the page every frame.
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const spoken = new Set<string>();
    const tick = () => {
      const section = storyRef.current;
      const canvas = canvasRef.current;
      if (section) {
        const distance = section.offsetHeight - window.innerHeight;
        const target = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / Math.max(distance, 1)));
        const next = current < 0 || Math.abs(target - current) < 0.00005 ? target : current + (target - current) * SCROLL_EASE;
        if (next !== current) {
          current = next;
          if (canvas && window.innerWidth >= 768) {
            canvas.style.transform = `translate3d(-${current * CANVAS_TRAVEL_VW}vw,0,0)`;
            rangeLayers.current.forEach((layer, i) => {
              if (layer) layer.style.transform = `translate3d(-${current * CANVAS_TRAVEL_VW * (RANGE_LAYERS[i]?.speed ?? 0)}vw,0,0)`;
            });
            const tip = current * CANVAS_TRAVEL_VW + TIP_SCREEN_ANCHOR * 100;
            const edge = current * CANVAS_TRAVEL_VW + 100 - REVEAL_INSET;
            canvas.querySelectorAll<HTMLElement>("[data-at]").forEach((el) => {
              // Most things reveal as they enter the screen; "thread" ones wait
              // for the thread itself (the loop's steps, the story comments).
              const shown = (el.dataset["mode"] === "thread" ? tip : edge) >= Number(el.dataset["at"]);
              el.toggleAttribute("data-shown", shown);
              // Story comments are said once, the first time the thread arrives.
              const line = el.dataset["say"];
              if (shown && line && !spoken.has(line)) {
                spoken.add(line);
                say(`story:${line}`, line);
              }
            });
          }
          listeners.current.forEach((listen) => listen(current));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const subscribe = (listen: (progress: number) => void) => {
    listeners.current.add(listen);
    return () => {
      listeners.current.delete(listen);
    };
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main>
      <header className={cn("fixed inset-x-0 top-0 z-50 grid grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-5 transition-opacity duration-700 sm:px-8 sm:py-7", solidHeader ? "bg-background" : "bg-transparent", scrollReady ? "opacity-100" : "pointer-events-none animate-reveal [animation-delay:2.6s]")}>
        <button aria-label="Back to introduction" onClick={() => go("brain")} className="w-fit bg-transparent font-story text-3xl font-medium">
          {summitName}
        </button>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
          <button onClick={() => go("brain")} className="bg-transparent">trail</button>
          <button onClick={() => go("work")} className="bg-transparent">work</button>
          <a href={summitLinks.linkedin} target="_blank" rel="noreferrer" className="story-link" data-cursor="the professional version.">linkedin</a>
          <button onClick={() => go("hi")} className="bg-transparent" data-cursor="say hello?">let's talk</button>
        </nav>
        <button className="relative h-10 w-10 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          <span className={cn("absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-foreground transition-all duration-300", menuOpen ? "rotate-45" : "-translate-y-[5px]")} />
          <span className={cn("absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-foreground transition-all duration-300", menuOpen ? "-rotate-45" : "translate-y-[4px]")} />
        </button>
        {menuOpen && (
          <nav className="absolute inset-x-4 top-16 grid gap-1 border border-border bg-background p-3 text-lg shadow-xl md:hidden">
            <button onClick={() => go("brain")} className="p-3 text-left">trail</button>
            <button onClick={() => go("work")} className="p-3 text-left">work</button>
            <a href={summitLinks.linkedin} target="_blank" rel="noreferrer" className="p-3">linkedin</a>
            <button onClick={() => go("hi")} className="p-3 text-left">let's talk</button>
          </nav>
        )}
      </header>

      <section id="brain" ref={storyRef} className="relative md:h-[720vh]">
        <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
          <RangeBackdrop layersRef={rangeLayers} />
          <Altimeter subscribe={subscribe} />
          <div ref={canvasRef} className="relative h-full will-change-transform max-md:hidden" style={{ width: `${CANVAS_VW}vw` }}>
            <StringLine subscribe={subscribe} />
            <PrayerFlags />
            <div className="absolute inset-0 z-10">
              <IntroScene contentRevealed={noteRevealed} noteRevealed={noteRevealed} />
              <TinkerScene />
              <HeartScene />
              <TimelineScene />
              <HabitScene />
              <FinaleScene onWork={() => go("work")} />
            </div>
          </div>
        </div>
        <MobileStory ready={noteRevealed} onWork={() => go("work")} />
      </section>

      <Showcase filter={filter} setFilter={setFilter} />
      <Closing />
      <CuriousCursor visible={scrollReady} />
      <PhoneComment />
    </main>
  );
}
