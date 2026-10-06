"use client";

import { art, copy } from "@/data/summit";
import { cn } from "@/lib/utils";
import { AppWindow, ArrowDown, ArrowRight, ChevronLeft, Code2, FileText, Server } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Figure, SceneObject } from "./figure";
import {
  at,
  BAND,
  BAND_MARGIN_VH,
  BUTTON_WIDTH_VW,
  BUTTON_Y,
  CANVAS_VW,
  getThreadSamples,
  KEY_TOP,
  KEY_X,
} from "./thread";
import { IntroNote } from "./intro-note";
import { useIntroTyped } from "./intro-state";
import { TYPING_START_MS } from "./timing";
import { SiteButton } from "./site-button";
import { TypingKeyboard } from "./typing-keyboard";

// Desktop intro order: the keyboard appears and types its greeting, the cable
// and note start, and only then does the text around them fade in. (Phones
// keep their own order in mobile.tsx: text first, then the keyboard.)
export function IntroScene({ contentRevealed }: { contentRevealed: boolean }) {
  const typed = useIntroTyped();
  return (
    <div className="absolute left-0 h-screen w-screen" style={{ top: `-${BAND_MARGIN_VH}vh` }}>
      <div className={cn("absolute w-[min(40vw,660px)] -translate-x-1/2", contentRevealed ? "opacity-100" : "animate-reveal")} style={{ left: `${KEY_X}vw`, top: `${BAND_MARGIN_VH + KEY_TOP * BAND}vh` }}>
        <TypingKeyboard message={copy.intro.typed} startDelay={TYPING_START_MS} />
      </div>
      <div className={cn("absolute bottom-10 left-8 transition-all duration-700 sm:bottom-8", typed ? "animate-reveal [animation-delay:1.3s]" : "opacity-0")}>
        <p className="text-3xl font-semibold leading-[0.95] sm:text-4xl">{copy.intro.top}<br /><span className="font-story italic">{copy.intro.emphasis}</span></p>
      </div>
      <div className="absolute left-[62%] top-28 flex max-w-56 origin-bottom-left items-start gap-2 text-sm text-foreground">
        <IntroNote text={copy.intro.note} arrowClassName="mt-1 h-6 w-8 shrink-0" />
      </div>
      <div className={cn("absolute bottom-8 right-8 hidden text-right transition-all delay-150 duration-700 sm:block", typed ? "animate-reveal [animation-delay:1.7s]" : "opacity-0")}>
        <SiteButton asChild variant="glass" className="mr-2"><a href="#work">{copy.intro.work}</a></SiteButton>
        <SiteButton asChild variant="glass"><a href="#hi">{copy.intro.talk}</a></SiteButton>
      </div>
    </div>
  );
}

// A piece of text pinned to the canvas.
// `at` is the canvas x (in vw) the thread must reach before a `.reveal` note shows.
function Note({ x, y, className, at: revealAt, children }: { x: number; y: number; className?: string; at?: number; children: ReactNode }) {
  return <div className={cn("absolute", className)} style={at(x, y)} data-at={revealAt}>{children}</div>;
}

// i tinker with a lot of stuff: a quiet line in the middle, the objects
// scattered around it, and the thread looping between them.
export function TinkerScene() {
  return (
    <div>
      <Note x={120} y={42} className="reveal w-[38vw] text-center" at={122}>
        <p className="text-lg text-foreground">{copy.tinker.lead}</p>
        <h2 className="whitespace-nowrap font-story text-5xl leading-tight">{copy.tinker.title}</h2>
        <p className="mt-2 text-lg text-foreground">{copy.tinker.sub}</p>
      </Note>
      <SceneObject src={art.laptop} alt="a laptop covered in stickers" label={copy.tinker.laptop} style={at(106, 19)} size="sm" autoAt={116} delay="0s" />
      <SceneObject src={art.cursor} alt="a selection box with a cursor" label={copy.tinker.design} style={at(121, 11)} size="sm" autoAt={126} delay=".9s" />
      <SceneObject src={art.keys} alt="a keyboard" label={copy.tinker.keys} style={at(136, 18)} size="sm" autoAt={141} delay=".3s" />
      <SceneObject src={art.phone} alt="a phone" label={copy.tinker.phone} style={at(104, 60)} size="sm" autoAt={109} delay=".6s" />
      <SceneObject src={art.blocks} alt="three linked blocks" label={copy.tinker.blocks} style={at(124, 68)} size="sm" autoAt={129} delay="1.2s" />
      <SceneObject src={art.server} alt="a small server rack" label={copy.tinker.server} style={at(150, 68)} size="sm" autoAt={155} delay="1.5s" />
    </div>
  );
}

