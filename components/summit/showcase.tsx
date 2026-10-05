"use client";

import { copy, projectFilters, summitProjects, type SummitProject } from "@/data/summit";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { PrintDesk } from "./print-desk";
import { SiteButton } from "./site-button";
import { WoodTiles } from "./wood-tiles";
import { WorkShelf } from "./work-shelf";

// How many projects sit on the page before the shelf.
const SHOWN = 3;

export function Showcase({ filter, setFilter }: { filter: string; setFilter: (filter: string) => void }) {
  const filtered = filter === "All" ? summitProjects : summitProjects.filter((project) => project.tags.includes(filter));
  const shown = filtered.slice(0, SHOWN);
  const shelved = filtered.slice(SHOWN);
  const [shelfOpen, setShelfOpen] = useState(false);
  return (
    <section id="work" className="relative min-h-screen overflow-x-clip border-t border-foreground bg-background pb-24 sm:px-8">
      <div className="px-5 pb-10 pt-32 sm:px-0">
        <WoodTiles word={copy.works.heading} className="mx-auto w-fit max-w-[1500px]" />
      </div>
      <div className="relative mx-auto mt-16 grid max-w-[1500px] gap-16 px-5 sm:px-0 lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <aside className="h-fit min-w-0 lg:sticky lg:top-28">
          <h2 className="max-w-md font-story text-4xl leading-none sm:text-5xl">{copy.works.title[0]}<br /><em>{copy.works.title[1]}</em></h2>
          <p className="mt-8 max-w-sm text-foreground">{copy.works.blurb}</p>
          <div className="mt-10 flex flex-wrap gap-2">
            {projectFilters.map((item) => <SiteButton key={item} variant="filter" data-active={filter === item} onClick={() => setFilter(item)} data-cursor={`filter: ${item.toLowerCase()}`}>{item}</SiteButton>)}
          </div>
        </aside>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-20 lg:gap-30">
          {shown.map((project) => (
            <article key={project.title} className="group min-w-0">
              <ProjectShots project={project}>
                <ProjectDrawer project={project} />
              </ProjectShots>
            </article>
          ))}
          {filtered.length === 0 && <p className="py-24 text-foreground">{copy.works.empty}</p>}
          {shelved.length > 0 && (
            <div className="flex justify-center">
              <SiteButton variant="glassDark" size="pill" className="w-max max-w-full justify-center" onClick={() => setShelfOpen(true)} data-cursor={copy.works.moreCursor}>
                {copy.works.more}
              </SiteButton>
            </div>
          )}
        </div>
      </div>
      <WorkShelf projects={summitProjects} open={shelfOpen} onClose={() => setShelfOpen(false)} />
    </section>
  );
}

// A project's screenshots, laid out loosely on the wooden desk (see PrintDesk).
// Nothing here links out; the drawer below has the way to the live site.
function ProjectShots({ project, children }: { project: SummitProject; children: ReactNode }) {
  return (
    <>
      <div className="wood-board z-10">
        <PrintDesk title={project.title} images={project.images} />
      </div>
      {children}
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
            <DrawerItem order={1}><h3 className="mt-2 font-story text-2xl md:text-3xl">{project.title}</h3></DrawerItem>
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
