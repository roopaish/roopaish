"use client";

import { MoveDiagonal2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

// A project's screenshots, laid out loosely on a desk like prints or papers:
// each at its own slight angle, overlapping a little. Drag any of them around;
// the one you pick up comes to the top. Zoom a print with two fingers on a
// phone, or by pulling the handle on its corner with the mouse (double-click
// puts it back). The pictures are never cropped and nothing here links out.
export function PrintDesk({ title, images, className }: { title: string; images: string[]; className?: string }) {
  const deskRef = useRef<HTMLDivElement>(null);
  const placed = scatter(title, images.length);
  // Stacking order, bottom to top. Picking a print up moves it to the end.
  const [order, setOrder] = useState(() => images.map((_, index) => index));
  const raise = (index: number) => setOrder((current) => [...current.filter((i) => i !== index), index]);
  return (
    // a size container, so each print can be capped by the desk's own width and height
    <div ref={deskRef} className={`relative aspect-[4/3] w-full [container-type:size] ${className ?? ""}`}>
      {images.map((src, index) => (
        <Print key={src} src={src} alt={`${title} screenshot ${index + 1}`} {...placed[index]!} z={order.indexOf(index) + 1} deskRef={deskRef} onRaise={() => raise(index)} />
      ))}
    </div>
  );
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const clampZoom = (n: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, n));

function Print({ src, alt, x, y, width, rotate, z, deskRef, onRaise }: { src: string; alt: string; x: number; y: number; width: number; rotate: number; z: number; deskRef: RefObject<HTMLDivElement | null>; onRaise: () => void }) {
  const reduce = useReducedMotion();
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const paperRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  // Mouse: pull the corner handle away from (or toward) the print's centre. It
  // listens natively so the print's own drag never sees the press.
  useEffect(() => {
    const handle = handleRef.current;
    const paper = paperRef.current;
    if (!handle || !paper) return;
    let start: { dist: number; zoom: number } | null = null;
    const distance = (event: PointerEvent) => {
      const box = paper.getBoundingClientRect();
      return Math.hypot(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2)) || 1;
    };
    const down = (event: PointerEvent) => {
      event.stopPropagation();
      event.preventDefault();
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // not an active pointer (nothing to capture); the move events still arrive from the handle
      }
      start = { dist: distance(event), zoom: zoomRef.current };
    };
    const move = (event: PointerEvent) => {
      if (start) setZoom(clampZoom((start.zoom * distance(event)) / start.dist));
    };
    const up = () => {
      start = null;
    };
    handle.addEventListener("pointerdown", down);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
    return () => {
      handle.removeEventListener("pointerdown", down);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
    };
  }, []);

  // Touch: two fingers on the print scale it with the gap between them.
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const gap = () => {
    const [a, b] = [...fingers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) || 1 : 0;
  };
  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    onRaise();
    if (event.pointerType !== "touch") return;
    fingers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (fingers.current.size === 2) pinch.current = { dist: gap(), zoom: zoomRef.current };
  };
  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fingers.current.has(event.pointerId)) return;
    fingers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && fingers.current.size === 2) setZoom(clampZoom((pinch.current.zoom * gap()) / pinch.current.dist));
  };
  const onUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    fingers.current.delete(event.pointerId);
    if (fingers.current.size < 2) pinch.current = null;
  };

  return (
    // a zero-size anchor at the print's centre; the print is centred on it (with the separate `translate`, so dragging is unaffected)
    <div className="absolute size-0" style={{ left: `${x}%`, top: `${y}%`, zIndex: z }}>
      <motion.div
        drag
        dragConstraints={deskRef}
        dragElastic={0.08}
        dragMomentum={false}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={() => setZoom(1)}
        whileHover={reduce ? undefined : { scale: 1.015 }}
        whileDrag={reduce ? undefined : { scale: 1.05, cursor: "grabbing" }}
        data-cursor="drag me around"
        className="group/print w-max -translate-x-1/2 -translate-y-1/2 cursor-grab select-none"
        style={{ rotate }}
      >
        {/* the paper; its zoom is the CSS `scale`, which stacks with the lift above */}
        <div
          ref={paperRef}
          className="relative rounded-[3px] bg-[#f4f4f2] shadow-[0_6px_14px_rgb(0_0_0/0.35),0_1px_2px_rgb(0_0_0/0.3)]"
          style={{ padding: "1.1cqw", scale: zoom, transition: "scale 0.12s ease-out" }}
        >
          <img src={src} alt={alt} loading="lazy" draggable={false} className="pointer-events-none block h-auto w-auto rounded-[2px]" style={{ maxWidth: `${width}cqw`, maxHeight: "68cqh" }} />
          {/* the zoom handle, a resize icon on the corner: only there (and only clickable) while this very print is hovered (a named group: the card around it is a `group` too), mouse only, and kept the same size however far the print is zoomed */}
          <span
            ref={handleRef}
            aria-hidden="true"
            data-cursor="pull to zoom"
            className="pointer-events-none absolute -bottom-2.5 -right-2.5 grid size-6 cursor-nwse-resize touch-none place-items-center rounded-md border border-black/20 bg-white text-black/70 opacity-0 shadow-md transition-opacity group-hover/print:pointer-events-auto group-hover/print:opacity-100 hover:text-black pointer-coarse:hidden"
            style={{ scale: 1 / zoom }}
          >
            <MoveDiagonal2 className="size-3.5" strokeWidth={2.25} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// A small, fixed "random": the same on the server and in the browser (integer
// maths only, so there is nothing for hydration to disagree about).
function seeded(text: string) {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Where each of `count` prints lands on the desk: a loose grid, nudged and
// turned at random. `x` / `y` are the print's centre in % of the desk, `width`
// the widest it may be in the same units (tall pictures are capped by height).
function scatter(seed: string, count: number) {
  const random = seeded(seed);
  const round = (n: number) => Math.round(n * 10) / 10;
  const columns = count <= 4 ? Math.min(count, 2) : 3;
  const rows = Math.ceil(count / columns);
  const width = count === 1 ? 70 : count === 2 ? 56 : count <= 4 ? 50 : 42;
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const inRow = row === rows - 1 ? count - row * columns : columns;
    const column = index - row * columns + (columns - inRow) / 2;
    return {
      x: round(Math.min(97 - width / 2, Math.max(width / 2 + 3, ((column + 0.5) / columns) * 100 + (random() - 0.5) * 12))),
      y: round(Math.min(62, Math.max(38, ((row + 0.5) / rows) * 100 + (random() - 0.5) * 12))),
      width,
      rotate: round((random() - 0.5) * (count === 1 ? 6 : 14)),
    };
  });
}

