export type SkillGroup = {
  category: string;
  skills: string[];
};

export type SkillsData = {
  frameworksAndTools: SkillGroup[];
  languages: string[];
};

export const skills: SkillsData = {
  frameworksAndTools: [
    {
      category: "Frontend",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "React Native",
        "Flutter",
        "+ any js framework",
      ],
    },
    {
      category: "Backend",
      skills: [
        "NestJS",
        "Express",
        "GraphQL",
        "REST APIs",
        "tRPC",
        "Docker",
        "AWS",
        "AI Integrations",
      ],
    },
    {
      category: "Mobile App Frameworks",
      skills: ["Flutter", "React Native", "Expo"],
    },
    {
      category: "Database Systems",
      skills: ["PostgreSQL", "Redis", "Firebase", "PocketBase", "SQLite"],
    },
  ],
  languages: ["English", "Nepali (Native)", "Hindi"],
};
