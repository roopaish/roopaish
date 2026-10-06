import type { TrackPoint, TrackX } from "@/lib/thread";

// Everything the horizontal "trail" section shows. Positions use the track
// units described in lib/thread.ts: x = a * viewport + b * clampedViewport,
// y is a fraction of the viewport height.

// TODO: replace all copy in this file with your own words.
export const heroCopy = {
  coordinates: "27.7172° N, 85.3240° E, Kathmandu",
  name: "Rupesh Budhathoki",
  role: "Full stack developer, building for web & mobile from Nepal.",
  line: "I grew up between hills. Now I climb codebases, one steady step at a time.",
  hint: "Hover the markers to say hi. Scroll to start the trek.",
};

/** Chat bubbles shown when hovering the "you are here" pin. */
export const pinChat = [
  "Namaste! I'm Rupesh 👋",
  "This is Kathmandu. I write code here, usually next to a cup of chiya.",
];

/** Real peaks you can see from the valley, labelled on the hero ranges. */
export type HeroPeak = {
  name: string;
  altitude: number;
  /** Which background layer it sits on (0 = farthest). */
  layer: number;
  /** x as a fraction of the viewport width. */
  x: number;
  chat: string[];
};

// TODO: your own stories about these peaks.
export const heroPeaks: HeroPeak[] = [
  {
    name: "Langtang Lirung",
    altitude: 7227,
    layer: 0,
    x: 0.72,
    chat: [
      "On a clear morning you can see this one from Kathmandu.",
      "Still on my list. Some day.",
    ],
  },
  {
    name: "Shivapuri",
    altitude: 2732,
    layer: 1,
    x: 0.3,
    chat: ["The hill right behind the city.", "Where I go to think when a bug won't die."],
  },
];

/** Altitude at the valley floor (Kathmandu) and at the summit. */
export const BASE_ALTITUDE = 1400;
export const SUMMIT_ALTITUDE = 6100;

export const stackCopy = {
  eyebrow: "Picked up along the way",
  title: "What's in the bag, and when it went in.",
};

export type StackItem = {
  year: string;
  item: string;
  icon: string;
  at: TrackX;
  /** Height of the card above the trail, as a fraction of the viewport. */
  y: number;
  chat: string[];
};

// TODO: replace with your real years, stack and stories. Icons are
// placeholders from public/placeholder.
export const stackTimeline: StackItem[] = [
  {
    year: "2018",
    item: "Hello, C",
    icon: "/placeholder/keyboard.png",
    chat: [
      "My first program printed my name.",
      "Then 40 compiler errors. Hooked anyway.",
    ],
  },
  {
    year: "2019",
    item: "React & Next.js",
    icon: "/placeholder/globe.png",
    chat: ["The web clicked for me here.", "Still the map I reach for first."],
  },
  {
    year: "2021",
    item: "Flutter & React Native",
    icon: "/placeholder/phone.png",
    chat: ["First job, first app in the store.", "Good boots for mobile terrain."],
  },
  {
    year: "2022",
    item: "NestJS · GraphQL · tRPC",
    icon: "/placeholder/robot.png",
    chat: ["Backends that hold under load.", "Rope you can trust."],
  },
  {
    year: "2023",
    item: "Docker & AWS",
    icon: "/placeholder/rocket.png",
    chat: ["A tent that pitches anywhere."],
  },
  {
    year: "2024",
    item: "AI integrations",
    icon: "/placeholder/bulb.png",
    chat: ["A headlamp for the dark parts of a codebase."],
  },
  {
    year: "Always",
    item: "Chiya",
    icon: "/placeholder/coffee.png",
    chat: ["Milk tea. Non-negotiable.", "Two cups before standup."],
  },
].map((entry, index) => ({
  ...entry,
  at: { a: 1, b: 0.16 + index * 0.13 },
  y: index % 2 ? 0.5 : 0.3,
}));

export type Camp = {
  name: string;
  altitude: number;
  year: string;
  title: string;
  body: string;
  chat: string[];
  /** "ridge" camps sit on the main trail, "detour" camps on a side trail. */
  route: "ridge" | "detour";
  at: TrackX;
  y: number;
};

// TODO: replace camp copy.
export const camps: Camp[] = [
  {
    name: "Base camp",
    altitude: 1400,
    year: "2019",
    title: "Computer engineering, Kathmandu",
    body: "First for-loop. It did not terminate.",
    chat: ["TODO: where you studied.", "TODO: the first thing you built."],
    route: "ridge",
    at: { a: 1, b: 1.2 },
    y: 0.84,
  },
  {
    name: "Camp I",
    altitude: 2600,
    year: "2021",
    title: "Mobile developer at Clamhook",
    body: "Flutter, online classes, LaTeX, payments.",
    chat: [
      "Built a Flutter app for online classes, test scoring, LaTeX and payments.",
      "Also wired up video calls between teachers and students.",
    ],
    route: "ridge",
    at: { a: 1, b: 1.6 },
    y: 0.64,
  },
  {
    name: "Side trail",
    altitude: 3100,
    year: "2022",
    title: "Freelance full stack",
    body: "E-commerce, restaurant booking, legal docs.",
    chat: [
      "Shipped e-commerce platforms with Vendure.",
      "And a restaurant pre-booking app for iOS & Android.",
    ],
    route: "detour",
    at: { a: 1, b: 1.95 },
    y: 0.72,
  },
  {
    name: "Side trail",
    altitude: 3500,
    year: "2023",
    title: "Part-time at ORGO",
    body: "Web3 rewards for eco-projects.",
    chat: [
      "A Web3 contribution & reward platform for eco-projects.",
      "White-label PWA, real-time chat, maps, leaderboards.",
    ],
    route: "detour",
    at: { a: 1, b: 2.2 },
    y: 0.64,
  },
  {
    name: "Camp II",
    altitude: 4800,
    year: "2024",
    title: "Full stack at ApexEngine",
    body: "Web + native apps, end to end.",
    chat: [
      "Fast, scalable web & native apps.",
      "E-commerce, real estate, harvest tracking, collaboration tools.",
    ],
    route: "ridge",
    at: { a: 1, b: 2.45 },
    y: 0.36,
  },
];

