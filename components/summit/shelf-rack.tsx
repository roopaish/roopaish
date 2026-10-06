"use client";

import { copy, type SummitProject } from "@/data/summit";
import { motion } from "motion/react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { useState } from "react";

// The bookcase itself: two shelves of dark glass cards, each with a wooden
// plaque in front. Every cell draws its own stretch of board, so the shelf
// reads as one plank however many cards fit in a row.

// Closing the shelf plays the drop backwards: the cards lift off the boards and
// vanish upward, last one first.
export const LEAVE_STAGGER_S = 0.05;
export const LEAVE_CARD_S = 0.35;

type Leave = { leaving: boolean; total: number };

const drop = (reduce: boolean, index: number, { leaving, total }: Leave) => ({
  initial: { y: reduce ? 0 : -140, opacity: 0, rotate: reduce ? 0 : index % 2 ? 4 : -4 },
  animate: leaving ? { y: -140, opacity: 0, rotate: index % 2 ? 4 : -4 } : { y: 0, opacity: 1, rotate: 0 },
  exit: reduce ? undefined : { y: 160, opacity: 0, transition: { duration: 0.34, ease: [0.5, 0, 0.9, 0.4] as const, delay: index * 0.025 } },
  transition: reduce
    ? { duration: 0 }
    : leaving
      ? { duration: LEAVE_CARD_S, ease: [0.55, 0, 0.8, 0.4] as const, delay: (total - 1 - index) * LEAVE_STAGGER_S }
      : { type: "spring" as const, stiffness: 200, damping: 16, delay: 0.2 + index * 0.08 },
});

// A cell's stretch of board, wider than the cell so neighbours join up.
function Board({ reduce }: { reduce: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="shelf-board pointer-events-none absolute -inset-x-1 bottom-0 z-0"
      exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
    />
  );
}

