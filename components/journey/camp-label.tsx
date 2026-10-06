"use client";

import { Camp } from "@/data/journey";
import { cssX } from "@/lib/thread";
import { cn } from "@/lib/utils";
import Chat from "./chat";

export default function CampLabel({ camp }: { camp: Camp }) {
  // Ridge camps label upwards (the mountain fills below), detours downwards.
  const above = camp.route === "ridge";

  return (
    <div
      className="absolute"
      style={{ left: cssX(camp.at), top: `${camp.y * 100}%` }}
      data-reveal-a={camp.at.a}
      data-reveal-b={camp.at.b}
    >
      <div
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
        <Chat messages={camp.chat} placement="right">
          <button
            type="button"
            className="flex cursor-help flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors hover:bg-current/5"
          >
            <span className="font-mono text-[11px] tracking-wide uppercase opacity-55">
              {camp.name} · {camp.altitude.toLocaleString("en-US")} m ·{" "}
              {camp.year}
            </span>
            <span className="font-display text-lg leading-tight font-semibold">
              {camp.title}
            </span>
            <span className="text-sm leading-snug opacity-60">{camp.body}</span>
          </button>
        </Chat>
      </div>
    </div>
  );
}
