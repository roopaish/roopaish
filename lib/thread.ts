// Geometry helpers for the scroll-driven "thread" that runs through the homepage.

export type Point = { x: number; y: number };

/**
 * Positions on the horizontal track are expressed as `a * u + b * U`, where
 * `u` is the viewport width and `U` is the viewport width clamped to a
 * minimum. Panels that need room for text (interests, timeline) are laid out
 * in `U` so they never get squashed on phones. CSS mirrors this with
 * `calc(var(--u) * a + var(--U) * b)`.
 */
export type TrackX = { a: number; b: number };
export type TrackPoint = TrackX & { y: number };

export const MIN_UNIT = 900;

export type TrackSize = { u: number; U: number; h: number };

export function trackSize(width: number, height: number): TrackSize {
  return { u: width, U: Math.max(width, MIN_UNIT), h: height };
}

export function resolveX({ a, b }: TrackX, size: TrackSize) {
  return a * size.u + b * size.U;
}

export function cssX({ a, b }: TrackX) {
  return `calc(var(--u) * ${a} + var(--U) * ${b})`;
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/** Evenly spaced points along a smooth curve through `waypoints`. */
export function resample(waypoints: Point[], spacing: number): Point[] {
  const dense: Point[] = [];
  const steps = 24;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(i - 1, 0)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(i + 2, waypoints.length - 1)];
    for (let s = 0; s < steps; s++) {
      dense.push(catmullRom(p0, p1, p2, p3, s / steps));
    }
  }
  dense.push(waypoints[waypoints.length - 1]);

  const out: Point[] = [dense[0]];
  let carried = 0;
  for (let i = 1; i < dense.length; i++) {
    const prev = dense[i - 1];
    const cur = dense[i];
    const segment = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    let along = spacing - carried;
    while (along <= segment) {
      const t = along / segment;
      out.push({
        x: prev.x + (cur.x - prev.x) * t,
        y: prev.y + (cur.y - prev.y) * t,
      });
      along += spacing;
    }
    carried = segment - (along - spacing);
  }
  out.push(dense[dense.length - 1]);
  return out;
}

/** Smooth SVG path through `count` points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: Point[], count = points.length) {
  if (count < 2) return "";

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < count - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, count - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Closed smooth SVG path through `points` (wraps around). */
export function closedSmoothPath(points: Point[]) {
  const n = points.length;
  if (n < 3) return "";

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return `${d}Z`;
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
