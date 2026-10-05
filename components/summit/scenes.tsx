"use client";

import { art, copy } from "@/data/summit";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Figure, SceneObject } from "./figure";
import {
  at,
  BUTTON_X,
  BUTTON_Y,
  getThreadSamples,
  KEY_TOP,
  KEY_X,
  LOOP_ASPECT,
  LOOP_R,
  LOOP_X,
  LOOP_Y,
} from "./thread";
import { SiteButton } from "./site-button";
import { TypingKeyboard } from "./typing-keyboard";

export function IntroScene({ contentRevealed, noteRevealed }: { contentRevealed: boolean; noteRevealed: boolean }) {
  return (
    <div className="absolute left-0 top-0 h-full w-screen">
      <div className={cn("absolute w-[min(40vw,660px)] -translate-x-1/2", contentRevealed ? "opacity-100" : "animate-reveal [animation-delay:.3s]")} style={{ left: `${KEY_X}vw`, top: `${KEY_TOP}vh` }}>
        <TypingKeyboard message={copy.intro.typed} />
      </div>
      <div className={cn("absolute bottom-10 left-8 transition-all duration-700 sm:bottom-8", contentRevealed ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>
        <p className="mb-3 font-deva text-3xl text-muted-foreground sm:text-4xl">{copy.intro.namaste}</p>
        <p className="text-4xl font-semibold leading-[0.95] sm:text-5xl">{copy.intro.top}<br />{copy.intro.middle}<br /><span className="font-story italic">{copy.intro.emphasis}</span></p>
      </div>
      <div className={cn("absolute left-[62%] top-28 flex max-w-56 origin-bottom-left items-start gap-2 text-sm text-muted-foreground transition-all duration-500", noteRevealed ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>
        <svg aria-hidden="true" viewBox="0 0 40 30" className="mt-1 h-6 w-8 shrink-0"><path d="M38 4 C24 6 12 14 4 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M4 24 L13 22 M4 24 L7 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <span>{copy.intro.note}</span>
      </div>
      <div className={cn("absolute bottom-8 right-8 hidden text-right transition-all delay-150 duration-700 sm:block", contentRevealed ? "opacity-100" : "animate-reveal [animation-delay:2.35s]")}>
        <p className="mb-4 text-sm">{copy.intro.welcome}</p>
        <SiteButton asChild variant="paper" className="mr-2"><a href="#work">{copy.intro.work}</a></SiteButton>
        <SiteButton asChild variant="ink"><a href="#hi" data-cursor={copy.intro.talkCursor}>{copy.intro.talk}</a></SiteButton>
      </div>
    </div>
  );
}

// A piece of text pinned to the canvas.
// `at` is the canvas x (in vw) the thread must reach before a `.reveal` note shows.
function Note({ x, y, className, at: revealAt, children }: { x: number; y: number; className?: string; at?: number; children: ReactNode }) {
  return <div className={cn("absolute", className)} style={at(x, y)} data-at={revealAt}>{children}</div>;
}

// i tinker with a lot of stuff — a quiet line in the middle, the objects
// scattered around it, and the thread looping between them.
export function TinkerScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={112} data-say={copy.tinker.say} />
      <Note x={120} y={42} className="reveal w-[38vw] text-center" at={122}>
        <p className="text-lg text-muted-foreground">{copy.tinker.lead}</p>
        <h2 className="whitespace-nowrap font-story text-6xl leading-tight">{copy.tinker.title}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{copy.tinker.sub}</p>
      </Note>
      <SceneObject src={art.laptop} alt="a laptop covered in stickers" label={copy.tinker.laptop} style={at(106, 19)} size="sm" delay="0s" />
      <SceneObject src={art.astronaut} alt="a rocket" label={copy.tinker.camera} style={at(104, 60)} size="sm" delay=".6s" />
      <SceneObject src={art.cat} alt="a cat wearing sunglasses" label={copy.tinker.cat} style={at(124, 68)} size="sm" delay="1.2s" />
      <SceneObject src={art.keys} alt="a keyboard" label={copy.tinker.keys} style={at(136, 18)} size="sm" delay=".3s" />
      <SceneObject src={art.badminton} alt="a game controller" label={copy.tinker.badminton} style={at(150, 68)} size="sm" delay="1.5s" />
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

// but few things have my heart — each one an object with a big line and a
// quiet one beside it, and the thread running calmly between the objects.
export function HeartScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={184} data-say={copy.heart.say} />
      <Note x={181} y={18} className="reveal w-[22rem]" at={182}><h2 className="font-story text-6xl leading-none">{copy.heart.title}</h2></Note>
      {heart.map((h, index) => (
        <Note key={h.title} x={h.x} y={h.y} className="reveal flex items-center gap-5" at={h.x + 2}>
          <Figure src={h.src} alt={h.alt} label={h.label} delay={`${index * 0.5}s`} />
          <div className="w-64">
            <p className="font-story text-4xl leading-tight">{h.title}</p>
            <p className="mt-2 text-muted-foreground">{h.body}</p>
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
// stem — alternating above and below — and only appears once the thread
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
      <span hidden data-mode="thread" data-at={306} data-say={copy.timeline.say} />
      {ys && timeline.map((stop, index) => {
        const x = TIMELINE_FROM + index * TIMELINE_STEP;
        const y = ys[index] ?? 50;
        const up = index % 2 === 1;
        return (
          <div key={stop.year + stop.title} className="reveal" data-at={x}>
            <span className="absolute w-px bg-muted-foreground/60" style={{ left: `${x}vw`, top: `${up ? y - STEM : y}vh`, height: `${STEM}vh` }} />
            <span className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground" style={{ left: `calc(${x}vw + 0.5px)`, top: `${up ? y - STEM : y + STEM}vh` }} />
            <Note x={x} y={up ? y - STEM - 2 : y + STEM + 2} className={cn("w-64 -translate-x-1/2 text-center leading-snug", up && "-translate-y-full")}>
              <p className="text-lg">{stop.title}</p>
              <p className="text-muted-foreground">{stop.line}</p>
              <p className="mt-1 text-sm text-muted-foreground/80">{stop.year}</p>
            </Note>
          </div>
        );
      })}
      {/* Each phrase fades in as the thread passes over it, like the years. */}
      <Note x={302} y={84} className="reveal" at={302}><p className="whitespace-nowrap font-story text-5xl">{copy.timeline.openingTop} <span className="text-muted-foreground">{copy.timeline.openingBottom}</span></p></Note>
      <Note x={346} y={84} className="reveal" at={346}><p className="whitespace-nowrap font-story text-5xl"><span className="text-muted-foreground">{copy.timeline.closingMuted}</span> {copy.timeline.closingMain}</p></Note>
      <Note x={380} y={83} className="reveal w-[25rem] text-lg leading-snug" at={380}>
        <p>{copy.timeline.summaryTop}</p>
        <p className="text-muted-foreground">{copy.timeline.summaryBottom}</p>
      </Note>
    </div>
  );
}

// The habit that keeps repeating, told as a cycle: the thread ties one big
// loop beside the line, and the four steps sit around it in the order the
// thread draws them — bottom, right, top, left — with "repeat." in the middle.
export const LOOP_RX = LOOP_R / LOOP_ASPECT;
const habitPositions = [
  { x: LOOP_X, y: LOOP_Y, place: "below" },
  { x: LOOP_X + LOOP_RX, y: LOOP_Y - LOOP_R, place: "right" },
  { x: LOOP_X, y: LOOP_Y - 2 * LOOP_R, place: "above" },
  { x: LOOP_X - LOOP_RX, y: LOOP_Y - LOOP_R, place: "left" },
] as const;
const habit = habitPositions.map((position, index) => ({ ...position, step: copy.habit.steps[index] ?? "" }));

const habitLabel = {
  below: "-translate-x-1/2 translate-y-4",
  right: "translate-x-5 -translate-y-1/2",
  above: "-translate-x-1/2 -translate-y-[calc(100%+1rem)]",
  left: "-translate-x-[calc(100%+1.25rem)] -translate-y-1/2",
};

export function HabitScene() {
  // The loop is drawn in one go once the thread reaches it, so its steps
  // arrive one after another, in drawing order.
  const looped = LOOP_X + LOOP_RX + 1;
  return (
    <div>
      <span hidden data-mode="thread" data-at={looped} data-say={copy.habit.say} />
      <Note x={428} y={22} className="reveal w-[32rem]" at={428}>
        <p className="font-story text-6xl leading-[1.05]">{copy.habit.title} <span className="text-muted-foreground">{copy.habit.titleMuted}</span></p>
      </Note>
      {habit.map(({ step, x, y, place }, index) => (
        <div key={step} className="reveal" data-mode="thread" data-at={looped} style={{ "--reveal-delay": `${index * 0.25}s` } as CSSProperties}>
          <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={at(x, y)} />
          <p className={cn("absolute whitespace-nowrap text-lg", habitLabel[place])} style={at(x, y)}>{step}</p>
        </div>
      ))}
      <p className="reveal absolute -translate-x-1/2 -translate-y-1/2 font-story text-4xl italic" data-mode="thread" data-at={looped} style={{ ...at(LOOP_X, LOOP_Y - LOOP_R), "--reveal-delay": "1s" } as CSSProperties}>{copy.habit.repeat}</p>
    </div>
  );
}

// The thread stops. Whitespace. Then the turn into the work.
export function FinaleScene({ onWork }: { onWork: () => void }) {
  // The button is pinned to the thread's end point (its left edge, halfway
  // down), so the thread meets it on every screen size; the words sit above.
  return (
    <>
      <span hidden data-mode="thread" data-at={BUTTON_X - 8} data-say={copy.finale.say} />
      <Note x={BUTTON_X + 4.6} y={BUTTON_Y - 6} className="reveal w-[46vw] -translate-x-1/2 -translate-y-full text-center" at={BUTTON_X - 14}>
        <p className="text-lg text-muted-foreground">{copy.finale.lead}</p>
        <h2 className="mt-3 font-story text-6xl">{copy.finale.title}</h2>
      </Note>
      <div className="absolute -translate-y-1/2" style={at(BUTTON_X, BUTTON_Y)}>
        <SiteButton variant="ink" onClick={onWork} data-cursor={copy.finale.buttonCursor}>{copy.finale.button} <ArrowDown className="ml-2 h-4 w-4" /></SiteButton>
      </div>
    </>
  );
}
