import type { TrackPoint, TrackX } from "@/lib/thread";

// Everything the horizontal "trail" section shows. Positions use the track
// units described in lib/thread.ts: x = a * viewport + b * clampedViewport,
// y is a fraction of the viewport height.

// TODO: replace all copy in this file with your own words.
export const heroCopy = {
  coordinates: "27.7172° N, 85.3240° E — Kathmandu",
  name: "Rupesh Budhathoki",
  role: "Full stack developer, building for web & mobile from Nepal.",
  line: "I grew up between hills. Now I climb codebases — one steady step at a time.",
  hint: "Move around the map. Scroll to start the trek.",
};

/** Base altitude of the map (Kathmandu valley floor) and contour interval. */
export const BASE_ALTITUDE = 1400;
export const CONTOUR_INTERVAL = 220;

export type Peak = {
  name: string;
  /** Position inside the hero, as fractions of the viewport. */
  x: number;
  y: number;
  rings: number;
  seed: number;
};

// TODO: rename peaks — currently named after the stack, altitude follows ring count.
export const peaks: Peak[] = [
  { name: "Mt. TypeScript", x: 0.66, y: 0.46, rings: 13, seed: 3 },
  { name: "Flutter Himal", x: 0.93, y: 0.16, rings: 8, seed: 11 },
  { name: "Node Ri", x: 0.3, y: 0.2, rings: 6, seed: 23 },
];

export const packingCopy = {
  eyebrow: "Packing list",
  title: "What goes in the bag for every project.",
  note: "Checked off as the trail passes.",
};

// TODO: replace with your real stack + jokes.
export const packingList = [
  { item: "Next.js & React", why: "the map — knows every route" },
  { item: "Flutter & React Native", why: "good boots for mobile terrain" },
  { item: "NestJS, GraphQL, tRPC", why: "rope that holds under load" },
  { item: "Docker & AWS", why: "a tent that pitches anywhere" },
  { item: "AI integrations", why: "a headlamp for the dark parts" },
  { item: "Chiya (milk tea)", why: "non-negotiable" },
];

export type GearObject = {
  src: string;
  alt: string;
  at: TrackX;
  y: number;
  size: number;
  drift: number;
  rotate: number;
};

// TODO: replace with photos of your actual gear (laptop, phone, mug, ...).
export const gear: GearObject[] = [
  {
    src: "/placeholder/laptop.png",
    alt: "laptop",
    at: { a: 1, b: 0.06 },
    y: 0.14,
    size: 140,
    drift: 0.05,
    rotate: -8,
  },
  {
    src: "/placeholder/phone.png",
    alt: "phone",
    at: { a: 1, b: 0.14 },
    y: 0.5,
    size: 100,
    drift: -0.04,
    rotate: 10,
  },
  {
    src: "/placeholder/coffee.png",
    alt: "tea",
    at: { a: 1, b: 0.84 },
    y: 0.14,
    size: 110,
    drift: 0.04,
    rotate: 6,
  },
  {
    src: "/placeholder/keyboard.png",
    alt: "keyboard",
    at: { a: 1, b: 0.82 },
    y: 0.5,
    size: 130,
    drift: -0.05,
    rotate: -6,
  },
];

export type Camp = {
  name: string;
  altitude: number;
  year: string;
  title: string;
  body: string;
  details: string[];
  /** "ridge" camps sit on the main trail, "detour" camps on a side trail. */
  route: "ridge" | "detour";
  at: TrackX;
  y: number;
  /** The summit is labelled by the summit panel instead. */
  hideLabel?: boolean;
};

// TODO: replace camp copy.
export const camps: Camp[] = [
  {
    name: "Base camp",
    altitude: 1400,
    year: "2019",
    title: "Computer engineering, Kathmandu",
    body: "First for-loop. It did not terminate.",
    details: ["TODO: where you studied", "TODO: the first thing you built"],
    route: "ridge",
    at: { a: 1, b: 1.25 },
    y: 0.78,
  },
  {
    name: "Camp I",
    altitude: 2600,
    year: "2021",
    title: "Mobile developer at Clamhook",
    body: "Flutter, online classes, LaTeX, payments.",
    details: [
      "Built a Flutter app supporting online classes, test scoring, LaTeX documents, and payments.",
      "Integrated video conferencing between teachers and students.",
    ],
    route: "ridge",
    at: { a: 1, b: 1.6 },
    y: 0.66,
  },
  {
    name: "Side trail",
    altitude: 3100,
    year: "2022",
    title: "Freelance full stack",
    body: "E-commerce, restaurant booking, legal docs.",
    details: [
      "Developed production e-commerce platforms with Vendure.",
      "Created a cross-platform restaurant pre-booking app.",
    ],
    route: "detour",
    at: { a: 1, b: 1.95 },
    y: 0.74,
  },
  {
    name: "Side trail",
    altitude: 3500,
    year: "2023",
    title: "Part-time at ORGO",
    body: "Web3 rewards for eco-projects.",
    details: [
      "Built a Web3-powered contribution and reward platform for eco-projects.",
      "White-label PWA, real-time chat, maps, leaderboards.",
    ],
    route: "detour",
    at: { a: 1, b: 2.2 },
    y: 0.68,
  },
  {
    name: "Camp II",
    altitude: 4800,
    year: "2024",
    title: "Full stack at ApexEngine",
    body: "Web + native apps, end to end.",
    details: [
      "Built fast and scalable web and native applications across e-commerce, real estate, harvest tracking, and collaboration products.",
    ],
    route: "ridge",
    at: { a: 1, b: 2.45 },
    y: 0.44,
  },
  {
    name: "Summit push",
    altitude: 6100,
    year: "Now",
    title: "Open to new expeditions",
    body: "Remote, full-time or part-time.",
    details: ["TODO: what you're looking for next"],
    route: "ridge",
    at: { a: 1.18, b: 2.8 },
    y: 0.27,
    hideLabel: true,
  },
];

