import {
  BASE_ALTITUDE,
  camps,
  CONTOUR_INTERVAL,
  detour,
  flagLine,
  peaks,
  track,
  trailWaypoints,
} from "@/data/journey";
import {
  mulberry32,
  Point,
  resample,
  resolveX,
  smoothPath,
  TrackPoint,
  TrackSize,
} from "@/lib/thread";

const SPACING = 16;
/** How much slower the distant range moves than the trail. */
export const FAR_RANGE_SPEED = 0.45;

export type Contour = {
  /** Points of the ring before the cursor bends it. */
  base: Point[];
  index: boolean;
};

export type TopoPeak = {
  name: string;
  center: Point;
  spacing: number;
  altitude: number;
  contours: Contour[];
};

export type JourneyGeometry = {
  size: TrackSize;
  width: number;
  peaks: TopoPeak[];
  /** Evenly spaced trail; points before `ridgeStart` are the map route. */
  trail: Point[];
  ridgeStart: number;
  /** Non-decreasing x at which each trail point gets drawn. */
  revealX: number[];
  /** Mountain body under the climb, starting just before base camp. */
  ridgeFill: { d: string; startX: number };
  detour: string;
  camps: Point[];
  /** Pole bases on the ridge and the tops the flag string is tied to. */
  poles: { base: Point; top: Point }[];
  farRange: { d: string; width: number };
};

const toPoint = (p: TrackPoint, size: TrackSize): Point => ({
  x: resolveX(p, size),
  y: p.y * size.h,
});

function computeRevealX(points: Point[]) {
  const reveal = new Array<number>(points.length);
  let max = -Infinity;
  for (let i = 0; i < points.length; i++) {
    // Tiny increments keep it strictly increasing even on vertical stretches.
    max = Math.max(max + 0.01, points[i].x);
    reveal[i] = max;
  }
  return reveal;
}

function buildPeak(peak: (typeof peaks)[number], size: TrackSize): TopoPeak {
  const rand = mulberry32(peak.seed);
  const center = { x: peak.x * size.u, y: peak.y * size.h };
  const spacing = Math.min(size.u, size.h) * 0.032;
  const waves = [2, 3, 5].map((frequency, i) => ({
    frequency,
    amplitude: [0.14, 0.08, 0.04][i],
    phase: rand() * Math.PI * 2,
  }));

  const contours: Contour[] = [];
  for (let k = 0; k < peak.rings; k++) {
    const radius = spacing * (k + 0.7);
    const count = Math.max(20, 12 + k * 5);
    const base: Point[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Rings share the same waves (shifting slowly outwards) so they nest
      // like real contours instead of crossing each other.
      const wobble = waves.reduce(
        (sum, w) =>
          sum +
          w.amplitude * Math.sin(w.frequency * angle + w.phase + k * 0.12),
        0,
      );
      const r = radius * (1 + wobble);
      base.push({
        x: center.x + Math.cos(angle) * r * 1.3,
        y: center.y + Math.sin(angle) * r,
      });
    }
    contours.push({ base, index: (peak.rings - k) % 5 === 0 });
  }

  return {
    name: peak.name,
    center,
    spacing,
    altitude: BASE_ALTITUDE + peak.rings * CONTOUR_INTERVAL,
    contours,
  };
}

/** Jagged far-away range, drawn behind the trail and moving slower. */
function buildFarRange(size: TrackSize, width: number) {
  const rand = mulberry32(42);
  const { h } = size;
  const points: Point[] = [{ x: 0, y: h * 0.62 }];
  let x = 0;
  while (x < width) {
    x += 40 + rand() * 90;
    const high = rand() < 0.35;
    points.push({
      x,
      y: h * (high ? 0.3 + rand() * 0.14 : 0.46 + rand() * 0.14),
    });
  }
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join("");
  return { d: `${line}L${x.toFixed(1)},${h}L0,${h}Z`, width: x };
}

export function buildGeometry(size: TrackSize): JourneyGeometry {
  const { u, h } = size;
  const width = resolveX(track.end, size);

  const trail = resample(
    trailWaypoints.map((p) => toPoint(p, size)),
    SPACING,
  );
  let ridgeStart = trail.findIndex((p) => p.x >= u);
  if (ridgeStart < 0) ridgeStart = trail.length - 1;

  const climbX = resolveX({ a: 1, b: 1.1 }, size);
  const climb = trail.slice(Math.max(0, trail.findIndex((p) => p.x >= climbX)));
  const last = climb[climb.length - 1];
  const ridgeFill = {
    d: `${smoothPath(climb)}L${last.x.toFixed(1)},${h}L${climb[0].x.toFixed(1)},${h}Z`,
    startX: climb[0].x,
  };

  const farWidth = (width - u) * FAR_RANGE_SPEED + u;

  return {
    size,
    width,
    peaks: peaks.map((peak) => buildPeak(peak, size)),
    trail,
    ridgeStart,
    revealX: computeRevealX(trail),
    ridgeFill,
    detour: smoothPath(
      resample(
        detour.map((p) => toPoint(p, size)),
        SPACING,
      ),
    ),
    camps: camps.map((camp) => ({
      x: resolveX(camp.at, size),
      y: camp.y * h,
    })),
    poles: [
      { base: flagLine.from, height: flagLine.fromPole },
      { base: flagLine.to, height: flagLine.toPole },
    ].map(({ base, height }) => {
      const point = toPoint(base, size);
      return { base: point, top: { x: point.x, y: point.y - height * h } };
    }),
    farRange: buildFarRange(size, farWidth),
  };
}

/** Altitude under a point on the map, from the nearest contour rings. */
export function altitudeAt(point: Point, topo: TopoPeak[]) {
  let best = BASE_ALTITUDE;
  for (const peak of topo) {
    const dx = (point.x - peak.center.x) / 1.3;
    const dy = point.y - peak.center.y;
    const rings = Math.hypot(dx, dy) / peak.spacing;
    best = Math.max(best, peak.altitude - rings * CONTOUR_INTERVAL);
  }
  return Math.round(best / 10) * 10;
}
