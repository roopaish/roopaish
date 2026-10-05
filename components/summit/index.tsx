"use client";

import { copy, siteHandle, summitLinks } from "@/data/summit";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say } from "./bubbles";
import { CuriousCursor, PhoneComment } from "./cursor-bubble";
import { Altimeter } from "./altimeter";
import { Closing } from "./ending";
import { PrayerFlags } from "./prayer-flags";
import { useIntroTyped } from "./intro-state";
import { MenuIsland, type MenuItem } from "./menu-island";
import { MobileStory } from "./mobile";
import { RANGE_LAYERS, RangeBackdrop } from "./range-backdrop";
import { FinaleScene, HabitScene, HeartScene, IntroScene, TimelineScene, TinkerScene } from "./scenes";
import { Showcase } from "./showcase";
import { SiteButton } from "./site-button";
import { REVEAL_INSET, SCROLL_EASE, StringLine, TIP_SCREEN_ANCHOR } from "./string-line";
import { CANVAS_TRAVEL_VW, CANVAS_VW } from "./thread";

export default function SummitHome() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rangeLayers = useRef<(HTMLDivElement | null)[]>([]);
  const listeners = useRef(new Set<(progress: number) => void>());
  const [noteRevealed, setNoteRevealed] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const typed = useIntroTyped();
  const [menuOpen, setMenuOpen] = useState(false);
  // The header slips away while you scroll down and returns as soon as you scroll up.
  const [headerHidden, setHeaderHidden] = useState(false);
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
    const noteTimer = window.setTimeout(() => setNoteRevealed(true), 1800);
    const unlockTimer = window.setTimeout(unlock, 2000);
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

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHeaderHidden(y > last && y > 80);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Header pieces blur into focus one after another. The delay base comes from
  // the header's --base variable: right away on phones, with the title block
  // (after the greeting is typed) on desktop.
  const headerIn = (index?: number) => ({
    className: cn("max-md:animate-blur-reveal", typed ? "md:animate-blur-reveal" : "md:opacity-0"),
    style: { animationDelay: `calc(var(--base) + ${(index ?? 0) * 90}ms)` } as CSSProperties,
  });

  const menuItems: MenuItem[] = [
    { label: "trail", id: "brain" },
    { label: "work", id: "work" },
    { label: "linkedin", href: summitLinks.linkedin },
    { label: "let's talk", id: "hi" },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 grid grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-5 transition-[translate] duration-500 [--base:.1s] [transition-timing-function:cubic-bezier(0.22,0.7,0.2,1)] sm:px-8 sm:py-7 md:[--base:1.3s]",
          headerHidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        )}
      >
        {/* A frosted veil: strongest at the very top, fading to nothing below the header. */}
        <div
          aria-hidden="true"
          className={cn("max-md:animate-fade-in", typed ? "md:animate-fade-in" : "md:opacity-0", "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150%] bg-gradient-to-b to-transparent backdrop-blur-md transition-colors duration-500 [mask-image:linear-gradient(to_bottom,black_35%,transparent)]", solidHeader ? "from-background/95 via-background/70" : "from-background/80 via-background/40")}
          style={{ animationDelay: "var(--base)" }}
        />
        <button aria-label="Back to introduction" onClick={() => go("brain")} className={cn(headerIn(0).className, "w-fit bg-transparent font-story text-3xl font-medium")} style={headerIn(0).style}>
          {siteHandle}
        </button>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <SiteButton variant="link" onClick={() => go("brain")} className={headerIn(1).className} style={headerIn(1).style}>trail</SiteButton>
          <SiteButton variant="link" onClick={() => go("work")} className={headerIn(2).className} style={headerIn(2).style}>work</SiteButton>
          <SiteButton asChild variant="link" className={headerIn(3).className} style={headerIn(3).style}>
            <a href={summitLinks.linkedin} target="_blank" rel="noreferrer" data-cursor="the professional version.">linkedin</a>
          </SiteButton>
          <SiteButton variant="link" onClick={() => go("hi")} className={headerIn(4).className} style={headerIn(4).style}>let's talk</SiteButton>
        </nav>
        <MenuIsland revealClass={headerIn(1).className} revealStyle={headerIn(1).style} open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} onGo={go} items={menuItems} />
      </header>

      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={cn("fixed inset-0 z-40 bg-black/15 transition-opacity duration-500 md:hidden", menuOpen ? "opacity-100" : "pointer-events-none opacity-0")}
      />

      <section id="brain" ref={storyRef} className="relative md:h-[720vh]">
        <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
          <RangeBackdrop layersRef={rangeLayers} />
          <Altimeter subscribe={subscribe} />
          <div ref={canvasRef} className="relative h-full will-change-transform max-md:hidden" style={{ width: `${CANVAS_VW}vw` }}>
            <StringLine subscribe={subscribe} />
            <PrayerFlags />
            <div className="halo absolute inset-0 z-10">
              <IntroScene contentRevealed={noteRevealed} />
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
