"use client";

import {
  camps,
  climbCopy,
  gear,
  heroCopy,
  packingCopy,
  packingList,
  summitCopy,
} from "@/data/journey";
import { scrollToElement } from "@/lib/lenis";
import { cssX } from "@/lib/thread";
import { useContactFormModal } from "@/stores/contact-form-modal";
import { ArrowDownIcon, CheckIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import CampLabel from "./camp-label";

const ease = [0.22, 1, 0.36, 1] as const;

function scrollToWork() {
  scrollToElement(document.getElementById("work"));
}

export function HeroPanel() {
  const openContact = useContactFormModal((state) => state.open);
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: reduceMotion ? 0 : delay, ease },
  });

  return (
    <div className="absolute inset-y-0 left-0" style={{ width: "var(--u)" }}>
      {/* "You are here" marker at the start of the route. */}
      <motion.div
        {...fadeUp(0.4)}
        className="absolute flex -translate-y-1/2 items-center gap-2"
        style={{ left: "calc(var(--u) * 0.06 - 7px)", top: "36%" }}
      >
        <span className="relative flex size-3.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#c43a30] opacity-40" />
          <span className="relative size-3.5 rounded-full border-2 border-(--paper) bg-[#c43a30]" />
        </span>
        <span className="mt-9 -ml-5 font-mono text-[10px] tracking-wider uppercase opacity-60">
          You are here
        </span>
      </motion.div>

      <div className="absolute bottom-8 left-5 max-w-xl md:left-8">
        <motion.p
          {...fadeUp(0.9)}
          className="mb-4 font-mono text-[11px] tracking-wider uppercase opacity-60"
        >
          {heroCopy.coordinates}
        </motion.p>
        <motion.h1
          {...fadeUp(1)}
          className="font-display text-5xl leading-[0.9] font-bold tracking-tight md:text-7xl"
        >
          {heroCopy.name}
        </motion.h1>
        <motion.p {...fadeUp(1.15)} className="mt-4 text-lg md:text-xl">
          {heroCopy.role}
        </motion.p>
        <motion.p {...fadeUp(1.25)} className="mt-1 opacity-60">
          {heroCopy.line}
        </motion.p>
      </div>

      <motion.div
        {...fadeUp(1.5)}
        className="absolute right-5 bottom-8 hidden flex-col items-end gap-3 md:right-8 md:flex"
      >
        <p className="font-mono text-[11px] tracking-wider uppercase opacity-60">
          {heroCopy.hint}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollToWork}
            className="h-11 rounded-full border border-current/25 px-5 text-sm transition-colors hover:border-current"
          >
            Skip to the work
          </button>
          <button
            type="button"
            onClick={openContact}
            className="h-11 rounded-full bg-(--ink) px-5 text-sm text-(--paper) transition-opacity hover:opacity-85"
          >
            Say namaste
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function PeakLabels({
  peaks,
}: {
  peaks: { name: string; altitude: number; x: number; y: number }[];
}) {
  return peaks.map((peak) => (
    <div
      key={peak.name}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center"
      style={{ left: peak.x, top: peak.y }}
    >
      <span className="mx-auto block size-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-current opacity-70" />
      <span className="mt-1 block font-mono text-[10px] tracking-wider whitespace-nowrap uppercase opacity-60">
        {peak.name}
      </span>
      <span className="block font-mono text-[10px] opacity-40">
        {peak.altitude.toLocaleString("en-US")} m
      </span>
    </div>
  ));
}

export function Gear() {
  return gear.map((object) => (
    <div
      key={object.src}
      className="absolute"
      style={{ left: cssX(object.at), top: `${object.y * 100}%` }}
      data-drift={object.drift}
    >
      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={0.4}
        whileHover={{ scale: 1.08, rotate: object.rotate * -0.6 }}
        whileDrag={{ scale: 1.15, cursor: "grabbing" }}
        style={{ rotate: object.rotate, width: object.size }}
        className="cursor-grab touch-none drop-shadow-[0_24px_24px_rgba(0,0,0,0.12)]"
      >
        <Image
          src={object.src}
          alt={object.alt}
          width={256}
          height={256}
          draggable={false}
          className="pointer-events-none h-auto w-full select-none"
        />
      </motion.div>
    </div>
  ));
}

export function PackingPanel() {
  return (
    <div
      className="absolute top-[46%] w-[min(30rem,88vw)] -translate-x-1/2 -translate-y-1/2 -rotate-1 rounded-sm bg-(--paper) p-6 shadow-[0_1px_0_rgba(0,0,0,0.06),0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-current/10 md:p-8"
      style={{ left: cssX({ a: 1, b: 0.48 }) }}
    >
      <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
        {packingCopy.eyebrow}
      </p>
      <p className="font-display mt-2 text-3xl leading-tight font-semibold tracking-tight">
        {packingCopy.title}
      </p>
      <ul className="mt-6 divide-y divide-current/10 border-y border-current/10">
        {packingList.map((entry, index) => (
          <li
            key={entry.item}
            className="packing-item flex items-center gap-3 py-2.5"
            // Each line ticks off as the pen passes under the list.
            data-reveal-a={1}
            data-reveal-b={0.26 + index * 0.07}
          >
            <span className="packing-box grid size-5 shrink-0 place-items-center rounded-[3px] border border-current/40">
              <CheckIcon className="size-3.5" strokeWidth={3} />
            </span>
            <span className="font-medium">{entry.item}</span>
            <span className="ml-auto text-right text-sm opacity-55">
              {entry.why}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[10px] tracking-wider uppercase opacity-45">
        {packingCopy.note}
      </p>
    </div>
  );
}

export function ClimbPanel() {
  return (
    <>
      <div
        className="absolute top-[10%]"
        style={{ left: cssX({ a: 1, b: 1.15 }) }}
        data-reveal-a={1}
        data-reveal-b={1.08}
      >
        <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
          {climbCopy.eyebrow}
        </p>
        <p className="font-display mt-2 text-5xl font-bold tracking-tight md:text-6xl">
          {climbCopy.title}
        </p>
      </div>
      {camps
        .filter((camp) => !camp.hideLabel)
        .map((camp) => (
          <CampLabel key={`${camp.name}-${camp.year}`} camp={camp} />
        ))}
    </>
  );
}

export function SummitPanel() {
  return (
    <div
      className="absolute top-[52%] w-[min(26rem,85vw)]"
      style={{
        left: `calc(${cssX({ a: 1, b: 2.8 })} + min(var(--u) * 0.24, var(--u) - 27rem))`,
      }}
      data-reveal-a={1.2}
      data-reveal-b={2.8}
    >
      <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
        {summitCopy.eyebrow}
      </p>
      <p className="font-display mt-2 text-4xl leading-[1.05] font-bold tracking-tight md:text-5xl">
        {summitCopy.title}
      </p>
      <p className="mt-3 opacity-60">{summitCopy.body}</p>
      <button
        type="button"
        onClick={scrollToWork}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-(--ink) px-5 text-sm text-(--paper) transition-opacity hover:opacity-85"
      >
        See the work <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}
