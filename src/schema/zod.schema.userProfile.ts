import { z } from "zod";

export const UserProfileSkillSchema = z.object({
  name: z.string(),
  category: z.enum([
    "programming_language",
    "framework",
    "library",
    "tool",
    "database",
    "cloud",
    "devops",
    "design",
    "soft_skill",
    "other",
  ]),
});

export type UserProfileSkillSchemaType = z.infer<typeof UserProfileSkillSchema>;
