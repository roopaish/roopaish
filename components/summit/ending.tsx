"use client";

import { copy, summitLinks } from "@/data/summit";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { say } from "./bubbles";
import { AsciiCat } from "./ascii-cat";
import { FlagBunting } from "./flag-bunting";
import { SiteButton } from "./site-button";
import { threadPath } from "./thread";
import { TypingKeyboard } from "./typing-keyboard";

function Lines({ text }: { text: readonly string[] }) {
  return (
    <>
      {text.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

// Where the closing cable plugs back into the keyboard (centre of its top
// edge), in vw / vh of the section's first screen.
const PORT_X = 78;
const PORT_Y = 42;

// A handwritten margin note, like scribbles on the page.
function Scribble({ className, rotate = -10, children }: { className?: string; rotate?: number; children: ReactNode }) {
  return (
    <p className={cn("font-scrawl text-[1.05rem] leading-[1.3] tracking-[0.08em] text-foreground/75", className)} style={{ rotate: `${rotate}deg` }}>
      {children}
    </p>
  );
}

// A small hand-drawn arrow. `d` is the stroke; the head is drawn at its end.
function ScribbleArrow({ d, head, className, style }: { d: string; head: string; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 60" className={cn("absolute h-10 w-10 overflow-visible text-foreground/70", className)} style={style}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d={head} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The end. The cable leaves the last word of "let's build something worth the
// keystrokes." and winds across the page to plug into the keyboard.
export function Closing() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  // Only the two moments that change the layout go through React: the words
  // arriving, and the cable reaching the keyboard.
  const [stage, setStage] = useState({ seen: false, reached: false });
  const [thread, setThread] = useState("");
  const seen = stage.seen;

  // The cable starts right after the last word, wherever the type lands on
  // this screen, so measure it, then wind across to the keyboard.
  useEffect(() => {
    const measure = () => {
      const hi = endRef.current;
      const section = ref.current;
      if (!hi || !section) return;
      const r = hi.getBoundingClientRect();
      const q = section.getBoundingClientRect();
      const sx = ((r.right - q.left) / window.innerWidth) * 100 + 0.8;
      const sy = ((r.top - q.top + r.height * 0.55) / window.innerHeight) * 100;
      setThread(threadPath([[sx, sy], [sx + 7, sy - 4], [Math.max(sx + 20, 52), sy - 9], [66, sy - 11], [74, 28], [PORT_X, PORT_Y]]));
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Arrive and the cable travels toward the keyboard; scroll back up and it
    // retraces its way out. It animates on its own rather than sticking to
    // the scrollbar, easing toward wherever it should be.
    let frame = 0;
    let current = 0;
    let greeted = false;
    const tick = () => {
      const { top } = node.getBoundingClientRect();
      const target = top < window.innerHeight * 0.45 ? 1 : 0;
      const gap = target - current;
      current = Math.abs(gap) < 0.002 ? target : current + gap * 0.045 + Math.sign(gap) * 0.004;
      current = Math.min(1, Math.max(0, current));
      if (pathRef.current) pathRef.current.style.strokeDashoffset = `${1 - current}`;
      const next = { seen: current > 0.3, reached: current >= 0.98 };
      if (next.reached && !greeted) {
        greeted = true;
        say("hi", copy.closing.reached);
      }
      setStage((s) => (s.seen === next.seen && s.reached === next.reached ? s : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fade and sharpen something in, merged with its own classes and style.
  const arrive = (on: boolean, delay: string, className: string, style?: CSSProperties) => ({
    className: cn(className, "transition-all duration-700", on ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm"),
    style: { ...style, transitionDelay: on ? delay : "0s" },
  });

  return (
    <section id="hi" ref={ref} className="relative min-h-screen overflow-hidden px-5 pb-10 pt-28 sm:px-8 md:h-screen md:min-h-[720px] md:px-[4.5vw] md:pb-0 md:pt-[15vh]">
      <FlagBunting className="absolute inset-x-0 top-0 z-20" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-screen md:block">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path ref={pathRef} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} d={thread} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {/* the keyboard the cable plugs into, typing away */}
        <div {...arrive(seen, ".2s", "absolute w-[min(30vw,520px)] -translate-x-1/2", { left: `${PORT_X}vw`, top: `${PORT_Y}vh` })}>
          <TypingKeyboard />
        </div>
        {/* little sparks where the cable meets the keyboard */}
        <svg viewBox="0 0 40 40" className={cn("absolute h-14 w-14 -translate-x-1/2 transition-all duration-500", stage.reached ? "scale-100 opacity-100" : "scale-50 opacity-0")} style={{ left: `${PORT_X}vw`, top: `calc(${PORT_Y}vh - 3.6rem)` }}>
          <path d="M9 12 L13 22 M20 6 L20 18 M31 12 L27 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div {...arrive(stage.reached, ".6s", "absolute", { left: "66vw", top: "74vh" })}>
          <Scribble className="w-36" rotate={-8}><Lines text={copy.closing.noteBottom} /></Scribble>
          <ScribbleArrow className="left-24 -top-9" d="M10 36 C14 20 24 10 40 6" head="M40 6 L30 6 M40 6 L36 15" />
        </div>
      </div>

      <div {...arrive(seen, "0s", "relative md:max-w-[58vw]")}>
        <p className="mb-3 font-deva text-2xl text-muted-foreground">{copy.closing.greetingDeva}</p>
        <p className="font-story text-[clamp(2.2rem,4.4vw,4.8rem)] leading-[1.02] tracking-[-0.01em]">{copy.closing.pitchTop}<br /><em><span ref={endRef}>{copy.closing.pitchBottom}</span></em></p>
        <div className="relative mt-14 flex w-fit flex-col md:mt-28 items-start gap-3">
          <SiteButton asChild variant="glassDark" size="pill" className="min-w-64">
            <a href={`mailto:${summitLinks.email}`} data-cursor="send the interesting idea.">{summitLinks.email} <ArrowUpRight className="h-4 w-4" /></a>
          </SiteButton>
          <div className="flex flex-wrap gap-3">
            <SiteButton asChild variant="glass" size="pillSm">
              <a href={summitLinks.linkedin} target="_blank" rel="noreferrer" data-cursor="the professional version.">linkedin <ArrowUpRight className="h-4 w-4" /></a>
            </SiteButton>
            <SiteButton asChild variant="glass" size="pillSm">
              <a href={summitLinks.github} target="_blank" rel="noreferrer" data-cursor="how i got here, one commit at a time.">github <ArrowUpRight className="h-4 w-4" /></a>
            </SiteButton>
            <SiteButton asChild variant="glass" size="pillSm">
              <a href={summitLinks.x} target="_blank" rel="noreferrer" data-cursor="a quiet corner. i rarely post, but i'm still around.">x <ArrowUpRight className="h-4 w-4" /></a>
            </SiteButton>
          </div>
        </div>
        <div className="relative mt-16 md:hidden">
          <TypingKeyboard className="mx-auto w-[92%]" />
          <AsciiCat className="mx-auto mt-10 w-fit" />
        </div>
      </div>

      {/* the cat that has been chewing on the laptop all along */}
      <div {...arrive(seen, ".5s", "absolute bottom-6 left-[4.5vw] hidden md:block")}>
        <AsciiCat />
      </div>

      <SiteButton variant="quiet" onClick={() => document.getElementById("brain")?.scrollIntoView({ behavior: "smooth" })} className="mt-10 md:absolute md:bottom-5 md:right-8 md:mt-0" data-cursor={copy.closing.backCursor}>
        {copy.closing.back}
      </SiteButton>
    </section>
  );
}
