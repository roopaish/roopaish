// Thread geometry for the sideways story: waypoints -> Bezier segments -> sampled points.

// The story canvas is CANVAS_VW wide and slides CANVAS_TRAVEL_VW across the
// scroll. Everything on it is placed in vw/vh, and the SVG uses a viewBox of
// (CANVAS_VW * 10) x 1000, so one vw is 10 units and one vh is 10 units.
export const CANVAS_VW = 570;
export const CANVAS_TRAVEL_VW = 470;

// Place something on the canvas by its vw/vh coordinates.
export const at = (x: number, y: number) => ({ left: `${x}vw`, top: `${y}vh` });

// A waypoint for the thread, in vw/vh. `loop` ties a little loop-de-loop at
// that point (radius in vh; negative loops downward).
export type Waypoint = [x: number, y: number, loop?: number];

// Horizontal units are ~1.8x wider on screen than vertical ones, so loops are
// narrowed to stay round rather than squashed.
export const LOOP_ASPECT = 1.8;

// Where the thread finally ends: at the "see the work" button.
export const BUTTON_X = 537;
export const BUTTON_Y = 59;

// The big loop the habit is tied around, near the end of the story.
export const LOOP_X = 474;
export const LOOP_Y = 70;
export const LOOP_R = 17;

// The thread is a Catmull-Rom curve through the waypoints (plus the extra
// points each loop adds), written out as cubic Béziers in viewBox units.
export type Segment = [x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x1: number, y1: number];

// `scale` maps waypoint units to path units (vw/vh → viewBox is 10; pixels
// are 1), and `aspect` squeezes loops to stay round on a stretched canvas.
export function threadSegments(waypoints: Waypoint[], scale = 10, aspect = LOOP_ASPECT): Segment[] {
  const pts: [number, number][] = [];
  for (const [wx, wy, loop] of waypoints) {
    const x = wx * scale;
    const y = wy * scale;
    pts.push([x, y]);
    if (loop) {
      const r = loop * scale;
      const rx = Math.abs(r) / aspect;
      pts.push([x + rx, y - r], [x, y - 2 * r], [x - rx, y - r], [x + rx * 0.5, y + r * 0.15]);
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    segments.push([p1[0], p1[1], p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]]);
  }
  return segments;
}

export function threadPath(waypoints: Waypoint[]) {
  return segmentsPath(threadSegments(waypoints));
}

export function segmentsPath(segments: Segment[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${segments[0]?.[0] ?? 0} ${segments[0]?.[1] ?? 0}`;
  for (const [, , c1x, c1y, c2x, c2y, x1, y1] of segments) d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x1)} ${f(y1)}`;
  return d;
}

// Points along the thread, evaluated straight from the Bézier maths, with the
// running arc length at each one. This replaces thousands of browser
// getPointAtLength calls, which froze the page for seconds on load.
export type ThreadSamples = { xs: Float32Array; ys: Float32Array; lengths: Float32Array; total: number };

export function sampleSegments(segments: Segment[], perSegment = 48): ThreadSamples {
  const n = segments.length * perSegment + 1;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const lengths = new Float32Array(n);
  let k = 0;
  let total = 0;
  segments.forEach(([x0, y0, c1x, c1y, c2x, c2y, x1, y1], index) => {
    for (let step = index === 0 ? 0 : 1; step <= perSegment; step += 1) {
      const t = step / perSegment;
      const u = 1 - t;
      const x = u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1;
      const y = u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1;
      if (k > 0) total += Math.hypot(x - xs[k - 1]!, y - ys[k - 1]!);
      xs[k] = x;
      ys[k] = y;
      lengths[k] = total;
      k += 1;
    }
  });
  return { xs, ys, lengths, total };
}

// Where the keyboard's cable leaves the case: centre of its top edge (vw / vh).
export const KEY_X = 50;
export const KEY_TOP = 36;

// The keyboard's cable arches up out of the keyboard...
const CABLE_WAYPOINTS: Waypoint[] = [[KEY_X, KEY_TOP], [47.5, 30], [53, 25.2]];

// ...and becomes the trail: it loops between the things I tinker with, smooths
// out through the few things that have my heart, runs straight along the
// timeline, and simply stops before the work.
export const TRAIL_WAYPOINTS: Waypoint[] = [
  [56.9, 19.9], [80, 58], [98, 50], [110, 44, 8], [120, 66], [132, 68], [142, 66, -6],
  [151, 56], [156, 40], [164, 29], [171, 33], [174.5, 35.6], [181, 42], [186, 62], [198, 68],
  [205, 68], [216, 50], [229, 34], [233, 50], [250, 58], [262, 70], [272, 88], [292, 54],
  [304, 48], [322, 51], [340, 52], [358, 50], [376, 46], [394, 43], [410, 46],
  [422, 60], [440, 70], [458, 71], [LOOP_X, LOOP_Y, LOOP_R], [496, 76], [514, 78], [528, 70], [BUTTON_X, BUTTON_Y],
];

// One continuous curve through cable and trail, split where the cable ends so
// the joint stays smooth. The cable draws itself on load; the trail draws with
// the scroll.
const SEGMENTS = threadSegments([...CABLE_WAYPOINTS, ...TRAIL_WAYPOINTS]);
export const CABLE = segmentsPath(SEGMENTS.slice(0, CABLE_WAYPOINTS.length));
const TRAIL_SEGMENTS = SEGMENTS.slice(CABLE_WAYPOINTS.length);
export const THREAD = segmentsPath(TRAIL_SEGMENTS);

// Sampled once, the first time anything needs points along the thread.
let threadSamples: ThreadSamples | null = null;
export const getThreadSamples = () => (threadSamples ??= sampleSegments(TRAIL_SEGMENTS));
