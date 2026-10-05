import {
  altitudeLines,
  altitudeY,
  camps,
  detour,
  flagLine,
  heroPeaks,
  summit,
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
/** Hero layers move at these fractions of the scroll (far → near). */
export const HERO_LAYER_SPEED = [0.25, 0.5];

type RangePeak = { x: number; height: number; width: number };

/** Background ranges in the hero, as fractions of the viewport. */
const heroLayers: { base: number; seed: number; peaks: RangePeak[] }[] = [
  {
    base: 0.5,
    seed: 7,
    peaks: [
      { x: 0.15, height: 0.12, width: 0.15 },
      { x: 0.38, height: 0.14, width: 0.14 },
      { x: 0.55, height: 0.18, width: 0.12 },
      { x: 0.72, height: 0.3, width: 0.16 },
      { x: 0.88, height: 0.22, width: 0.12 },
      { x: 1.05, height: 0.16, width: 0.14 },
    ],
  },
  {
    base: 0.6,
    seed: 19,
    peaks: [
      { x: 0.1, height: 0.1, width: 0.12 },
      { x: 0.3, height: 0.2, width: 0.16 },
      { x: 0.5, height: 0.12, width: 0.12 },
      { x: 0.64, height: 0.08, width: 0.1 },
      { x: 0.85, height: 0.1, width: 0.14 },
      { x: 1.05, height: 0.12, width: 0.14 },
    ],
  },
];

export type HeroLayer = {
  d: string;
  labels: { peak: (typeof heroPeaks)[number]; x: number; y: number }[];
};

export type JourneyGeometry = {
  size: TrackSize;
  width: number;
  heroLayers: HeroLayer[];
  /** Evenly spaced trail; points before `ridgeStart` are in the hero. */
  trail: Point[];
  ridgeStart: number;
  /** Non-decreasing x at which each trail point gets drawn. */
  revealX: number[];
  /** Ground under the whole trail. */
  mountain: string;
  /** Dashed altitude lines behind the climb. */
  altitudes: { altitude: number; y: number; x1: number; x2: number }[];
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

/** Ridge line made of overlapping triangular peaks plus a little jitter. */
function buildHeroLayer(
  layer: (typeof heroLayers)[number],
  index: number,
  size: TrackSize,
): HeroLayer {
  const { u, h } = size;
  const rand = mulberry32(layer.seed);
  const heightAt = (x: number) =>
    layer.peaks.reduce((best, peak) => {
      const t = 1 - Math.abs(x / u - peak.x) / peak.width;
      return t > 0 ? Math.max(best, peak.height * t ** 1.15) : best;
    }, 0);

  const points: Point[] = [];
  for (let x = -20; x <= u * 1.2; x += 10) {
    const jitter = (rand() - 0.5) * 0.008;
    points.push({ x, y: (layer.base - heightAt(x) + jitter) * h });
  }
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join("");
  const last = points[points.length - 1];

  return {
    d: `${line}L${last.x.toFixed(1)},${h}L${points[0].x.toFixed(1)},${h}Z`,
    labels: heroPeaks
      .filter((peak) => peak.layer === index)
      .map((peak) => ({
        peak,
        x: peak.x * u,
        y: (layer.base - heightAt(peak.x * u)) * h,
      })),
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

  const first = trail[0];
  const last = trail[trail.length - 1];
  const climbX = resolveX({ a: 1, b: 1.14 }, size);
  const summitX = resolveX(summit.at, size);

  return {
    size,
    width,
    heroLayers: heroLayers.map((layer, index) =>
      buildHeroLayer(layer, index, size),
    ),
    trail,
    ridgeStart,
    revealX: computeRevealX(trail),
    mountain: `M-20,${h}L-20,${first.y.toFixed(1)}${smoothPath(trail).replace(/^M/, "L")}L${last.x.toFixed(1)},${h}Z`,
    altitudes: altitudeLines.map((altitude) => ({
      altitude,
      y: altitudeY(altitude) * h,
      x1: climbX,
      x2: summitX,
    })),
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
    farRange: buildFarRange(size, (width - u) * FAR_RANGE_SPEED + u),
  };
}
