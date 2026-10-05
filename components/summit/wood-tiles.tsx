"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";

// Scrabble-style wooden tiles: one letter per square of wood. Drag a tile along
// the row and the others slide aside to make room (to the left or the right,
// wherever there is space); drop it and it settles into the gap. That way the
// letters can be rearranged into new words. (Only these tiles are draggable.)
const POINTS: Record<string, number> = { W: 4, O: 1, R: 1, K: 5, S: 1 };
const TILT = [-3, 2, -1.5, 3, -2.5, 1.5, -1];
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Point = { x: number; y: number };
type Drag = { id: number; startX: number; startY: number; slots: Point[]; order: number[]; origin: number; hover: number; size: number };

export function WoodTiles({ word, className }: { word: string; className?: string }) {
  const letters = [...word.toUpperCase()];
  // order[slot] = which letter sits in that slot
  const [order, setOrder] = useState(() => letters.map((_, i) => i));
  const [dragging, setDragging] = useState<number | null>(null);
  const tiles = useRef(new Map<number, HTMLElement>());
  const drag = useRef<Drag | null>(null);
  // Where tiles were just before a drop, so they can glide to their new places.
  const before = useRef<Map<number, DOMRect> | null>(null);

  useLayoutEffect(() => {
    const prev = before.current;
    if (!prev) return;
    before.current = null;
    // No CSS transition while we measure and replay the move ourselves.
    const moving = [...prev.keys()].map((id) => tiles.current.get(id)).filter((el): el is HTMLElement => Boolean(el));
    moving.forEach((el) => {
      el.style.transition = "none";
      el.style.translate = "";
    });
    prev.forEach((rect, id) => {
      const el = tiles.current.get(id);
      if (!el) return;
      const now = el.getBoundingClientRect();
      const dx = rect.left - now.left;
      const dy = rect.top - now.top;
      if (Math.abs(dx) + Math.abs(dy) < 1) return;
      el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 620, easing: SPRING });
    });
    requestAnimationFrame(() => moving.forEach((el) => (el.style.transition = "")));
  }, [order]);

  // The order the row would have if the held tile were dropped in `hover`.
  const preview = (d: Drag) => {
    const next = [...d.order];
    next.splice(d.origin, 1);
    next.splice(d.hover, 0, d.id);
    return next;
  };

  // Slide every other tile to where the preview order puts it.
  const showPreview = (d: Drag) => {
    const next = preview(d);
    d.order.forEach((tileId, oldSlot) => {
      if (tileId === d.id) return;
      const newSlot = next.indexOf(tileId);
      const from = d.slots[oldSlot]!;
      const to = d.slots[newSlot]!;
      const el = tiles.current.get(tileId);
      if (el) el.style.translate = newSlot === oldSlot ? "" : `${to.x - from.x}px ${to.y - from.y}px`;
    });
  };

  const start = (event: PointerEvent<HTMLElement>, id: number) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const slots = order.map((tileId) => {
      const r = tiles.current.get(tileId)!.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const origin = order.indexOf(id);
    drag.current = { id, startX: event.clientX, startY: event.clientY, slots, order: [...order], origin, hover: origin, size: event.currentTarget.getBoundingClientRect().width };
    setDragging(id);
  };

  const move = (event: PointerEvent<HTMLElement>, id: number) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    event.currentTarget.style.translate = `${dx}px ${dy}px`;
    // The slot nearest the held tile; far from every slot means "no change".
    const home = d.slots[d.origin]!;
    let hover = d.origin;
    let best = d.size * 1.3;
    d.slots.forEach((slot, index) => {
      const distance = Math.hypot(slot.x - (home.x + dx), slot.y - (home.y + dy));
      if (distance < best) {
        best = distance;
        hover = index;
      }
    });
    if (hover !== d.hover) {
      d.hover = hover;
      showPreview(d);
    }
  };

  const end = (event: PointerEvent<HTMLElement>, id: number) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    drag.current = null;
    setDragging(null);
    if (d.hover === d.origin) {
      // Dropped where it started: everything eases back (the CSS transition does it).
      event.currentTarget.style.translate = "";
      return;
    }
    // Drop into the gap. The others are already standing in their new places,
    // so only the held tile has any distance left to glide.
    const prev = new Map<number, DOMRect>();
    d.order.forEach((tileId) => prev.set(tileId, tiles.current.get(tileId)!.getBoundingClientRect()));
    before.current = prev;
    setOrder(preview(d));
  };

  const current = order.map((id) => letters[id]).join("");
  return (
    <p aria-label={current} className={`flex flex-wrap gap-[0.12em] text-[clamp(2.4rem,8.5vw,8rem)] md:text-[clamp(2.4rem,6vw,5.5rem)] ${className ?? ""}`}>
      {order.map((id) => {
        const letter = letters[id]!;
        return (
          <span
            key={id}
            ref={(el) => {
              if (el) tiles.current.set(id, el);
              else tiles.current.delete(id);
            }}
            aria-hidden="true"
            data-dragging={dragging === id}
            onPointerDown={(event) => start(event, id)}
            onPointerMove={(event) => move(event, id)}
            onPointerUp={(event) => end(event, id)}
            onPointerCancel={(event) => end(event, id)}
            className="wood-tile w-[1.5em]"
            style={{ rotate: `${TILT[id % TILT.length]}deg` }}
          >
            <span className="wood-letter text-[1em]">{letter}</span>
            {POINTS[letter] !== undefined && <span className="wood-points">{POINTS[letter]}</span>}
          </span>
        );
      })}
    </p>
  );
}