function Plaque({ number, text, reduce }: { number: string; text: string; reduce: boolean }) {
  return (
    <motion.div
      className="shelf-plaque relative z-10 -mt-5 mb-[9px] flex items-center gap-3 rounded-[6px] px-2.5 py-2 text-[#3b2410]"
      exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[5px] bg-[#e7b988] font-story text-lg shadow-[inset_0_1px_0_rgb(255_244_214/0.7),0_2px_3px_rgb(80_40_10/0.35)]">{number}</span>
      <span className="line-clamp-2 min-w-0 text-xs leading-snug text-[#3b2410]/90">{text}</span>
    </motion.div>
  );
}

const glass = "relative block w-full overflow-hidden rounded-[10px] border border-white/20 bg-[#1b1a1c]/90 text-left shadow-[0_14px_22px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.12)]";

export function ShelfCard({ project, index, reduce, leave, onOpen }: { project: SummitProject; index: number; reduce: boolean; leave: Leave; onOpen: () => void }) {
  return (
    <div className="relative px-2.5 pb-0 pt-2">
      <motion.div className="relative z-10" {...drop(reduce, index, leave)} whileHover={reduce ? undefined : { y: -16, transition: { type: "spring", stiffness: 320, damping: 18, delay: 0 } }}>
        <button type="button" onClick={onOpen} aria-label={`Open ${project.title}`} data-cursor="open it up" className={`${glass} group`}>
          <span className="flex items-center gap-2 px-3 py-2.5 pr-10">
            <span className="grid size-6 shrink-0 place-items-center rounded-[6px] text-xs font-bold text-black" style={{ background: project.accent }}>{project.shortTitle[0]}</span>
            <span className="truncate text-sm font-semibold text-gray-100">{project.shortTitle}</span>
          </span>
          <span className="block px-2 pb-2">
            <img src={project.image} alt={`${project.title} cover`} draggable={false} className="aspect-[4/3] w-full rounded-[6px] bg-white/5 object-cover object-top" />
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.13),rgb(255_255_255/0)_30%)]" />
        </button>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title}, live site (opens in a new tab)`}
            data-cursor="open it ↗"
            className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full text-gray-100/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowUpRight className="size-4" />
          </a>
        )}
        <Plaque number={project.number} text={project.blurb} reduce={reduce} />
      </motion.div>
      <Board reduce={reduce} />
    </div>
  );
}

// What else is in the toolbox: pick a kind of project, see what it runs on.
const others = [
  { label: "Web Apps", stack: [["Next.js 15 · React 19", "#e5484d"], ["Tailwind CSS · Stripe", "#f08a24"]] },
  { label: "Mobile Apps", stack: [["React Native (Expo 55)", "#e5484d"], ["Flutter", "#3e7bfa"]] },
  { label: "Backend APIs", stack: [["NestJS 11 · PostgreSQL", "#e5484d"], ["Payments · Notifications", "#c06bd0"]] },
  { label: "DevOps / Infra", stack: [["Docker · Traefik · Cloudflare", "#3e7bfa"], ["CI/CD · Monitoring", "#c06bd0"]] },
  { label: "Internal Tools", stack: [["Dashboards · admin panels", "#2fb47c"], ["and more…", "#c06bd0"]] },
] as const;

export function OtherCard({ index, number, reduce, leave }: { index: number; number: string; reduce: boolean; leave: Leave }) {
  const [active, setActive] = useState(0);
  return (
    <div className="relative px-2.5 pb-0 pt-2">
      <motion.div className="relative z-10" {...drop(reduce, index, leave)}>
        <div className={glass}>
          <span className="flex items-center gap-2 px-3 py-2.5">
            <Code2 className="size-5 shrink-0 text-gray-100" />
            <span className="truncate text-sm font-semibold text-gray-100">{copy.works.otherCard}</span>
          </span>
          <div className="px-2 pb-2">
            <div className="flex aspect-[4/3] flex-col gap-2 overflow-hidden rounded-[6px] bg-[#101012] p-2" role="tablist" aria-label="Kinds of project">
              <div className="flex flex-wrap gap-1">
                {others.map((item, i) => (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => setActive(i)}
                    className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${active === i ? "bg-white/12 text-white" : "text-gray-100/60 hover:bg-white/6 hover:text-gray-100"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <ul role="tabpanel" className="mt-auto flex flex-col gap-1 rounded-[6px] bg-white/5 p-2 text-[11px] text-gray-100/85">
                {others[active].stack.map(([text, dot]) => (
                  <li key={text} className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: dot }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Plaque number={number} text={copy.works.otherTagline} reduce={reduce} />
      </motion.div>
      <Board reduce={reduce} />
    </div>
  );
}

// Three books and a cat asleep on top, standing on the lower shelf.
const books = [
  { label: "Ideas", colour: "from-[#3b5a7a] to-[#2b4560]", offset: "ml-0" },
  { label: "Build", colour: "from-[#3f6a8f] to-[#2d5072]", offset: "ml-2" },
  { label: "Learn", colour: "from-[#4a7ba2] to-[#355d82]", offset: "-ml-1" },
  { label: "Repeat", colour: "from-[#c79a52] to-[#a87a34]", offset: "ml-1.5" },
];

export function BookStack({ reduce, leave }: { reduce: boolean; leave: Leave }) {
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute bottom-[18px] right-3 z-10 hidden w-24 xl:block" {...drop(reduce, leave.total - 1, leave)}>
      <svg viewBox="0 0 96 46" className="relative z-10 -mb-2 ml-3 w-20">
        <ellipse cx="44" cy="34" rx="34" ry="12" fill="#e9b774" />
        <circle cx="18" cy="26" r="11" fill="#f0c488" />
        <path d="M10 18 14 8l6 8ZM22 16l5-8 3 10Z" fill="#e9b774" />
        <path d="M12 27q3 3 6 0M20 27q3 3 6 0" stroke="#7a4a1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M76 36c10 0 14-8 8-14" stroke="#e9b774" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M30 24q3-4 0-8M40 22q3-4 0-9M50 22q3-4 0-8" stroke="#c58f4d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-start">
        {books.map((book) => (
          <span key={book.label} className={`${book.offset} flex h-[26px] w-[92px] items-center rounded-[3px] bg-gradient-to-b ${book.colour} px-3 font-story text-sm text-[#f3dba5] shadow-[0_2px_3px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.2)]`}>
            {book.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// A pointed leaf lying along +x from its stem, with a midrib.
const LEAF = "M0 0C5-9 17-10 26 0C17 10 5 9 0 0Z";
const GREENS = ["#2f6b2c", "#3f8a35", "#4fa03e", "#68b84a", "#8acb5c"];

// A small seeded random, so the vines come out the same every render.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Each strand wanders down from the top edge; leaves sit along it, a pair
// every few steps, big near the top and smaller toward the tip.
const strands = [
  { x: 30, len: 270, sway: 14, phase: 0, seed: 3 },
  { x: 58, len: 200, sway: 12, phase: 1.6, seed: 11 },
  { x: 14, len: 150, sway: 9, phase: 3.1, seed: 23 },
  { x: 76, len: 110, sway: 8, phase: 4.4, seed: 37 },
];

const vine = strands.map(({ x, len, sway, phase, seed }) => {
  const rand = seeded(seed);
  const steps = Math.round(len / 9);
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return { x: x + Math.sin(t * 5 + phase) * sway * (0.4 + t), y: t * len, t };
  });
  const leaves = points.flatMap((point, i) => {
    if (i === 0 || i % 2) return [];
    const next = points[Math.min(i + 1, steps)];
    const heading = (Math.atan2(next.y - point.y, next.x - point.x) * 180) / Math.PI;
    const size = 1.15 - point.t * 0.55;
    return [1, -1].map((side) => ({
      x: point.x,
      y: point.y,
      angle: heading + side * (48 + rand() * 30),
      scale: size * (0.8 + rand() * 0.5),
      fill: GREENS[Math.floor(rand() * GREENS.length)],
    }));
  });
  return { d: points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(""), leaves };
});

// Leaves trailing down from the top corner, swaying a little.
export function Vine({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 110 290"
      className={`vine-sway pointer-events-none absolute drop-shadow-[0_6px_6px_rgb(0_0_0/0.45)] ${flip ? "-scale-x-100" : ""} ${className ?? ""}`}
    >
      {vine.map(({ d, leaves }) => (
        <g key={d.slice(0, 24)}>
          <path d={d} stroke="#244f22" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {leaves.map((leaf) => (
            <g key={`${leaf.x}-${leaf.y}-${leaf.angle}`} transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.angle.toFixed(0)}) scale(${leaf.scale.toFixed(2)})`}>
              <path d={LEAF} fill={leaf.fill} />
              <path d="M2 0H22" stroke="#1d4a1c" strokeOpacity="0.45" strokeWidth="1" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
