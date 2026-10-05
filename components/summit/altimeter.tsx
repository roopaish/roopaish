"use client";

import { BASE_ALTITUDE, SUMMIT_ALTITUDE } from "@/data/journey";
import { useEffect, useRef } from "react";
import type { Subscribe } from "./string-line";

// A small altitude readout that climbs with the scroll.
export function Altimeter({ subscribe }: { subscribe: Subscribe }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const write = (progress: number) => {
      if (ref.current) ref.current.textContent = `${Math.round(BASE_ALTITUDE + progress * (SUMMIT_ALTITUDE - BASE_ALTITUDE)).toLocaleString("en-US")} m`;
    };
    write(0);
    return subscribe(write);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <p aria-hidden="true" className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-[11px] tracking-wide text-muted-foreground">
      ▲ <span ref={ref}>1,400 m</span>
    </p>
  );
}
