import { profile } from "@/data/profile";
import { projects as allProjects, type ProductLaunchedItem } from "@/data/projects";

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
  camera: "/placeholder/phone.png",
  movies: "/placeholder/movies.svg",
  keys: "/placeholder/keyboard.png",
  nature: "/placeholder/nature.svg",
  globe: "/placeholder/globe.png",
  brain: "/placeholder/bulb.png",
  astronaut: "/placeholder/rocket.png",
  robot: "/placeholder/robot.png",
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
    say: "careful. side trails ahead.",
    lead: "i'm curious about a lot.",
    title: "so many things i'm into.",
    sub: "coding, building and launching things, binging movies and series, and wandering out on nature walks.",
    laptop: "coding. where most things begin.",
    camera: "building and launching, mostly on weekends.",
    movies: "movies and series. one more episode. always.",
    keys: "one more feature. just one.",
    nature: "the best debugging happens on a nature walk.",
  },
  heart: {
    say: "okay, the soft part.",
    title: "but few things have my heart.",
    mobileTitle: ["but few things", "have my heart."],
    items: [
      { key: "globe", alt: "a globe wrapped in orbits", x: 200, y: 56, title: "the web came first.", body: "browsers, then servers, then everything in between.", label: "yes, i'm still here." },
      { key: "camera", alt: "a phone", x: 224, y: 22, title: "then mobile, in my pocket.", body: "same love for the craft, a much smaller screen.", label: "flutter, react native, repeat." },
      { key: "brain", alt: "a lightbulb", x: 260, y: 60, title: "now, whole products.", body: "from the database to the app store.", label: "still figuring out the shortcuts." },
    ],
  },
  timeline: {
    say: "the short version. very short.",
    summaryTop: "when something sparks my curiosity, i dive in: read up, binge it, explore.",
    summaryBottom: "then i put it to work, switch to it, and you can see it in how i build.",
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
    titleMuted: "i just love building things.",
    steps: ["spot the problem.", "sketch the route.", "build it.", "ship it."] as const,
    repeat: "repeat.",
  },
  finale: {
    say: "go on. it's the good part.",
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
    shelfHint: "pull one out, then open it up.",
    shelfClose: "Close the shelf",
    shelfBack: "back to the shelf",
    shelfOpen: "Open in new tab",
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
  image: string;
  /** Every screenshot, the first being the cover. */
  images: string[];
  tags: string[];
  blurb: string;
  live?: string;
  code?: string;
};

const isReal = (url: string) => url !== "#";

const summitTags = (project: ProductLaunchedItem) => {
  const tags: string[] = [];
  if (project.links.some((l) => l.platform === "web")) tags.push("Web");
  if (project.links.some((l) => l.platform !== "web")) tags.push("Mobile");
  return tags;
};

const toSummitProject = (project: ProductLaunchedItem, index: number): SummitProject => ({
  number: String(index + 1).padStart(2, "0"),
  title: project.name,
  image: project.image,
  images: project.images.length ? project.images : [project.image],
  tags: summitTags(project),
  blurb: project.description,
  live: project.links.find((l) => isReal(l.url) && !l.comingSoon)?.url,
});

/** Every project, in the order they appear on the page. */
export const summitProjects: SummitProject[] = allProjects.map(toSummitProject);

export const projectFilters = ["All", "Web", "Mobile"];