export const climbCopy = {
  eyebrow: "Route log",
  title: "The climb so far.",
};

/** Dashed detour below the ridge, from where it leaves to where it rejoins. */
export const detour: TrackPoint[] = [
  { a: 1, b: 1.78, y: 0.6 },
  { a: 1, b: 1.86, y: 0.72 },
  { a: 1, b: 1.95, y: 0.74 },
  { a: 1, b: 2.08, y: 0.71 },
  { a: 1, b: 2.2, y: 0.68 },
  { a: 1, b: 2.3, y: 0.6 },
  { a: 1, b: 2.36, y: 0.5 },
];

/** Prayer flags strung from a short pole on the summit to a taller one. */
export const flagLine = {
  from: { a: 1.18, b: 2.8, y: 0.27 } as TrackPoint,
  to: { a: 1.8, b: 2.8, y: 0.48 } as TrackPoint,
  /** Pole heights as fractions of the viewport height. */
  fromPole: 0.1,
  toPole: 0.3,
  // TODO: the words printed on the flags.
  words: ["ship", "learn", "care", "build", "repeat"],
};

// Tibetan prayer flag order: sky, air, fire, water, earth.
export const flagColors = [
  "#2f5ea8",
  "#f3efe4",
  "#c43a30",
  "#2f7d50",
  "#e3b21c",
];

export const summitCopy = {
  eyebrow: "Summit push · 6,100 m · now",
  title: "Every summit is just the next base camp.",
  body: "Here's what I carried up.",
};

/** Track layout. `end` of the whole track is the right edge of the summit. */
export const track = {
  end: { a: 2, b: 2.8 },
};

/** The trail: a route across the map, then the ridge profile of the climb. */
export const trailWaypoints: TrackPoint[] = [
  // across the map, starting at "you are here"
  { a: 0.06, b: 0, y: 0.36 },
  { a: 0.14, b: 0, y: 0.3 },
  { a: 0.22, b: 0, y: 0.4 },
  { a: 0.38, b: 0, y: 0.36 },
  { a: 0.46, b: 0, y: 0.22 },
  { a: 0.58, b: 0, y: 0.13 },
  { a: 0.78, b: 0, y: 0.2 },
  { a: 0.9, b: 0, y: 0.4 },
  { a: 1, b: 0, y: 0.6 },
  // down into the valley, under the packing list
  { a: 1, b: 0.12, y: 0.8 },
  { a: 1, b: 0.35, y: 0.86 },
  { a: 1, b: 0.6, y: 0.84 },
  { a: 1, b: 0.85, y: 0.86 },
  { a: 1, b: 1.05, y: 0.82 },
  // the climb: a jagged ridge through the camps
  { a: 1, b: 1.25, y: 0.78 },
  { a: 1, b: 1.36, y: 0.7 },
  { a: 1, b: 1.44, y: 0.74 },
  { a: 1, b: 1.6, y: 0.66 },
  { a: 1, b: 1.7, y: 0.58 },
  { a: 1, b: 1.78, y: 0.6 },
  { a: 1, b: 1.9, y: 0.5 },
  { a: 1, b: 2.0, y: 0.56 },
  { a: 1, b: 2.12, y: 0.46 },
  { a: 1, b: 2.24, y: 0.52 },
  { a: 1, b: 2.36, y: 0.5 },
  { a: 1, b: 2.45, y: 0.44 },
  { a: 1, b: 2.55, y: 0.36 },
  { a: 1, b: 2.62, y: 0.4 },
  { a: 1, b: 2.72, y: 0.3 },
  { a: 1.06, b: 2.8, y: 0.34 },
  { a: 1.18, b: 2.8, y: 0.27 },
  // and down the other side, where the second flag pole stands
  { a: 1.32, b: 2.8, y: 0.33 },
  { a: 1.52, b: 2.8, y: 0.42 },
  { a: 1.8, b: 2.8, y: 0.48 },
  { a: 2.02, b: 2.8, y: 0.56 },
];
