"use client";

import { cn } from "../lib/utils";

export default function BreakpointsChecker({
  enabled = true,
  className,
}: {
  enabled?: boolean;
  className?: string;
}) {
  return (
    <div
      title="Breakpoints"
      className={cn(
        `
          pointer-events-none fixed right-4 bottom-12 z-20000 h-7 w-7 items-center justify-center
          rounded-full bg-[#1c1c1e] text-white
        `,
        enabled ? "flex" : "hidden",
        className,
      )}
    >
      <span
        className={`
          after:content-['O']
          sm:after:content-['sm']
          md:after:content-['md']
          lg:after:content-['lg']
          xl:after:content-['xl']
          2xl:after:content-['2xl']
        `}
      ></span>
    </div>
  );
}
