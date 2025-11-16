export interface UserProfile {
  id: "user_profile"; // Singleton
  // Personal Information
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;

  // Professional Summary
  headline?: string; // e.g., "Full-stack Developer"
  bio?: string; // Professional summary/about
  yearsOfExperience?: number;

  // Technical Skills
  skills: Skill[];

  // Experience Level (derived or manual)
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";

  // Work Experience
  workExperience: WorkExperience[];

  // Education
  education: Education[];

  // Projects (from resume)
  projects: ResumeProject[];

  // Interests & Preferences
  interests: string[]; // e.g., ["web development", "machine learning"]
  preferredProjectTypes: ProjectType[];
  preferredContributionTypes: ContributionType[];

  // Availability
  hoursPerWeek?: number;
  availability?: "full-time" | "part-time" | "weekends" | "flexible";

  // Resume Metadata
  resumeFileName?: string;
  resumeUploadedAt?: number;
  resumeParsedAt?: number;
  resumeFileSize?: number;

  // Profile Status
  isComplete: boolean;
  lastUpdatedAt: number;
  createdAt: number;
  source: "resume" | "manual" | "hybrid"; // How profile was created
}

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
}

export type SkillCategory =
  | "programming_language"
  | "framework"
  | "library"
  | "tool"
  | "database"
  | "cloud"
  | "devops"
  | "design"
  | "soft_skill"
  | "other";

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or "present"
  isCurrent: boolean;
  description?: string;
  responsibilities: string[];
  technologies: string[]; // Technologies used in this role
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string; // e.g., "Bachelor of Science"
  field: string; // e.g., "Computer Science"
  startDate?: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format
  grade?: string; // GPA or grade
  description?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  githubUrl?: string;
  highlights: string[]; // Key achievements/features
}

export type ProjectType =
  | "web_development"
  | "mobile_development"
  | "backend"
  | "frontend"
  | "full_stack"
  | "data_science"
  | "machine_learning"
  | "devops"
  | "cloud"
  | "database"
  | "security"
  | "game_development"
  | "blockchain"
  | "iot"
  | "desktop"
  | "library"
  | "cli_tool"
  | "other";

export type ContributionType =
  | "code"
  | "documentation"
  | "design"
  | "testing"
  | "bug_fixes"
  | "features"
  | "translations"
  | "community"
  | "mentoring";

// Resume parsing result interface
export interface ResumeParseResult {
  profile: Partial<UserProfile>;
  confidence: number; // 0-100
  warnings: string[];
  extractedSections: {
    personalInfo: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
    projects: boolean;
  };
  rawText?: string; // For debugging
}
