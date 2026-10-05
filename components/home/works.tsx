"use client";

import StoreBadge from "@/components/store-badge";
import { flagColors } from "@/data/journey";
import { ProductLaunchedItem, projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { MouseEvent, useRef, useState } from "react";

type Filter = "all" | "web" | "mobile";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
];

const isWeb = (project: ProductLaunchedItem) =>
  project.links.some((link) => link.platform === "web");
const isMobile = (project: ProductLaunchedItem) =>
  project.links.some((link) => link.platform !== "web");

function matches(project: ProductLaunchedItem, filter: Filter) {
  if (filter === "web") return isWeb(project);
  if (filter === "mobile") return isMobile(project);
  return true;
}

// TODO: replace section copy.
const copy = {
  eyebrow: "Summit log · 2021 — now",
  title: ["Places I've", "planted a flag."],
  body: "Web apps, mobile apps and the backends that keep them honest — each one taken from idea to launch.",
};

export default function Works() {
  const [filter, setFilter] = useState<Filter>("all");
  const listRef = useRef<HTMLDivElement>(null);
  const visible = projects.filter((project) => matches(project, filter));

  // The thread continues down the page alongside the projects.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const penTop = useTransform(progress, (value) => `${value * 100}%`);

  return (
    <section id="work" className="px-5 pt-32 pb-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <aside className="md:sticky md:top-28 md:self-start">
          <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-5xl leading-[0.95] font-bold tracking-tight md:text-6xl">
            {copy.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-[34ch] opacity-60">{copy.body}</p>

          <div
            className="mt-8 flex gap-1"
            role="tablist"
            aria-label="Filter work"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className="relative h-9 rounded-full px-4 text-sm"
              >
                {filter === item.id && (
                  <motion.span
                    layoutId="work-filter"
                    className="absolute inset-0 rounded-full bg-(--ink)"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    "relative transition-colors",
                    filter === item.id && "text-(--paper)",
                  )}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs opacity-50">
            showing {visible.length} of {projects.length}
          </p>
        </aside>

        <div ref={listRef} className="relative pl-8 md:pl-12">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-current opacity-10" />
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-[1.6px] origin-top bg-current"
            style={{ scaleY: progress }}
          />
          <motion.span
            className="absolute left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--paper) bg-[#c43a30]"
            style={{ top: penTop }}
          />

          <motion.div layout className="flex flex-col gap-16">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((project) => (
                <ProjectCard
                  key={project.name}
                  project={project}
                  index={projects.indexOf(project)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: ProductLaunchedItem;
  index: number;
}) {
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pillX = useSpring(x, { stiffness: 500, damping: 40 });
  const pillY = useSpring(y, { stiffness: 500, damping: 40 });

  const primary = project.links.find((link) => link.url !== "#");
  const tags = [isWeb(project) && "web", isMobile(project) && "mobile"].filter(
    Boolean,
  );
  const mobileShot = !isWeb(project);

  function onMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const media = (
    <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-current/5">
      <Image
        src={project.image}
        alt={project.name}
        fill
        sizes="(min-width: 768px) 60vw, 100vw"
        className={cn(
          "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
          mobileShot ? "object-contain py-6" : "object-cover object-top",
        )}
      />
      <AnimatePresence>
        {hovering && primary && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            style={{ left: pillX, top: pillY }}
            className="pointer-events-none absolute z-10 -mt-5 -ml-5 inline-flex items-center gap-1 rounded-full bg-(--ink) px-3 py-2 text-xs text-(--paper)"
          >
            visit <ArrowUpRightIcon className="size-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* A little prayer flag where the trail reaches this project. */}
      <span
        className="absolute top-1 -left-8 h-4 w-3 origin-left md:-left-12"
        style={{ backgroundColor: flagColors[index % flagColors.length] }}
      >
        <span className="absolute top-0 -left-px h-7 w-px bg-current" />
      </span>

      {primary ? (
        <a
          href={primary.url}
          target="_blank"
          rel="noreferrer"
          className="group block cursor-none"
          onMouseMove={onMove}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label={`Open ${project.name}`}
        >
          {media}
        </a>
      ) : (
        media
      )}

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
            Summit {String(index + 1).padStart(2, "0")} · {tags.join(" · ")}
          </p>
          <h3 className="font-display mt-1 text-3xl font-bold tracking-tight">
            {project.name}
          </h3>
          <p className="mt-1 max-w-[52ch] opacity-60">{project.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {project.links.map((link) =>
            link.url === "#" ? (
              <StoreBadge
                key={link.platform}
                platform={link.platform}
                comingSoon={link.comingSoon}
              />
            ) : (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <StoreBadge platform={link.platform} />
              </a>
            ),
          )}
        </div>
      </div>
    </motion.article>
  );
}
