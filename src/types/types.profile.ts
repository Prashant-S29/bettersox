import type { Skill } from "~/lib/storage";

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolio: string;
  github: string;
  linkedin: string;
  headline: string;
  bio: string;
  yearsOfExperience: string;
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  skills: Skill[];
  interests: string[];
  resumeFileName?: string;
}
