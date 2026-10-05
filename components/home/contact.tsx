"use client";

import { profile } from "@/data/profile";
import { scrollToY } from "@/lib/lenis";
import { useContactFormModal } from "@/stores/contact-form-modal";
import { palettes, useTimePalette } from "@/stores/time-palette";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// TODO: replace copy.
const copy = {
  eyebrow: "Back at base camp",
  greeting: "नमस्ते",
  title: "I'm Rupesh.",
  body: "Usually somewhere in Kathmandu with a laptop and a cup of chiya. Happy to work across any timezone.",
  pitch: "Planning a climb? I'd love to hear about it.",
  funFact: "Fun fact: TODO — something nobody would guess about you.",
};

// TODO: replace with your real signature (export a single SVG path).
const SIGNATURE_PATH =
  "M8 62 C 20 20, 40 8, 44 30 S 24 74, 18 60 S 56 24, 70 40 S 70 66, 84 52 S 104 26, 112 44 S 112 64, 126 52 S 150 30, 158 46 S 160 62, 176 50 S 204 34, 214 46 S 228 58, 250 40";

export default function Contact() {
  const openContact = useContactFormModal((state) => state.open);

  return (
    <section id="contact" className="px-5 pt-32 pb-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[11px] tracking-wider uppercase opacity-55">
          {copy.eyebrow}
        </p>

        <div className="mt-6 grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-6xl leading-[0.95] font-bold tracking-tight md:text-8xl">
              <span lang="ne" className="block">
                {copy.greeting}
              </span>
              <span className="block">{copy.title}</span>
            </h2>
            <p className="mt-6 max-w-[42ch] opacity-60">{copy.body}</p>
            <Signature />
          </div>

          <div className="flex flex-col justify-end">
            <p className="font-display max-w-[18ch] text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
              {copy.pitch}
            </p>
            <CopyEmail email={profile.email} />
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-1 rounded-full border border-current/20 px-4 text-sm transition-colors hover:border-current"
                >
                  {social.platform.toLowerCase()}
                  <ArrowUpRightIcon className="size-3.5 opacity-60" />
                </a>
              ))}
              <button
                type="button"
                onClick={openContact}
                className="inline-flex h-10 items-center rounded-full bg-(--ink) px-4 text-sm text-(--paper) transition-opacity hover:opacity-85"
              >
                Start a project
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-28 flex flex-col gap-4 border-t border-current/10 pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <TimeTravel />
          <p className="opacity-60">{copy.funFact}</p>
          <div className="flex gap-5 opacity-60">
            <Link href="/classic" className="hover:opacity-100">
              Old version
            </Link>
            <button type="button" onClick={() => scrollToY(0)}>
              Back to the trailhead ↑
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

function Signature() {
  return (
    <svg
      viewBox="0 0 260 80"
      className="mt-10 w-56 overflow-visible"
      aria-label="signature"
      role="img"
    >
      <motion.path
        d={SIGNATURE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
    </svg>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <div className="mt-8 flex items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="font-display text-2xl font-semibold underline decoration-current/20 underline-offset-8 transition-colors hover:decoration-current md:text-3xl"
      >
        {email}
      </a>
      <button
        type="button"
        aria-label="Copy email"
        onClick={async () => {
          await navigator.clipboard.writeText(email);
          setCopied(true);
        }}
        className="relative grid size-10 place-items-center rounded-full border border-current/20 transition-colors hover:border-current"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            transition={{ duration: 0.18 }}
          >
            {copied ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute -top-8 rounded bg-(--ink) px-2 py-1 text-xs text-(--paper)"
            >
              copied
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

function TimeTravel() {
  const palette = useTimePalette((state) => state.palette);
  const overridden = useTimePalette((state) => state.overridden);
  const cycle = useTimePalette((state) => state.cycle);
  const [time, setTime] = useState<{ yours: string; kathmandu: string } | null>(
    null,
  );

  useEffect(() => {
    const format = (timeZone?: string) =>
      new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      });
    const update = () =>
      setTime({ yours: format(), kathmandu: format("Asia/Kathmandu") });
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      onClick={cycle}
      className="group inline-flex items-center gap-2 text-left opacity-60 transition-opacity hover:opacity-100"
    >
      <span className="size-2.5 rounded-full border border-current bg-(--paper)" />
      <span>
        {time ? `${time.kathmandu} in Kathmandu · ` : ""}
        {overridden
          ? `Time travelling: ${palettes[palette].label} mode.`
          : `${time?.yours ?? "…"} for you, so this page is in ${palettes[palette].label} mode.`}{" "}
        <span className="underline underline-offset-4">Change</span>
      </span>
    </button>
  );
}
