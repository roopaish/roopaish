"use client";

import { art, copy } from "@/data/summit";
import { cn } from "@/lib/utils";
import { ArrowDown, ChevronUp, Repeat } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Figure } from "./figure";
import { heart, LearnSequence, timeline } from "./scenes";
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
// stems, and it runs through the habit's git graph before ending at the work
// button. Anchor points are read from the laid-out page, so the thread fits
// any phone.

// The habit's git graph on mobile (px, from the graph's top-left). The thread
// runs down the left as main; a feature branch splits off it with a hotfix
// branch dipping off that, and they merge back. After the last commit the line
// forks again, sweeps right and runs back up the right edge to rejoin main
// above the first commit: the repeat, drawn as part of the same line.
const GIT_MAIN_X = 10;
const GIT_FEATURE_X = 32;
const GIT_FIX_X = 52;
const GIT_LABEL_X = 72;
const GIT_LOOP_X = 172;
const GIT_HEIGHT = 300;
const GIT_MAIN_ANCHORS: [x: string, y: number][] = [["10px", 6], ["10px", 100], ["10px", 206], ["10px", 244], ["28px", 272], ["90px", 284], [`${GIT_LOOP_X}px`, 278]];
const GIT_COMMITS = [
  { x: GIT_MAIN_X, y: 36 },
  { x: GIT_FEATURE_X, y: 84 },
  { x: GIT_FEATURE_X, y: 164 },
  { x: GIT_MAIN_X, y: 206 },
  { x: GIT_MAIN_X, y: 244 },
];
const GIT_FEATURE = `M${GIT_MAIN_X} 48 C${GIT_MAIN_X} 62 ${GIT_FEATURE_X} 58 ${GIT_FEATURE_X} 72 L${GIT_FEATURE_X} 176 C${GIT_FEATURE_X} 194 ${GIT_MAIN_X} 188 ${GIT_MAIN_X} 206`;
const GIT_FIX = `M${GIT_FEATURE_X} 100 C${GIT_FEATURE_X} 112 ${GIT_FIX_X} 108 ${GIT_FIX_X} 120 L${GIT_FIX_X} 132 C${GIT_FIX_X} 144 ${GIT_FEATURE_X} 140 ${GIT_FEATURE_X} 152`;
// Up the right-hand lane and back along the top.
const GIT_LOOP = `M${GIT_LOOP_X} 278 C${GIT_LOOP_X} 258 ${GIT_LOOP_X} 250 ${GIT_LOOP_X} 232 L${GIT_LOOP_X} 16 C${GIT_LOOP_X} -6 ${GIT_LOOP_X - 18} -6 ${GIT_LOOP_X - 36} -6 L36 -6 C20 -6 ${GIT_MAIN_X} -2 ${GIT_MAIN_X} 14`;

// One branch: a hairline svg sitting at the point the branch leaves the thread,
// so it starts drawing as the thread reaches that point.
function GitBranch({ d, startY }: { d: string; startY: number }) {
  const path = { fill: "none", stroke: "currentColor", strokeOpacity: 0.8, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1 } as const;
  return (
    <svg aria-hidden="true" className="git-graph pointer-events-none absolute left-0 w-full overflow-visible" style={{ top: startY, height: 1 }}>
      <g transform={`translate(0 ${-startY})`}>
        <path className="git-draw" d={d} {...path} />
      </g>
    </svg>
  );
}

function MobileGitGraph() {
  return (
    <div className="relative -mx-5 mt-6" style={{ height: GIT_HEIGHT }}>
      {GIT_MAIN_ANCHORS.map(([x, y]) => <Anchor key={`${x}-${y}`} x={x} y={y} />)}
      <GitBranch d={GIT_FEATURE} startY={48} />
      <GitBranch d={GIT_FIX} startY={100} />
      <GitBranch d={GIT_LOOP} startY={278} />
      {copy.habit.steps.map((step, index) => {
        const { x, y } = GIT_COMMITS[index]!;
        return (
          <div key={step} className="reveal git-reveal absolute left-0 w-full" style={{ top: y, height: 0 }}>
            <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-foreground bg-background" style={{ left: x, top: 0 }} />
            <span className="absolute max-w-[5.25rem] -translate-y-1/2 text-[0.8125rem] leading-tight" style={{ left: GIT_LABEL_X, top: 0 }}>{step}</span>
          </div>
        );
      })}
      <span className="reveal git-reveal absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/80" style={{ left: GIT_FIX_X, top: 126 }} />
      <ChevronUp aria-hidden="true" className="reveal git-reveal absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background text-foreground/80" style={{ left: GIT_LOOP_X, top: 140 }} />
      <span className="reveal git-reveal absolute flex -translate-y-1/2 items-center gap-1.5 font-story text-xl italic" style={{ left: GIT_LOOP_X + 14, top: 140 }}>
        <Repeat aria-hidden="true" className="h-3.5 w-3.5 not-italic text-foreground/60" />
        {copy.habit.repeat}
      </span>
    </div>
  );
}