/** The summit, where the prayer flags are tied. */
export const summit = {
  at: { a: 1.2, b: 2.8 } as TrackX,
  y: 0.16,
  // TODO: what you're looking for next.
  chat: [
    "Made it. For now.",
    "Open to the next expedition: remote, full-time or part-time.",
  ],
};

export const climbCopy = {
  eyebrow: "Route log",
  title: "The climb so far.",
};

/** Dashed horizontal altitude lines drawn behind the climb. */
export const altitudeLines = [2000, 3000, 4000, 5000, 6000];

/** Viewport-relative y of an altitude on the climb (valley floor → summit). */
export function altitudeY(altitude: number) {
  return (
    0.84 -
    ((altitude - BASE_ALTITUDE) / (SUMMIT_ALTITUDE - BASE_ALTITUDE)) *
      (0.84 - summit.y)
  );
}

/** Dashed detour below the ridge, from where it leaves to where it rejoins. */
export const detour: TrackPoint[] = [
  { a: 1, b: 1.78, y: 0.6 },
  { a: 1, b: 1.86, y: 0.7 },
  { a: 1, b: 1.95, y: 0.72 },
  { a: 1, b: 2.08, y: 0.68 },
  { a: 1, b: 2.2, y: 0.64 },
  { a: 1, b: 2.3, y: 0.54 },
  { a: 1, b: 2.36, y: 0.4 },
];

/** Prayer flags strung from a short pole on the summit to a taller one. */
export const flagLine = {
  from: { ...summit.at, y: summit.y } as TrackPoint,
  to: { a: 1.5, b: 2.8, y: 0.36 } as TrackPoint,
  /** Pole heights as fractions of the viewport height. */
  fromPole: 0.08,
  toPole: 0.27,
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
  eyebrow: "Summit · 6,100 m · now",
  title: "Every summit is just the next base camp.",
  body: "Here's what I carried up.",
};

/** Track layout. `end` of the whole track is the right edge of the summit. */
export const track = {
  end: { a: 2, b: 2.8 },
};

/** The trail: foothills in the hero, the valley timeline, then the climb. */
export const trailWaypoints: TrackPoint[] = [
  // foothills, starting at "you are here"
  { a: 0.06, b: 0, y: 0.5 },
  { a: 0.16, b: 0, y: 0.45 },
  { a: 0.27, b: 0, y: 0.52 },
  { a: 0.4, b: 0, y: 0.49 },
  { a: 0.52, b: 0, y: 0.58 },
  { a: 0.66, b: 0, y: 0.55 },
  { a: 0.8, b: 0, y: 0.64 },
  { a: 0.92, b: 0, y: 0.72 },
  { a: 1, b: 0, y: 0.78 },
  // the valley: a flat stretch that doubles as the stack timeline
  { a: 1, b: 0.1, y: 0.84 },
  { a: 1, b: 0.5, y: 0.84 },
  { a: 1, b: 1.2, y: 0.84 },
  // the climb: a jagged ridge through the camps
  { a: 1, b: 1.3, y: 0.78 },
  { a: 1, b: 1.38, y: 0.8 },
  { a: 1, b: 1.5, y: 0.7 },
  { a: 1, b: 1.6, y: 0.64 },
  { a: 1, b: 1.7, y: 0.57 },
  { a: 1, b: 1.78, y: 0.6 },
  { a: 1, b: 1.9, y: 0.5 },
  { a: 1, b: 2.0, y: 0.53 },
  { a: 1, b: 2.12, y: 0.43 },
  { a: 1, b: 2.24, y: 0.46 },
  { a: 1, b: 2.36, y: 0.4 },
  { a: 1, b: 2.45, y: 0.36 },
  { a: 1, b: 2.55, y: 0.29 },
  { a: 1, b: 2.62, y: 0.32 },
  { a: 1, b: 2.72, y: 0.24 },
  { a: 1.06, b: 2.8, y: 0.26 },
  { a: 1.13, b: 2.8, y: 0.21 },
  { a: 1.2, b: 2.8, y: 0.16 },
  // and down the other side, where the second flag pole stands
  { a: 1.3, b: 2.8, y: 0.25 },
  { a: 1.5, b: 2.8, y: 0.36 },
  { a: 1.75, b: 2.8, y: 0.47 },
  { a: 2.02, b: 2.8, y: 0.58 },
];
