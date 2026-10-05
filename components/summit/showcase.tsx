"use client";

import { copy, projectFilters, summitProjects, type SummitProject } from "@/data/summit";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from "react";
import { SiteButton } from "./site-button";
import { WoodTiles } from "./wood-tiles";

export function Showcase({ filter, setFilter }: { filter: string; setFilter: (filter: string) => void }) {
  const filtered = filter === "All" ? summitProjects : summitProjects.filter((project) => project.tags.includes(filter));
  return (
    <section id="work" className="relative min-h-screen overflow-x-clip border-t border-foreground bg-background pb-24 sm:px-8">
      <div className="px-5 pb-10 pt-32 sm:px-0">
        <WoodTiles word={copy.works.heading} className="mx-auto w-fit max-w-[1500px]" />
      </div>
      <div className="relative mx-auto mt-16 grid max-w-[1500px] gap-16 px-5 sm:px-0 lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <aside className="h-fit min-w-0 lg:sticky lg:top-28">
          <h2 className="max-w-md font-story text-5xl leading-none sm:text-6xl">{copy.works.title[0]}<br /><em>{copy.works.title[1]}</em></h2>
          <p className="mt-8 max-w-sm text-muted-foreground">{copy.works.blurb}</p>
          <p className="mb-3 mt-10 text-sm">{copy.works.filterLabel}</p>
          <div className="flex flex-wrap gap-2">
            {projectFilters.map((item) => <SiteButton key={item} variant="filter" data-active={filter === item} onClick={() => setFilter(item)} data-cursor={`filter: ${item.toLowerCase()}`}>{item}</SiteButton>)}
          </div>
        </aside>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-20 lg:gap-30">
          {filtered.map((project) => (
            <article key={project.title} className="group min-w-0">
              <ProjectShots project={project}>
                <ProjectDrawer project={project} />
              </ProjectShots>
            </article>
          ))}
          {filtered.length === 0 && <p className="py-24 text-muted-foreground">{copy.works.empty}</p>}
        </div>
      </div>
    </section>
  );
}

