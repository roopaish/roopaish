"use client";

import StoreBadge from "@/components/store-badge";
import { flagColors } from "@/data/journey";
import { ProductLaunchedItem, projects } from "@/data/projects";
import { scrollToY } from "@/lib/lenis";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRightIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import Image from "next/image";
import { MouseEvent, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// TODO: replace section copy.
const copy = {
  eyebrow: "Summit log",
  title: "Places I've planted a flag.",
};

// TODO: the year each project shipped.
const years: Record<string, string> = {
  Biggya: "2025",
  Ekagajpatra: "2024",
  "Clamphook Mobile App": "2021",
  "Production Ready Ecommerce": "2022",
  "Real-Estate Platform": "2024",
  Aagaman: "2023",
  Menzz: "2022",
};

/** Prayer flag colours without the white one, for the discs behind frames. */
const discColors = flagColors.filter((color) => color !== "#f3efe4");
const RULER_TICKS = 72;

const isWeb = (project: ProductLaunchedItem) =>
  project.links.some((link) => link.platform === "web");
const isMobile = (project: ProductLaunchedItem) =>
  project.links.some((link) => link.platform !== "web");

/**
 * A pinned horizontal strip of project frames. The frame in the middle of
 * the screen grows to full size, a ruler at the bottom shows where you are
 * and its year marks jump to each project.
 */
export default function Works() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const strip = stripRef.current;
      if (!section || !strip) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const distance = () => Math.max(0, strip.scrollWidth - window.innerWidth);
      let current = -1;

      const update = () => {
        const progress = triggerRef.current?.progress ?? 0;
        const x = progress * distance();
        strip.style.transform = `translate3d(${-x}px,0,0)`;
        if (markerRef.current) {
          markerRef.current.style.left = `${progress * 100}%`;
        }

        let nearest = 0;
        let nearestDistance = Infinity;
        frameRefs.current.forEach((el, index) => {
          if (!el) return;
          const center = el.offsetLeft + el.offsetWidth / 2 - x;
          const offset = (center - window.innerWidth / 2) / window.innerWidth;
          const t = Math.min(1, Math.abs(offset) * 1.6);
          if (!reduceMotion) {
            el.style.scale = String(1 - t * 0.2);
            el.style.opacity = String(1 - t * 0.55);
          }
          if (Math.abs(offset) < nearestDistance) {
            nearestDistance = Math.abs(offset);
            nearest = index;
          }
        });
        if (nearest !== current) {
          current = nearest;
          setActive(nearest);
        }
      };

      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // The trail above pins too; measure after it.
        refreshPriority: -1,
        onUpdate: update,
        onRefresh: update,
      });
      update();

      return () => {
        triggerRef.current = null;
      };
    },
    { scope: sectionRef },
  );

  function jumpTo(index: number) {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const progress = projects.length > 1 ? index / (projects.length - 1) : 0;
    scrollToY(trigger.start + progress * (trigger.end - trigger.start));
  }

  const project = projects[active];

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Work"
      className="relative flex h-svh flex-col overflow-hidden pt-24 pb-6"
    >
      <div className="flex items-end justify-between px-5 md:px-8">
        <div>
          <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
            {copy.eyebrow} · {projects.length} summits
          </p>
          <h2 className="font-display mt-2 text-4xl leading-none font-bold tracking-tight md:text-5xl">
            {copy.title}
          </h2>
        </div>
        <p className="font-mono text-sm tabular-nums opacity-60">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(projects.length).padStart(2, "0")}
        </p>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center">
        <div
          ref={stripRef}
          className="flex items-center gap-[4vw] px-[calc((100vw-min(62vw,72svh,880px))/2)] will-change-transform"
        >
          {projects.map((item, index) => (
            <Frame
              key={item.name}
              project={item}
              index={index}
              ref={(el) => {
                frameRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-5 md:px-8">
        <div className="flex min-h-24 flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={project.name}
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-6px)" }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
                {years[project.name] ?? "—"} ·{" "}
                {[isWeb(project) && "web", isMobile(project) && "mobile"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <h3 className="font-display mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                {project.name}
              </h3>
              <p className="mt-1 max-w-[60ch] text-sm opacity-60 md:text-base">
                {project.description}
              </p>
            </motion.div>
          </AnimatePresence>
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

        {/* Ruler: fine ticks for the whole strip, a year mark per project. */}
        <div className="relative mt-5 h-10">
          <div className="absolute inset-x-0 top-0 flex justify-between">
            {Array.from({ length: RULER_TICKS }, (_, tick) => (
              <span
                key={tick}
                className={cn(
                  "w-px bg-current",
                  tick % 6 === 0 ? "h-3 opacity-35" : "h-2 opacity-15",
                )}
              />
            ))}
          </div>
          {projects.map((item, index) => {
            const left = `${(index / Math.max(1, projects.length - 1)) * 100}%`;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => jumpTo(index)}
                aria-label={`Go to ${item.name}`}
                className={cn(
                  "absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 font-mono text-[10px] transition-opacity",
                  active === index ? "opacity-100" : "opacity-45 hover:opacity-80",
                )}
                style={{ left }}
              >
                <span className="h-4 w-px bg-current" />
                {years[item.name] ?? "—"}
              </button>
            );
          })}
          <span
            ref={markerRef}
            className="pointer-events-none absolute -top-1 size-2.5 -translate-x-1/2 rounded-full bg-[#c43a30]"
          />
        </div>
      </div>
    </section>
  );
}

function Frame({
  project,
  index,
  ref,
}: {
  project: ProductLaunchedItem;
  index: number;
  ref: (el: HTMLDivElement | null) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pillX = useSpring(x, { stiffness: 500, damping: 40 });
  const pillY = useSpring(y, { stiffness: 500, damping: 40 });
  const primary = project.links.find((link) => link.url !== "#");
  const mobileShot = !isWeb(project);
  // Alternate the disc between corners so the strip has a rhythm.
  const discCorner =
    index % 2 ? "-bottom-[18%] -left-[8%]" : "-top-[18%] -right-[8%]";

  function onMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const media = (
    <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-(--paper) shadow-[0_40px_80px_-40px_rgba(0,0,0,0.45)] ring-1 ring-current/10">
      <Image
        src={project.image}
        alt={project.name}
        fill
        sizes="(min-width: 768px) 62vw, 90vw"
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
    <div
      ref={ref}
      className="relative isolate w-[min(62vw,72svh,880px)] shrink-0 origin-center"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute -z-10 aspect-square w-[45%] rounded-full",
          discCorner,
        )}
        style={{ backgroundColor: discColors[index % discColors.length] }}
      />
      <p className="mb-3 font-mono text-[11px] tracking-wider uppercase opacity-55">
        Summit {String(index + 1).padStart(2, "0")}
      </p>
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
    </div>
  );
}
