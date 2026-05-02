export type Experience = {
  company: string;
  role: string;
  location: string;
  period: string;
  highlights: string[];
};

export const experiences: Experience[] = [
  {
    company: "ApexEngine LLC",
    role: "Full Stack Developer",
    location: "Walnut Creek, CA (Remote)",
    period: "Mar 2024 - Apr 2026",
    highlights: [
      "Built fast and scalable web and native applications across e-commerce, real estate, harvest tracking, and collaboration products.",
      "Delivered performance-focused solutions with strong architecture and developer experience.",
    ],
  },
  {
    company: "ORGO",
    role: "Part-time Frontend Developer & UI/UX Designer",
    location: "New York, NY (Remote)",
    period: "May 2023 - Mar 2024",
    highlights: [
      "Built a Web3-powered contribution and reward platform for eco-projects.",
      "Implemented a white-label PWA, real-time communication, map-based volunteering exploration, leaderboard, and analytics.",
    ],
  },
  {
    company: "",
    role: "Freelance Full Stack Developer",
    location: "USA/Nepal (Remote)",
    period: "Aug 2022 - Feb 2024",
    highlights: [
      "Developed production e-commerce platforms with Vendure.",
      "Created a cross-platform restaurant pre-booking app.",
      "Collaborated with legal and financial experts to ship a legal document generator.",
    ],
  },
  {
    company: "Clamhook",
    role: "Mobile Application Developer",
    location: "Lalitpur, Nepal",
    period: "Sep 2021 - Aug 2022",
    highlights: [
      "Built a Flutter app supporting online classes, test scoring, LaTeX documents, and payments.",
      "Integrated video conferencing between teachers and students.",
    ],
  },
];