// An object pinned in a mobile block, with the thread passing through its middle.
function MobileObject({ src, alt, label, style, delay }: { src: string; alt: string; label: string; style: CSSProperties; delay: string }) {
  return (
    <div className="absolute" style={style}>
      <Figure src={src} alt={alt} label={label} size="sm" delay={delay} autoOpen />
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
    root.querySelectorAll(".reveal:not(.git-reveal)").forEach((el) => io.observe(el));
    // The git graph follows the thread itself, which is drawn down to ~70% of
    // the screen, so each branch and commit shows as it passes that line.
    const trail = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-shown", "");
        trail.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -30% 0px" },
    );
    root.querySelectorAll(".git-reveal, .git-graph").forEach((el) => trail.observe(el));
    return () => {
      io.disconnect();
      trail.disconnect();
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

      {/* i tinker with a lot of stuff: objects spread out on alternating sides */}
      <div className="relative h-[1420px]">
        <MobileObject src={art.laptop} alt="a laptop covered in stickers" label={copy.tinker.laptop} style={{ left: "3%", top: 20 }} delay="0s" />
        <MobileObject src={art.keys} alt="a keyboard" label={copy.tinker.keys} style={{ right: "5%", top: 190 }} delay=".4s" />
        <Anchor x="95%" y={400} />
        <div className="reveal absolute inset-x-0 top-[420px] mx-auto max-w-[17rem] text-center">
          <p className="text-foreground">{copy.tinker.lead}</p>
          <h2 className="mt-1 font-story text-[2.1rem] leading-tight">{copy.tinker.title}</h2>
          <p className="mt-1 text-sm text-foreground">{copy.tinker.sub}</p>
        </div>
        <Anchor x="95%" y={620} />
        <MobileObject src={art.cursor} alt="a selection box with a cursor" label={copy.tinker.design} style={{ left: "4%", top: 660 }} delay=".8s" />
        <MobileObject src={art.phone} alt="a phone" label={copy.tinker.phone} style={{ right: "3%", top: 850 }} delay="1.2s" />
        <MobileObject src={art.blocks} alt="three linked blocks" label={copy.tinker.blocks} style={{ left: "6%", top: 1040 }} delay="1.6s" />
        <MobileObject src={art.server} alt="a small server rack" label={copy.tinker.server} style={{ right: "5%", top: 1230 }} delay="2s" />
      </div>

      {/* but few things have my heart: object above its words, alternating sides */}
      <div className="relative px-5 pt-6">
        <Anchor x="5%" y={0} />
        <Anchor x="5%" y={110} />
        <h2 className="reveal text-center font-story text-[2.4rem] leading-none">{copy.heart.mobileTitle[0]}<br />{copy.heart.mobileTitle[1]}<br />{copy.heart.mobileTitle[2]}</h2>
        {heart.map((h, index) => {
          const right = index % 2 === 1;
          return (
            <div key={h.title} className={cn("reveal relative mt-10 w-[66%]", right && "ml-auto text-right")}>
              <div className={cn("relative w-fit", right && "ml-auto")}>
                <Figure src={h.src} alt={h.alt} label={h.label} size="sm" delay={`${index * 0.5}s`} autoOpen />
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
          <LearnSequence className="mt-3 flex-wrap justify-center gap-1.5 text-xs" />
        </div>
        <Anchor x="5%" y="calc(100% + 1rem)" />
      </div>

      {/* apparently, i just like turning ideas into working things: a git graph, with the thread as main */}
      <div className="relative mt-16 px-5">
        <Anchor x="10px" y={-24} />
        <p className="reveal font-story text-[2.3rem] leading-[1.05]">{copy.habit.title} <span className="text-foreground">{copy.habit.titleMuted}</span></p>
        <MobileGitGraph />
      </div>

      {/* enough autobiography: the thread ends at the button */}
      <div className="relative px-5 pb-24 pt-14 text-center">
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
