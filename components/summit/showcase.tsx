"use client";

import { copy, projectFilters, summitProjects, type SummitProject } from "@/data/summit";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SiteButton } from "./site-button";
import { WoodTiles } from "./wood-tiles";

export function Showcase({ filter, setFilter }: { filter: string; setFilter: (filter: string) => void }) {
  const filtered = filter === "All" ? summitProjects : summitProjects.filter((project) => project.tags.includes(filter));
  return (
    <section id="work" className="relative min-h-screen border-t border-foreground bg-background pb-24 sm:px-8">
      <div className="px-5 pt-16 sm:px-0">
        <WoodTiles word={copy.works.heading} className="mx-auto w-fit max-w-[1500px]" />
      </div>
      <div className="relative mx-auto mt-16 grid max-w-[1500px] gap-16 px-5 sm:px-0 lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <aside className="h-fit lg:sticky lg:top-28">
          <p className="text-sm text-muted-foreground">{copy.works.eyebrow}</p>
          <h2 className="mt-4 max-w-md font-story text-5xl leading-none sm:text-6xl">{copy.works.title[0]}<br /><em>{copy.works.title[1]}</em></h2>
          <p className="mt-8 max-w-sm text-muted-foreground">{copy.works.blurb}</p>
          <p className="mb-3 mt-10 text-sm">{copy.works.filterLabel}</p>
          <div className="flex flex-wrap gap-2">
            {projectFilters.map((item) => <SiteButton key={item} variant="filter" data-active={filter === item} onClick={() => setFilter(item)} data-cursor={`filter: ${item.toLowerCase()}`}>{item}</SiteButton>)}
          </div>
        </aside>
        <div className="grid gap-20">
          {filtered.map((project) => (
            <article key={project.title} className="group">
              <ProjectShots project={project} />
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
                <div className="min-w-0"><p className="text-xs text-muted-foreground">{project.number} / {project.tags.join(" · ")}</p><h3 className="mt-1 font-story text-4xl">{project.title}</h3><p className="mt-2 max-w-xl text-muted-foreground">{project.blurb}</p></div>
                {project.live && <SiteButton asChild variant="paper" size="icon"><a href={project.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`} data-cursor="open it ↗"><ArrowUpRight className="h-5 w-5" /></a></SiteButton>}
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="py-24 text-muted-foreground">{copy.works.empty}</p>}
        </div>
      </div>
    </section>
  );
}

// A project's screenshots. The whole picture is shown (never cropped); the
// spare space is sticker paper. With more than one, small thumbnails below
// switch the big one.
function ProjectShots({ project }: { project: SummitProject }) {
  const [active, setActive] = useState(0);
  const { images, title, live } = project;
  const Frame = live ? "a" : "div";
  return (
    <>
      <Frame
        {...(live ? { href: live, target: "_blank", rel: "noreferrer", "data-cursor": "see it live ↗" } : {})}
        className="sticker-frame block overflow-hidden border border-border p-4 sm:p-6"
      >
        <img
          key={images[active]}
          src={images[active]}
          alt={`${title} screenshot ${active + 1}`}
          loading="lazy"
          className="animate-reveal mx-auto aspect-[4/3] w-full object-contain drop-shadow-[0_10px_18px_rgb(0_0_0/0.22)] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </Frame>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show screenshot ${index + 1} of ${title}`}
              aria-pressed={index === active}
              data-cursor={`${index + 1} / ${images.length}`}
              className={cn("sticker-frame h-14 w-20 shrink-0 border p-1 transition-opacity", index === active ? "border-foreground" : "border-border opacity-60 hover:opacity-100")}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
