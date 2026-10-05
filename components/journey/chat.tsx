"use client";

import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

const TYPING_MS = 550;

type Placement = "top" | "bottom" | "right" | "left";

const placements: Record<Placement, string> = {
  top: "bottom-full left-1/2 mb-3 -translate-x-1/2 items-center",
  bottom: "top-full left-1/2 mt-3 -translate-x-1/2 items-center",
  right: "left-full top-1/2 ml-4 -translate-y-1/2 items-start",
  left: "right-full top-1/2 mr-4 -translate-y-1/2 items-end",
};

/**
 * Wraps a hotspot: hovering (or focusing / tapping) it opens a little chat
 * thread from me, with a typing indicator before each message.
 */
export default function Chat({
  messages,
  placement = "top",
  className,
  children,
}: {
  messages: string[];
  placement?: Placement;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", open && "z-30", className)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-none absolute flex w-64 flex-col",
              placements[placement],
            )}
          >
            <Thread messages={messages} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Thread({ messages }: { messages: string[] }) {
  // How many messages have "arrived"; the next one shows as typing dots.
  const [arrived, setArrived] = useState(0);

  useEffect(() => {
    if (arrived >= messages.length) return;
    const timer = setTimeout(
      () => setArrived((count) => count + 1),
      arrived === 0 ? TYPING_MS * 0.7 : TYPING_MS + messages[arrived].length * 12,
    );
    return () => clearTimeout(timer);
  }, [arrived, messages]);

  return (
    <span className="flex w-full items-end gap-2">
      <Image
        src={profile.avatar}
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-full ring-2 ring-(--paper)"
      />
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span className="font-mono text-[10px] tracking-wide uppercase opacity-50">
          Rupesh · now
        </span>
        {messages.slice(0, arrived).map((message, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "rounded-2xl bg-(--ink) px-3.5 py-2 text-left text-sm leading-snug text-(--paper) shadow-lg",
              index === arrived - 1 && arrived === messages.length
                ? "rounded-bl-md"
                : "",
            )}
          >
            {message}
          </motion.span>
        ))}
        {arrived < messages.length && (
          <span className="flex h-8 items-center gap-1 rounded-2xl rounded-bl-md bg-(--ink) px-3.5">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="size-1.5 rounded-full bg-(--paper)"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: dot * 0.15,
                }}
              />
            ))}
          </span>
        )}
      </span>
    </span>
  );
}
