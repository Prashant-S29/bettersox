import type { UserProfile, SkillCategory } from "./user-profile";

export function categorizeSkill(skillName: string): SkillCategory {
  const skillLower = skillName.toLowerCase();

  // Programming languages
  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "go",
    "rust",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "scala",
    "r",
  ];
  if (languages.some((lang) => skillLower.includes(lang))) {
    return "programming_language";
  }

  // Frameworks
  const frameworks = [
    "react",
    "vue",
    "angular",
    "next",
    "nuxt",
    "svelte",
    "django",
    "flask",
    "express",
    "fastapi",
    "spring",
    "rails",
    ".net",
    "laravel",
  ];
  if (frameworks.some((fw) => skillLower.includes(fw))) {
    return "framework";
  }

  // Databases
  const databases = [
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "dynamodb",
    "firebase",
    "elasticsearch",
    "cassandra",
  ];
  if (databases.some((db) => skillLower.includes(db))) {
    return "database";
  }

  // Cloud
  const cloud = ["aws", "azure", "gcp", "google cloud", "cloud", "heroku"];
  if (cloud.some((c) => skillLower.includes(c))) {
    return "cloud";
  }

  // DevOps
  const devops = [
    "docker",
    "kubernetes",
    "jenkins",
    "gitlab",
    "github actions",
    "ci/cd",
    "terraform",
    "ansible",
  ];
  if (devops.some((d) => skillLower.includes(d))) {
    return "devops";
  }

  // Tools
  const tools = ["git", "webpack", "vite", "babel", "eslint", "prettier"];
  if (tools.some((t) => skillLower.includes(t))) {
    return "tool";
  }

  return "other";
}

export function inferExperienceLevel(
  workExperience: UserProfile["workExperience"],
): UserProfile["experienceLevel"] {
  if (workExperience.length === 0) return "beginner";

  // Calculate total years of experience
  const totalYears = workExperience.reduce((acc, exp) => {
    const start = new Date(exp.startDate + "-01");
    const end = exp.isCurrent ? new Date() : new Date(exp.endDate + "-01");
    const years =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return acc + years;
  }, 0);

  if (totalYears < 2) return "beginner";
  if (totalYears < 5) return "intermediate";
  if (totalYears < 10) return "advanced";
  return "expert";
}

export function extractTechnologiesFromText(text: string): string[] {
  // Common technologies to look for
  const techKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "vue",
    "angular",
    "node",
    "express",
    "django",
    "flask",
    "spring",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "git",
    "rest",
    "graphql",
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "next.js",
    "nest.js",
    "fastapi",
  ];

  const found = new Set<string>();
  const textLower = text.toLowerCase();

  for (const tech of techKeywords) {
    if (textLower.includes(tech)) {
      found.add(tech);
    }
  }

  return Array.from(found);
}

export function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
