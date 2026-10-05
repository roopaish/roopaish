"use client";

import { art, copy } from "@/data/summit";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { say } from "./bubbles";
import { Figure } from "./figure";
import { heart, timeline } from "./scenes";
import {
  sampleSegments,
  segmentsPath,
  threadSegments,
  type ThreadSamples,
  type Waypoint,
} from "./thread";
import { SiteButton } from "./site-button";
import { IntroNote } from "./intro-note";
import { TYPING_START_MS } from "./timing";
import { TypingKeyboard } from "./typing-keyboard";

// ---------------------------------------------------------------------------
// Mobile: the same story told vertically. The cable leaves the keyboard and
// weaves down the page between the objects, the years hang off it on little
// stems, and it ties the habit loop before ending at the work button. Anchor
// points are read from the laid-out page, so the thread fits any phone.

// Radius (px) of the habit loop on mobile.
export const MOBILE_LOOP = 70;

// An object pinned in a mobile block, with the thread passing through its middle.
function MobileObject({ src, alt, label, style, delay }: { src: string; alt: string; label: string; style: CSSProperties; delay: string }) {
  return (
    <div className="absolute" style={style}>
      <Figure src={src} alt={alt} label={label} size="sm" delay={delay} />
      <span data-anchor className="absolute left-1/2 top-1/2" />
    </div>
  );
}

// An invisible point the thread must pass through, placed within its block.
function Anchor({ x, y, loop }: { x: string; y: number | string; loop?: number }) {
  return <span data-anchor={loop ?? ""} className="absolute" style={{ left: x, top: y }} />;
}

