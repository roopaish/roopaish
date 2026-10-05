"use client";

import { Camp } from "@/data/journey";
import { cssX } from "@/lib/thread";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function CampLabel({ camp }: { camp: Camp }) {
  const [open, setOpen] = useState(false);
  // Ridge camps label upwards (the mountain fills below), detours downwards.
  const above = camp.route === "ridge";

  return (
    <div
      className="absolute"
      style={{ left: cssX(camp.at), top: `${camp.y * 100}%` }}
      data-reveal-a={camp.at.a}
      data-reveal-b={camp.at.b}
    >
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "absolute left-0 flex w-56 -translate-x-1/2 items-center text-center",
          above ? "bottom-3 flex-col-reverse" : "top-3 flex-col",
        )}
      >
        <span
          className={cn(
            "h-8 w-px",
            camp.route === "detour"
              ? "border-l border-dashed border-current opacity-40"
              : "bg-current opacity-30",
          )}
        />
        <span className="flex flex-col items-center gap-1 py-2">
          <span className="font-mono text-[11px] tracking-wide uppercase opacity-55">
            {camp.name} · {camp.altitude.toLocaleString("en-US")} m ·{" "}
            {camp.year}
          </span>
          <span className="font-display text-lg leading-tight font-semibold">
            {camp.title}
          </span>
          <span className="text-sm leading-snug opacity-60">{camp.body}</span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: above ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: above ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-none absolute left-0 z-10 w-72 -translate-x-1/2 rounded-md bg-(--ink) p-3 text-xs leading-relaxed text-(--paper) shadow-xl",
              above ? "top-5" : "bottom-5",
            )}
          >
            <p className="font-mono text-[10px] tracking-wide uppercase opacity-60">
              Field notes
            </p>
            <ul className="mt-2 space-y-1">
              {camp.details.map((line) => (
                <li key={line}>— {line}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
