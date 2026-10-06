import { profile } from "@/data/profile";
import { projects as allProjects, type ProductFeature, type ProductLaunchedItem } from "@/data/projects";

// Everything the home page says and shows: a scroll story told as a Himalayan
// trek. Every word and picture here is a stand-in.
// TODO: rewrite the copy in your own voice and swap the placeholder art.

const social = (platform: string) =>
  profile.socials.find((s) => s.platform === platform)?.url ?? "#";

export const summitName = profile.name;

/** The lowercase name shown in the header. */
export const siteHandle = "roopaish";

export const summitLinks = {
  email: profile.email,
  linkedin: social("LinkedIn"),
  github: social("GitHub"),
  x: social("X"),
};

/** Placeholder art. Every file lives in public/placeholder (see CREDITS.md). */
export const art = {
  laptop: "/placeholder/laptop.png",
  phone: "/placeholder/phone.png",
  keys: "/placeholder/keyboard.png",
  blocks: "/placeholder/blocks.svg",
  cursor: "/placeholder/cursor.svg",
  browser: "/placeholder/browser.svg",
  phoneUi: "/placeholder/phone-ui.svg",
  api: "/placeholder/api.svg",
  server: "/placeholder/server.svg",
};

export const copy = {
  intro: {
    typed: `hey there, ${summitName.toLowerCase()} here.`,
    top: "the",
    emphasis: "full stack developer.",
    mobileEmphasis: ["full stack", "developer."],
    note: "it all starts at a keyboard.",
    work: "view work",
    talk: "let's talk",
  },
  tinker: {
    lead: "i like seeing how things come together.",
    title: "from pixels to production.",
    sub: "interfaces, APIs, mobile apps, databases, servers. i like working across the whole stack.",
    laptop: "the interface. where most things begin.",
    design: "pixels, spacing, the one more nudge.",
    keys: "one more feature. just one.",
    phone: "the same ideas, in your pocket.",
    blocks: "small pieces, wired into a system.",
    server: "and somewhere, it all has to run.",
  },
  heart: {
    title: "a few parts of software keep pulling me back.",
    mobileTitle: ["a few parts of", "software keep", "pulling me back."],
    items: [
      { key: "browser", alt: "a browser window", x: 200, y: 56, title: "it usually starts with the interface.", body: "layouts, interactions, motion, accessibility, the details people actually touch.", label: "yes, i'll nudge it one more pixel." },
      { key: "phoneUi", alt: "a phone showing a few interface blocks", x: 224, y: 22, title: "then the same ideas, in your pocket.", body: "native-feeling interactions, smaller screens, same attention to detail.", label: "flutter, react native, repeat." },
      { key: "api", alt: "API nodes wired to a database", x: 248, y: 48, title: "behind every screen, there's a system.", body: "APIs, authentication, queues, payments, databases and the logic holding everything together.", label: "the unglamorous part. my favourite." },
      { key: "server", alt: "a small server rack with blinking lights", x: 271, y: 21, title: "and eventually, it has to live somewhere.", body: "deployments, containers, domains, logs, servers. whatever gets it into production.", label: "it works on my machine. and now on yours." },
    ],
  },
  timeline: {
    summaryTop: "when something catches my attention, i usually end up understanding how it works.",
    summaryBottom: "pull it apart. rebuild a version. make it nicer. ship it somewhere.",
    // docs → code → browser → server, shown one after another beneath it.
    sequence: ["docs", "code", "browser", "server"] as const,
    // TODO: your real years and stories.
    stops: [
      { year: "2019", title: "where it started.", line: "software engineering in Kathmandu, Nepal." },
      { year: "2021", title: "went mobile.", line: "Flutter at Clamphook: online classes, tests and payments." },
      { year: "2022", title: "went freelance.", line: "e-commerce with Vendure, a restaurant booking app, legal documents." },
      { year: "2023", title: "tried web3.", line: "a reward platform for eco-projects at ORGO." },
      { year: "2024", title: "full stack, full time.", line: "web and native apps, end to end, at ApexEngine." },
      { year: "2026", title: "now, what's next?", line: "open to remote full-time or part-time roles." },
    ],
  },
  habit: {
    title: "apparently,",
    titleMuted: "i just like turning ideas into working things.",
    steps: ["spot the problem.", "sketch the experience.", "build the system.", "ship it.", "make it better."] as const,
    repeat: "repeat.",
  },
  finale: {
    lead: "enough about me.",
    title: "let's look at the work i've done.",
    mobileTitle: ["let's look at the", "work i've done."],
    button: "see the work",
    buttonCursor: "show me the work ↓",
  },
  works: {
    heading: "WORKS",
    title: ["work i've", "done so far."],
    blurb: "web and mobile products, built end to end.",
    empty: "That shelf is being rearranged. Try another filter.",
    more: "Still Interested?",
    moreCursor: "there's more on the shelf.",
    shelfTitle: "the whole shelf",
    shelfNote: ["some of the", "things i've built"],
    otherTagline: "Tools, experiments & more",
    otherCard: "Stack",
    shelfClose: "Close the shelf",
    shelfBack: "back to the shelf",
    shelfOpen: "Open in new tab",
    shelfCode: "View Code",
  },
  closing: {
    greetingDeva: "धन्यवाद",
    pitchTop: "let's build something",
    pitchBottom: "worth the keystrokes.",
    noteBottom: ["still loves building", "things, and always", "will."],
    reached: "you made it all the way here? namaste.",
    back: `© 2026 ${summitName.toLowerCase()} · back to the keyboard ↑`,
    backCursor: "rewind ↑",
  },
};