export function MobileStory({ ready, onWork }: { ready: boolean; onWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const samplesRef = useRef<ThreadSamples | null>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

  // Trace the thread through every anchor, starting at the keyboard's cable port.
  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const port = keyboardRef.current;
      if (!root || !port || root.offsetParent === null) return;
      const r = root.getBoundingClientRect();
      const p = port.getBoundingClientRect();
      const points: Waypoint[] = [[p.left - r.left, p.top - r.top]];
      root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        const a = el.getBoundingClientRect();
        const loop = Number(el.dataset["anchor"]);
        points.push(loop ? [a.left - r.left, a.top - r.top, loop] : [a.left - r.left, a.top - r.top]);
      });
      const segments = threadSegments(points, 1, 1);
      samplesRef.current = sampleSegments(segments, 24);
      setGeo({ d: segmentsPath(segments), w: r.width, h: r.height });
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Draw the thread down to ~70% of the screen as you scroll, like a pen
  // following your thumb; scrolling back up rewinds it.
  useEffect(() => {
    if (!geo) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const root = rootRef.current;
      const path = pathRef.current;
      const tip = tipRef.current;
      const samples = samplesRef.current;
      if (!root || !path || !tip || !samples) return;
      const { xs, ys, lengths, total } = samples;
      // Only the cable's first stretch shows until you scroll; then it grows with
      // the scroll until it catches up with ~70% down the screen.
      const top = root.getBoundingClientRect().top;
      const reach = Math.min(window.innerHeight * 0.7 - top, (ys[0] ?? 0) + 60 + Math.max(0, -top) * 1.4);
      let i = 0;
      while (i < xs.length - 1 && (ys[i] ?? 0) < reach) i += 1;
      const length = lengths[i] ?? 0;
      path.style.strokeDashoffset = `${1 - length / total}`;
      tip.setAttribute("cx", `${xs[i]}`);
      tip.setAttribute("cy", `${ys[i]}`);
      tip.style.opacity = length > 0 && length < total * 0.999 ? "1" : "0";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [geo]);

  // Things sharpen in as they scroll into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-shown", "");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    // Story comments, said once each as their moment scrolls up the screen.
    const talk = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const line = (e.target as HTMLElement).dataset["say"];
        if (!e.isIntersecting || !line) return;
        say(`story:${line}`, line);
        talk.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -40% 0px" },
    );
    root.querySelectorAll("[data-say]").forEach((el) => talk.observe(el));
    return () => {
      io.disconnect();
      talk.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-hidden md:hidden">
      {geo && (
        <svg aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
          <path ref={pathRef} d={geo.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle ref={tipRef} r="4.5" cx="0" cy="0" style={{ opacity: 0 }} className="fill-foreground" />
        </svg>
      )}

      {/* the making of a full stack developer */}
      <div className="relative h-[132svh]">
        <div className={cn("absolute inset-x-0 top-[36svh] flex justify-center", ready ? "opacity-100" : "animate-reveal [animation-delay:.25s]")}>
          <div className="relative w-[78%]">
            <TypingKeyboard message={copy.intro.typed} startDelay={TYPING_START_MS} themeKey />
            <span ref={keyboardRef} className="absolute left-1/2 top-0" />
          </div>
        </div>
        <div className="absolute right-5 top-[17svh] flex w-44 items-start gap-1.5 text-[0.8rem] leading-snug text-foreground">
          <IntroNote text={copy.intro.note} arrowClassName="mt-4 h-5 w-7 shrink-0" />
        </div>
        <p className={cn("absolute left-5 top-[calc(100svh-1.5rem)] -translate-y-full text-[2.6rem] font-semibold leading-[0.95]", ready ? "opacity-100" : "animate-reveal [animation-delay:0s]")}>{copy.intro.top}<br /><span className="font-story italic">{copy.intro.mobileEmphasis[0]}<br />{copy.intro.mobileEmphasis[1]}</span></p>
        <Anchor x="70%" y="29svh" />
        <Anchor x="94%" y="40svh" />
        <Anchor x="90%" y="70svh" />
        <Anchor x="93%" y="122svh" />
      </div>

      {/* i tinker with a lot of stuff — objects spread out on alternating sides */}
      <div className="relative h-[1500px]">
        <span data-say={copy.tinker.say} className="absolute left-0 top-0 h-px w-px" />
        <MobileObject src={art.laptop} alt="a laptop covered in stickers" label={copy.tinker.laptop} style={{ left: "3%", top: 20 }} delay="0s" />
        <MobileObject src={art.keys} alt="a keyboard" label={copy.tinker.keys} style={{ right: "5%", top: 190 }} delay=".4s" />
        <Anchor x="95%" y={400} />
        <div className="reveal absolute inset-x-0 top-[420px] mx-auto max-w-[17rem] text-center">
          <p className="text-foreground">{copy.tinker.lead}</p>
          <h2 className="mt-1 whitespace-nowrap font-story text-[2.1rem] leading-tight">{copy.tinker.title}</h2>
          <p className="mt-1 text-sm text-foreground">{copy.tinker.sub}</p>
        </div>
        <Anchor x="95%" y={590} />
        <MobileObject src={art.astronaut} alt="a rocket" label={copy.tinker.camera} style={{ left: "4%", top: 630 }} delay=".8s" />
        <MobileObject src={art.movies} alt="a clapperboard" label={copy.tinker.movies} style={{ right: "3%", top: 820 }} delay="1.2s" />
        <MobileObject src={art.nature} alt="pine trees on a hill" label={copy.tinker.nature} style={{ left: "6%", top: 1010 }} delay="1.6s" />
      </div>

      {/* but few things have my heart — object above its words, alternating sides */}
      <div className="relative px-5 pt-6">
        <span data-say={copy.heart.say} className="absolute left-0 top-0 h-px w-px" />
        <Anchor x="5%" y={0} />
        <Anchor x="5%" y={110} />
        <h2 className="reveal text-center font-story text-[2.4rem] leading-none">{copy.heart.mobileTitle[0]}<br />{copy.heart.mobileTitle[1]}</h2>
        {heart.map((h, index) => {
          const right = index % 2 === 1;
          return (
            <div key={h.title} className={cn("reveal relative mt-10 w-[66%]", right && "ml-auto text-right")}>
              <div className={cn("relative w-fit", right && "ml-auto")}>
                <Figure src={h.src} alt={h.alt} label={h.label} size="sm" delay={`${index * 0.5}s`} />
                <span data-anchor className="absolute left-1/2 top-1/2" />
              </div>
              <p className="font-story text-2xl leading-tight">{h.title}</p>
              <p className="mt-1 text-sm leading-snug text-foreground">{h.body}</p>
              {/* leave along the outer edge, below the words */}
              <Anchor x={right ? "calc(100% + 0.25rem)" : "-0.25rem"} y="calc(100% + 0.75rem)" />
            </div>
          );
        })}
      </div>

      {/* the years hang off the thread */}
      <div className="relative mt-20 px-5">
        <span data-say={copy.timeline.say} className="absolute left-0 top-20 h-px w-px" />
        <Anchor x="6%" y={-20} />
        <ol className="relative mt-4 pl-9">
          {timeline.map((stop) => (
            <li key={stop.year + stop.title} className="reveal relative pb-7">
              <span data-anchor className="absolute -left-[1.1rem] top-[0.7rem]" />
              <span aria-hidden="true" className="absolute -left-[1.1rem] top-[0.7rem] h-px w-3 bg-muted-foreground/60" />
              <span aria-hidden="true" className="absolute left-[-0.4rem] top-[0.55rem] h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <p>{stop.title}</p>
              <p className="text-sm leading-snug text-foreground">{stop.line}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/80">{stop.year}</p>
            </li>
          ))}
        </ol>
        <Anchor x="6%" y="100%" />
      </div>
      <div className="relative px-5 pt-4">
        <div className="reveal mx-auto max-w-[19rem] text-center text-sm leading-snug">
          <p>{copy.timeline.summaryTop}</p>
          <p className="text-foreground">{copy.timeline.summaryBottom}</p>
        </div>
        <Anchor x="5%" y="calc(100% + 1rem)" />
      </div>

      {/* apparently, i don't know how to leave things alone — tied in a loop */}
      <div className="relative mt-16 px-5">
        <Anchor x="89%" y={-24} />
        <Anchor x="90%" y={150} />
        <p className="reveal font-story text-[2.3rem] leading-[1.05]">{copy.habit.title} <span className="text-foreground">{copy.habit.titleMuted}</span></p>
        <div className="reveal relative mt-4 h-[270px]">
          <Anchor x="86%" y={205} />
          <Anchor x="50%" y={230} loop={MOBILE_LOOP} />
          <span className="absolute -translate-x-1/2 translate-y-3 whitespace-nowrap text-sm" style={{ left: "50%", top: 230 }}>{copy.habit.steps[0]}</span>
          <span className="absolute -translate-y-1/2 whitespace-nowrap text-sm" style={{ left: `calc(50% + ${MOBILE_LOOP + 10}px)`, top: 230 - MOBILE_LOOP }}>{copy.habit.steps[1]}</span>
          <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+0.6rem)] whitespace-nowrap text-sm" style={{ left: "50%", top: 230 - 2 * MOBILE_LOOP }}>{copy.habit.steps[2]}</span>
          <span className="absolute -translate-x-[calc(100%+0.6rem)] -translate-y-1/2 whitespace-nowrap text-sm" style={{ left: `calc(50% - ${MOBILE_LOOP}px)`, top: 230 - MOBILE_LOOP }}>{copy.habit.steps[3]}</span>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 font-story text-2xl italic" style={{ left: "50%", top: 230 - MOBILE_LOOP }}>{copy.habit.repeat}</span>
        </div>
      </div>

      {/* enough autobiography — the thread ends at the button */}
      <div className="relative px-5 pb-24 pt-14 text-center">
        <span data-say={copy.finale.say} className="absolute left-0 top-10 h-px w-px" />
        <Anchor x="94%" y={40} />
        <p className="reveal text-sm text-foreground">{copy.finale.lead}</p>
        <h2 className="reveal mt-2 font-story text-[2.3rem] leading-tight">{copy.finale.mobileTitle[0]}<br />{copy.finale.mobileTitle[1]}</h2>
        <div className="relative mt-7 inline-block">
          <span data-anchor className="absolute left-[calc(100%+2.75rem)] top-[-0.25rem]" />
          <span data-anchor className="absolute left-full top-1/2" />
          <SiteButton variant="glassDark" onClick={onWork}>{copy.finale.button} <ArrowDown className="ml-2 h-4 w-4" /></SiteButton>
        </div>
      </div>
    </div>
  );
}
