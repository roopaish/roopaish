import type { MutableRefObject } from "react";

// Soft, far-off hills behind the trail. Each layer slides much slower than the
// trail (`speed` is a fraction of its travel), so they read as distant. The
// farthest layer is the faintest and the slowest.
export const RANGE_LAYERS = [
  { speed: 0.035, peaks: [48, 64], fillOpacity: 0.022, strokeOpacity: 0.07, step: 21, seed: 3 },
  { speed: 0.08, peaks: [62, 78], fillOpacity: 0.03, strokeOpacity: 0.1, step: 17, seed: 11 },
] as const;

// Layer widths in vw: the viewport plus however far the layer travels.
const CANVAS_TRAVEL = 470;
const layerWidth = (speed: number) => Math.ceil(100 + CANVAS_TRAVEL * speed + 8);

// Deterministic "random" in [0, 1).
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Point = [x: number, y: number];

const round = (n: number) => Math.round(n * 100) / 100;

// Alternating crests and saddles across the layer. Heights are vh from the top.
function skyline(width: number, [high, low]: readonly [number, number], step: number, seed: number): Point[] {
  const points: Point[] = [];
  let i = 0;
  for (let x = -step; x <= width + step; x += step * (0.7 + hash(seed + i) * 0.6)) {
    const crest = i % 2 === 0;
    const t = hash(seed * 7 + i * 3);
    // Rounded: Math.sin differs in its last digits between the server and the browser, which breaks hydration.
    points.push([round(x), round(crest ? high + t * (low - high) * 0.5 : low - t * (low - high) * 0.25 + 8)]);
    i += 1;
  }
  return points;
}

// A smooth curve through the points (Catmull-Rom as cubic Béziers), so every
// crest is a round hump instead of a point. 10 path units per vw / vh.
function smoothRidge(points: Point[], width: number) {
  const p = points.map(([x, y]) => [x * 10, y * 10] as Point);
  let d = `M${p[0]![0]} 1000 L${p[0]![0]} ${p[0]![1]}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[i - 1] ?? p[i]!;
    const p1 = p[i]!;
    const p2 = p[i + 1]!;
    const p3 = p[i + 2] ?? p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} L${p[p.length - 1]![0]} 1000 L${width * 10} 1000 Z`;
}

const LAYERS = RANGE_LAYERS.map((layer) => {
  const width = layerWidth(layer.speed);
  const points = skyline(width, layer.peaks, layer.step, layer.seed);
  return { ...layer, width, points, d: smoothRidge(points, width) };
});

// Real peaks, named on the farthest layer (the nth crest).
const LABELS = [
  { name: "Sagarmatha", altitude: "8,849 m", crest: 2 },
  { name: "Annapurna I", altitude: "8,091 m", crest: 4 },
];

export function RangeBackdrop({ layersRef }: { layersRef: MutableRefObject<(HTMLDivElement | null)[]> }) {
  return (
    <>
      {LAYERS.map((layer, index) => (
        <div
          key={layer.speed}
          ref={(el) => {
            layersRef.current[index] = el;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 will-change-transform"
          style={{ width: `${layer.width}vw` }}
        >
          <svg viewBox={`0 0 ${layer.width * 10} 1000`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={layer.d} fill="currentColor" fillOpacity={layer.fillOpacity} stroke="currentColor" strokeOpacity={layer.strokeOpacity} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {index === 0 &&
            LABELS.map(({ name, altitude, crest }) => {
              const [x, y] = layer.points.filter((_, i) => i % 2 === 0)[crest] ?? [0, 0];
              return (
                <p
                  key={name}
                  className="absolute -translate-x-1/2 -translate-y-[calc(100%+4px)] whitespace-nowrap text-center font-mono text-[10px] leading-tight text-muted-foreground/60"
                  style={{ left: `${x}vw`, top: `${y}vh` }}
                >
                  {name}
                  <br />
                  {altitude}
                </p>
              );
            })}
        </div>
      ))}
    </>
  );
}