// Points on the thread between two x positions, as (x, y) pairs in vw/vh.
function sampleThread(from: number, to: number) {
  const { xs: allX, ys: allY } = getThreadSamples();
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < allX.length; i += 1) {
    const x = allX[i]! / 10;
    if (x >= from - 1 && x <= to + 1) {
      xs.push(x);
      ys.push(allY[i]! / 10);
    }
  }
  return { xs, ys };
}

export const heart = copy.heart.items.map((item) => ({ ...item, src: art[item.key as keyof typeof art] }));

// but few things have my heart: each one an object with a big line and a
// quiet one beside it, and the thread running calmly between the objects.
export function HeartScene() {
  return (
    <div>
      <Note x={181} y={14} className="reveal w-[26rem]" at={182}><h2 className="font-story text-5xl leading-none">{copy.heart.title}</h2></Note>
      {heart.map((h, index) => (
        <Note key={h.title} x={h.x} y={h.y} className="reveal flex items-center gap-5" at={h.x + 2}>
          <Figure src={h.src} alt={h.alt} label={h.label} delay={`${index * 0.5}s`} autoAt={h.x + 6} />
          <div className="w-72">
            <p className="font-story text-3xl leading-tight">{h.title}</p>
            <p className="mt-2 text-foreground">{h.body}</p>
          </div>
        </Note>
      ))}
    </div>
  );
}

// One beat per year, told like a story: a short line that moves it forward,
// and the detail underneath for anyone who wants it.
export const timeline = copy.timeline.stops;
export const TIMELINE_FROM = 304;
const TIMELINE_STEP = 18;
const STEM = 11;

// The thread curves gently through the years. Each year hangs off it on a thin
// stem, alternating above and below, and only appears once the thread
// arrives. Underneath, what all of it keeps adding up to.
export function TimelineScene() {
  const [ys, setYs] = useState<number[] | null>(null);

  // Hang each stem from exactly where the thread passes.
  useEffect(() => {
    const { xs, ys: samples } = sampleThread(TIMELINE_FROM - 2, TIMELINE_FROM + TIMELINE_STEP * timeline.length);
    setYs(timeline.map((_, index) => {
      const x = TIMELINE_FROM + index * TIMELINE_STEP;
      let k = 0;
      while (k < xs.length - 1 && (xs[k + 1] ?? 0) < x) k += 1;
      return samples[k] ?? 50;
    }));
  }, []);

  return (
    <div>
      {ys && timeline.map((stop, index) => {
        const x = TIMELINE_FROM + index * TIMELINE_STEP;
        const y = ys[index] ?? 50;
        const up = index % 2 === 1;
        return (
          <div key={stop.year + stop.title} className="reveal" data-at={x}>
            <span className="absolute w-px bg-muted-foreground/60" style={{ left: `${x}vw`, top: `${up ? y - STEM : y}cqh`, height: `${STEM}cqh` }} />
            <span className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground" style={{ left: `calc(${x}vw + 0.5px)`, top: `${up ? y - STEM : y + STEM}cqh` }} />
            <Note x={x} y={up ? y - STEM - 2 : y + STEM + 2} className={cn("w-64 -translate-x-1/2 text-center leading-snug", up && "-translate-y-full")}>
              <p className="text-lg">{stop.title}</p>
              <p className="text-foreground">{stop.line}</p>
              <p className="mt-1 text-sm text-muted-foreground/80">{stop.year}</p>
            </Note>
          </div>
        );
      })}
      {/* Each phrase fades in as the thread passes over it, like the years. */}
      <Note x={372} y={79} className="reveal w-[30rem] text-lg leading-snug" at={380}>
        <p>{copy.timeline.summaryTop}</p>
        <p className="mt-2 text-foreground">{copy.timeline.summaryBottom}</p>
        <LearnSequence at={380} />
      </Note>
    </div>
  );
}

