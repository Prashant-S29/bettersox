import { z } from "zod";
import { UserProfileSkillSchema } from "./zod.schema.userProfile";

export const MatchInputSchema = z.object({
  skills: z.array(UserProfileSkillSchema),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  interests: z.array(z.string()),
  yearsOfExperience: z.number().nullable().optional(),
});

export type MatchInputSchemaType = z.infer<typeof MatchInputSchema>;
