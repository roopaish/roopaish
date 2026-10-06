"use client";

import {
  camps,
  climbCopy,
  HeroPeak,
  heroCopy,
  pinChat,
  stackCopy,
  stackTimeline,
  summit,
  summitCopy,
} from "@/data/journey";
import { scrollToElement } from "@/lib/lenis";
import { cssX } from "@/lib/thread";
import { useContactFormModal } from "@/stores/contact-form-modal";
import { ArrowDownIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import CampLabel from "./camp-label";
import Chat from "./chat";

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
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: "calc(var(--u) * 0.06)", top: "50%" }}
      >
        <Chat messages={pinChat} placement="right">
          <button
            type="button"
            aria-label="Say hi"
            className="relative flex size-8 cursor-help items-center justify-center"
          >
            <span className="absolute size-3.5 animate-ping rounded-full bg-[#c43a30] opacity-40" />
            <span className="relative size-3.5 rounded-full border-2 border-(--paper) bg-[#c43a30]" />
            <span className="absolute top-8 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase opacity-60">
              You are here
            </span>
          </button>
        </Chat>
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

export function HeroPeakLabel({
  peak,
  x,
  y,
}: {
  peak: HeroPeak;
  x: number;
  y: number;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full pb-2"
      style={{ left: x, top: y }}
    >
      <Chat messages={peak.chat} placement="bottom">
        <button
          type="button"
          className="flex cursor-help flex-col items-center rounded-md px-2 py-1 text-center transition-colors hover:bg-current/5"
        >
          <span className="font-mono text-[10px] tracking-wider whitespace-nowrap uppercase opacity-60">
            {peak.name}
          </span>
          <span className="font-mono text-[10px] opacity-40">
            {peak.altitude.toLocaleString("en-US")} m
          </span>
          <span className="mt-1 h-3 w-px bg-current opacity-30" />
        </button>
      </Chat>
    </div>
  );
}

export function StackPanel() {
  return (
    <>
      <div
        className="absolute top-[11%]"
        style={{ left: cssX({ a: 1, b: 0.1 }) }}
        data-reveal-a={1}
        data-reveal-b={0.1}
      >
        <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
          {stackCopy.eyebrow}
        </p>
        <p className="font-display mt-2 max-w-[22ch] text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
          {stackCopy.title}
        </p>
      </div>

      {stackTimeline.map((entry) => (
        // Each stop reaches from its card down to the trail, which is the
        // timeline's axis here. The dot fills in once the hiker passes it.
        <div
          key={entry.item}
          className="stack-stop absolute bottom-[16%] flex w-0 flex-col items-center"
          style={{ left: cssX(entry.at), top: `${entry.y * 100}%` }}
          data-reveal-a={entry.at.a}
          data-reveal-b={entry.at.b}
        >
          <Chat messages={entry.chat} placement="top">
            <button
              type="button"
              className="stack-card flex w-40 cursor-help flex-col items-center gap-1 rounded-xl bg-(--paper) px-3 pt-2 pb-3 text-center ring-1 ring-current/10 transition-[box-shadow,translate] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]"
            >
              <Image
                src={entry.icon}
                alt=""
                width={96}
                height={96}
                className="size-12 drop-shadow-[0_8px_8px_rgba(0,0,0,0.12)]"
              />
              <span className="font-mono text-[11px] tracking-wider opacity-55">
                {entry.year}
              </span>
              <span className="font-display leading-tight font-semibold">
                {entry.item}
              </span>
            </button>
          </Chat>
          <span className="stack-stick w-px flex-1 bg-current opacity-25" />
          <span className="stack-dot size-3 translate-y-1/2 rounded-full border-2 border-current bg-(--paper)" />
        </div>
      ))}
    </>
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
      {camps.map((camp) => (
        <CampLabel key={`${camp.name}-${camp.year}`} camp={camp} />
      ))}
    </>
  );
}

export function SummitPanel() {
  return (
    <>
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: cssX(summit.at), top: `${summit.y * 100}%` }}
        data-reveal-a={summit.at.a}
        data-reveal-b={summit.at.b}
      >
        <Chat messages={summit.chat} placement="bottom">
          <button
            type="button"
            aria-label="Summit"
            className="relative flex size-8 cursor-help items-center justify-center"
          >
            <span className="absolute size-4 animate-ping rounded-full bg-[#c43a30] opacity-30" />
            <span className="relative size-2.5 rounded-full bg-[#c43a30]" />
          </button>
        </Chat>
      </div>
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
    </>
  );
}