const sequenceIcons = { docs: FileText, code: Code2, browser: AppWindow, server: Server };

// docs → code → browser → server: how something I read about ends up running,
// each stop appearing a beat after the one before.
export function LearnSequence({ at: revealAt, className }: { at?: number; className?: string }) {
  const stops = copy.timeline.sequence;
  const attrs = (index: number) => ({ "data-at": revealAt, style: { "--reveal-delay": `${0.5 + index * 0.35}s` } as CSSProperties });
  return (
    <div aria-hidden="true" className={cn("mt-4 flex items-center gap-2 text-sm", className)}>
      {stops.map((stop, index) => {
        const Icon = sequenceIcons[stop];
        return (
          <div key={stop} className="flex items-center gap-2">
            {index > 0 && <ArrowRight className="reveal h-3.5 w-3.5 text-muted-foreground" {...attrs(index - 0.5)} />}
            <span className="reveal flex items-center gap-1.5 rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1.5" {...attrs(index)}>
              <Icon className="h-4 w-4" />
              {stop}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// The habit that keeps repeating, told as a git graph. The thread is `main`.
// A feature branch splits off above it and carries the middle steps, a hotfix
// branch dips below it for a moment, and both merge back. After the last step
// the line forks again and runs all the way back to rejoin main before the
// first step: the repeat, drawn as part of the same line. Each branch starts
// drawing the moment the trail reaches the point it leaves from, and every
// join is read off the thread itself, so lines meet it exactly.
const GIT_FEATURE_Y = 58;
const GIT_FIX_Y = 83;
const GIT_LOOP_Y = 92;

// The thread's height (viewBox units) where it passes canvas x (vw).
const { xs: threadXs, ys: threadYs } = getThreadSamples();
const threadAt = (x: number) => {
  let i = 0;
  while (i < threadXs.length - 1 && (threadXs[i] ?? 0) < x * 10) i += 1;
  return Math.round(threadYs[i] ?? 720);
};

// Where each step's commit sits on the canvas (vw / cqh), in step order.
const commits = [
  { x: 456, y: threadAt(456) / 10, place: "below" },
  { x: 463, y: GIT_FEATURE_Y, place: "above" },
  { x: 470, y: GIT_FEATURE_Y, place: "above" },
  { x: 477, y: threadAt(477) / 10, place: "below" },
  { x: 485, y: threadAt(485) / 10, place: "above" },
] as const;
const git = copy.habit.steps.map((step, index) => ({ step, ...commits[index]! }));

// The branches, in the thread's own viewBox units (10 per vw / cqh). `at` is
// the canvas x the trail must reach before the branch starts drawing.
const FEATURE_AT = 458;
const FIX_AT = 463;
const LOOP_AT = 487;
const GIT_FEATURE = `M4570 ${threadAt(457)} C4600 ${threadAt(457)} 4600 ${GIT_FEATURE_Y * 10} 4630 ${GIT_FEATURE_Y * 10} L4700 ${GIT_FEATURE_Y * 10} C4740 ${GIT_FEATURE_Y * 10} 4740 ${threadAt(477)} 4770 ${threadAt(477)}`;
const GIT_FIX = `M4630 ${threadAt(463)} C4650 ${threadAt(463)} 4650 ${GIT_FIX_Y * 10} 4670 ${GIT_FIX_Y * 10} L4700 ${GIT_FIX_Y * 10} C4720 ${GIT_FIX_Y * 10} 4720 ${threadAt(474)} 4740 ${threadAt(474)}`;
// The way back: out of main after the last commit, along the lowest lane in
// reverse, round a turn below main, and up into it just before the first commit.
const GIT_LOOP = `M4870 ${threadAt(487)} C4905 ${threadAt(487)} 4905 ${GIT_LOOP_Y * 10} 4850 ${GIT_LOOP_Y * 10} L4570 ${GIT_LOOP_Y * 10} C4470 ${GIT_LOOP_Y * 10} 4420 ${threadAt(449) + 70} 4470 ${threadAt(449) + 18} C4480 ${threadAt(449) + 5} 4490 ${threadAt(449)} 4500 ${threadAt(449)}`;
const gitBranches = [
  { d: GIT_FEATURE, at: FEATURE_AT },
  { d: GIT_FIX, at: FIX_AT },
  { d: GIT_LOOP, at: LOOP_AT },
];

const gitLabel = {
  below: "-translate-x-1/2 translate-y-3",
  above: "-translate-x-1/2 -translate-y-[calc(100%+0.75rem)]",
};

const gitView = `0 0 ${CANVAS_VW * 10} 1000`;
// Branches are a touch lighter than the thread they split from.
const gitPath = { fill: "none", stroke: "currentColor", strokeOpacity: 0.8, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1 } as const;

export function HabitScene() {
  return (
    <div>
      <Note x={428} y={22} className="reveal w-[32rem]" at={428}>
        <p className="font-story text-5xl leading-[1.05]">{copy.habit.title} <span className="text-foreground">{copy.habit.titleMuted}</span></p>
      </Note>
      {gitBranches.map(({ d, at: reach }) => (
        <svg key={reach} aria-hidden="true" data-mode="thread" data-at={reach} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={gitView} preserveAspectRatio="none">
          <path className="git-draw" d={d} {...gitPath} />
        </svg>
      ))}
      {git.map(({ step, x, y, place }) => (
        <div key={step} className="reveal git-reveal" data-mode="thread" data-at={x}>
          <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-foreground bg-background" style={at(x, y)} />
          <p className={cn("absolute w-max max-w-[4.75rem] text-center text-sm leading-tight", gitLabel[place])} style={at(x, y)}>{step}</p>
        </div>
      ))}
      <span className="reveal git-reveal absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/80" data-mode="thread" data-at={FIX_AT + 4} style={at(468, GIT_FIX_Y)} />
      <div className="reveal git-reveal" data-mode="thread" data-at={LOOP_AT}>
        <ChevronLeft aria-hidden="true" className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background text-foreground/80" style={at(466, GIT_LOOP_Y)} />
        <p className="absolute -translate-x-1/2 -translate-y-[calc(100%+0.3rem)] font-story text-xl italic" style={at(478, GIT_LOOP_Y)}>{copy.habit.repeat}</p>
      </div>
    </div>
  );
}

// The thread stops. Whitespace. Then the turn into the work.
export function FinaleScene({ onWork }: { onWork: () => void }) {
  // The last screen is one full 100vw panel, so when the trail runs out the
  // words and the button sit in the middle of the screen. The thread ends at
  // the button's left edge (the button is a fixed share of the width, so it
  // meets it on every screen size); the words sit above it.
  return (
    <div className="absolute top-0 h-full w-screen" style={{ left: `${CANVAS_VW - 100}vw` }}>
      <div className="reveal absolute inset-x-0 -translate-y-full text-center" data-at={CANVAS_VW - 100 + 20} style={{ top: `${BUTTON_Y - 6}cqh` }}>
        <p className="text-lg text-foreground">{copy.finale.lead}</p>
        <h2 className="mt-3 font-story text-5xl">{copy.finale.title}</h2>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${BUTTON_Y}cqh` }}>
        <SiteButton variant="glassDark" onClick={onWork} data-cursor={copy.finale.buttonCursor} className="justify-center whitespace-nowrap" style={{ width: `${BUTTON_WIDTH_VW}vw`, minWidth: "11rem" }}>{copy.finale.button} <ArrowDown className="ml-2 h-4 w-4" /></SiteButton>
      </div>
    </div>
  );
}