// A project's screenshots. The whole picture is shown (never cropped); the
// spare space shows the stickers on the wooden board behind it. With more than one, small thumbnails below
// switch the big one.
function ProjectShots({ project, children }: { project: SummitProject; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const { images, title, live } = project;
  const go = (step: number) => setActive((index) => (index + step + images.length) % images.length);

  // Swiping: the strip follows the pointer, and letting go past a sixth of the
  // width moves a slide. Short wobbles stay clicks, so the link still works.
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const swiped = useRef(false);
  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (images.length < 2) return;
    start.current = { x: event.clientX, id: event.pointerId };
    swiped.current = false;
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    if (!swiped.current && Math.abs(dx) < 6) return;
    if (!swiped.current) event.currentTarget.setPointerCapture(start.current.id);
    swiped.current = true;
    setDrag(dx);
  };
  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    start.current = null;
    if (!swiped.current) return;
    setDrag(null);
    if (Math.abs(dx) > event.currentTarget.clientWidth / 6) go(dx < 0 ? 1 : -1);
  };
  const Frame = live ? "a" : "div";
  return (
    <>
      {/* wood board, stickers stuck on it (see .wood-board), and the picture on top */}
      <div className="wood-board z-10">
        <div className="relative">
          {/* the slides sit side by side and the track slides under the board's edge */}
          <div className="touch-pan-y select-none overflow-hidden" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClickCapture={(event) => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}>
            <Frame
              {...(live ? { href: live, target: "_blank", rel: "noreferrer", "data-cursor": "see it live ↗" } : {})}
              className="block"
            >
              <div className={cn("flex", drag === null && "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.25,1)]")} style={{ transform: `translateX(calc(${-active * 100}% + ${drag ?? 0}px))` }}>
                {images.map((src, index) => (
                  // each picture keeps its own proportions, so its rounded corners are the picture's own
                  <div key={src} className="flex aspect-[4/3] w-full shrink-0 items-center justify-center">
                    <img
                      src={src}
                      alt={`${title} screenshot ${index + 1}`}
                      loading="lazy"
                      draggable={false}
                      className="max-h-full max-w-full rounded-[10px] drop-shadow-[0_12px_20px_rgb(0_0_0/0.35)] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            </Frame>
          </div>
          {images.length > 1 && (
            <>
              <SiteButton variant="cutout" aria-label={`Previous screenshot of ${title}`} onClick={() => go(-1)} data-cursor="previous" className="absolute inset-y-0 left-0 my-auto h-9 w-12 md:h-12 md:w-16 -rotate-3 hover:-rotate-6">
                <CutoutArrow flip />
              </SiteButton>
              <SiteButton variant="cutout" aria-label={`Next screenshot of ${title}`} onClick={() => go(1)} data-cursor="next" className="absolute inset-y-0 right-0 my-auto h-9 w-12 md:h-12 md:w-16 rotate-2 hover:rotate-5">
                <CutoutArrow />
              </SiteButton>
            </>
          )}
        </div>
      </div>
      {children}
      {/* screenshot thumbnails, parked while the arrows carry the carousel
      {images.length > 1 && (
        <div className="mt-6 flex gap-3 overflow-x-auto px-1 pb-4 pt-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show screenshot ${index + 1} of ${title}`}
              aria-pressed={index === active}
              data-cursor={`${index + 1} / ${images.length}`}
              className={cn("wood-chip flex h-14 w-20 shrink-0 items-center justify-center p-1.5 transition-opacity", index === active ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100")}
            >
              <img src={src} alt="" loading="lazy" className="max-h-full max-w-full rounded-[6px] drop-shadow-[0_3px_5px_rgb(0_0_0/0.35)]" />
            </button>
          ))}
        </div>
      )}
      */}
    </>
  );
}

// Scrolling a card into view pulls a drawer out from under its board. `--p`
// (0 closed, 1 fully out) follows the scroll, eased so it glides rather than
// snaps, and everything inside the drawer keys off it.
function useDrawerPull(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--p", "1");
      return;
    }
    let current = 0;
    let frame = 0;
    const tick = () => {
      const vh = window.innerHeight;
      const target = Math.min(1, Math.max(0, (vh * 0.95 - node.getBoundingClientRect().top) / (vh * 0.45)));
      current = Math.abs(target - current) < 0.001 ? target : current + (target - current) * 0.12;
      node.style.setProperty("--p", current.toFixed(4));
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

// One thing inside the drawer, arriving after the ones before it.
function DrawerItem({ order, className, children }: { order: number; className?: string; children: ReactNode }) {
  const style = {
    "--t": `clamp(0, (var(--p) - ${0.3 + order * 0.14}) * 4.5, 1)`,
    opacity: "var(--t)",
    translate: "0 calc((1 - var(--t)) * 14px)",
    filter: "blur(calc((1 - var(--t)) * 6px))",
  } as CSSProperties;
  return <div className={className} style={style}>{children}</div>;
}

// A block arrow cut out of paper with scissors: a little uneven, pale, and
// lifted off the board by the button's shadow.
function CutoutArrow({ flip }: { flip?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 48" className={cn("size-full", flip && "-scale-x-100")}>
      <polygon points="5,17.5 37,15 36,3.5 60.5,24.5 38,44.5 38.5,33 6.5,32" fill="#f6f0e1" stroke="#d6cbb2" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 21 L35 19 M9 28.5 L36 29" fill="none" stroke="#d6cbb2" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// A four-hole shirt button, sewn on with red thread that makes an arrow.
function ShirtButton() {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 56" className="size-full">
      <defs>
        <radialGradient id="shirt-button-face" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fbf4e4" />
          <stop offset="1" stopColor="#d3c19c" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="27" fill="url(#shirt-button-face)" />
      <circle cx="28" cy="28" r="27" fill="none" stroke="#a89368" strokeWidth="1" />
      {/* the dished middle */}
      <circle cx="28" cy="28" r="18.5" fill="none" stroke="#a89368" strokeWidth="1.2" />
      <circle cx="28" cy="28" r="17.4" fill="none" stroke="#fffaf0" strokeOpacity="0.9" strokeWidth="1" />
      {[[22.5, 22.5], [33.5, 22.5], [22.5, 33.5], [33.5, 33.5]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.7" fill="#3a2a14" stroke="#a89368" strokeWidth="0.8" />
      ))}
      {/* the thread runs through the holes as an arrow: shaft bottom-left to top-right, head across the top and down the right */}
      <path d="M22.5 22.5 H33.5 V33.5 M33.5 22.5 L22.5 33.5" fill="none" stroke="#7a1812" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0.7)" />
      <path d="M22.5 22.5 H33.5 V33.5 M33.5 22.5 L22.5 33.5" fill="none" stroke="#b3261e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A tag cut out of paper and held on with a paper clip.
function PaperTag({ tilt, children }: { tilt: number; children: ReactNode }) {
  return (
    <span className="relative inline-block bg-[#f3ecdc] px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3a2a14] shadow-[0_2px_3px_rgb(0_0_0/0.4)]" style={{ rotate: `${tilt}deg` }}>
      <svg aria-hidden="true" viewBox="0 0 12 24" className="absolute -top-2.5 left-1.5 h-5 w-2.5 overflow-visible drop-shadow-[0_1px_1px_rgb(0_0_0/0.4)]">
        <path d="M3 21 V6 a3 3 0 0 1 6 0 V18 a1.7 1.7 0 0 1 -3.4 0 V8" fill="none" stroke="#b8bec6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  );
}

// The project's name and description live in a wooden drawer: it slides out
// from under the picture on scroll, then its contents appear one by one.
function ProjectDrawer({ project }: { project: SummitProject }) {
  const ref = useRef<HTMLDivElement>(null);
  useDrawerPull(ref);
  return (
    <div ref={ref} className="relative z-0 -mt-6 [--p:0] [clip-path:inset(0_-24px_-48px_-24px)]">
      <div className="wood-drawer relative mx-[3%] px-3 pb-8 pt-6" style={{ translate: "0 calc(-100% * (1 - var(--p)))" }}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 wood-recess rounded-b-[14px] px-5 pb-5 pt-6 text-[#f6e9cf]">
          <div className="min-w-0">
            <DrawerItem order={0} className="flex flex-wrap gap-x-3 gap-y-2 pt-2">
              {[project.number, ...project.tags].map((label, index) => <PaperTag key={label} tilt={index % 2 ? 1.8 : -2.2}>{label}</PaperTag>)}
            </DrawerItem>
            <DrawerItem order={1}><h3 className="mt-2 font-story text-2xl md:text-4xl">{project.title}</h3></DrawerItem>
            <DrawerItem order={2}><p className="mt-2 max-w-xl text-[#f6e9cf]/75">{project.blurb}</p></DrawerItem>
          </div>
          {project.live && (
            <DrawerItem order={3}>
              <SiteButton asChild variant="shirt" className="size-11 md:size-14">
                <a href={project.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`} data-cursor="open it ↗"><ShirtButton /></a>
              </SiteButton>
            </DrawerItem>
          )}
        </div>
        {/* the pull */}
        <span aria-hidden="true" className="absolute bottom-3 left-1/2 h-2.5 w-16 -translate-x-1/2 rounded-full bg-[#5a3414]/70 shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),0_1px_0_rgb(255_244_214/0.5)]" />
      </div>
    </div>
  );
}