export type SummitProject = {
  number: string;
  title: string;
  /** The name as it reads on the shelf plaque. */
  shortTitle: string;
  /** The colour of the monogram on the shelf card. */
  accent: string;
  image: string;
  /** Every screenshot, the first being the cover. */
  images: string[];
  tags: string[];
  blurb: string;
  live?: string;
  code?: string;
  /** What it does, one line each, shown beside the open case. */
  features?: ProductFeature[];
};

const isReal = (url: string) => url !== "#";

const summitTags = (project: ProductLaunchedItem) => {
  const tags: string[] = [];
  if (project.links.some((l) => l.platform === "web")) tags.push("Web");
  if (project.links.some((l) => l.platform !== "web")) tags.push("Mobile");
  return tags;
};

// How each project reads on the shelf, keyed by its name in data/projects.ts.
const shelfLabels: Record<string, { shortTitle: string; accent: string }> = {
  Biggya: { shortTitle: "Biggya", accent: "#e5484d" },
  Ekagajpatra: { shortTitle: "Ekagajpatra", accent: "#3e7bfa" },
  "Clamphook Mobile App": { shortTitle: "Clamphook", accent: "#2f9bff" },
  "Production Ready Ecommerce": { shortTitle: "Ecommerce", accent: "#8b6cf0" },
  "Real-Estate Platform": { shortTitle: "Real-Estate", accent: "#2fb47c" },
  Aagaman: { shortTitle: "Aagaman", accent: "#f08a24" },
  Menzz: { shortTitle: "Menzz", accent: "#d9d4cc" },
};

const toSummitProject = (project: ProductLaunchedItem, index: number): SummitProject => ({
  number: String(index + 1).padStart(2, "0"),
  title: project.name,
  shortTitle: shelfLabels[project.name]?.shortTitle ?? project.name,
  accent: shelfLabels[project.name]?.accent ?? "#d9d4cc",
  image: project.image,
  images: project.images.length ? project.images : [project.image],
  tags: summitTags(project),
  blurb: project.description,
  features: project.features,
  code: project.code,
  live: project.links.find((l) => isReal(l.url) && !l.comingSoon)?.url,
});

/** Every project, in the order they appear on the page. */
export const summitProjects: SummitProject[] = allProjects.map(toSummitProject);

export const projectFilters = ["All", "Web", "Mobile"];
