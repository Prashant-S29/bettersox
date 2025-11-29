import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";

import { db } from "~/server/db";
import { schema } from "~/server/db/schema";
import { sendWelcomeEmail } from "~/lib/email/welcome-sender";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    "http://localhost:3000", // local
    "https://bettersox.vercel.app", // prod
    "https://bettersox-staging.vercel.app", // staging
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Send welcome email to new users
          if (user.email && user.name) {
            try {
              console.log(`[Database Hook] New user created: ${user.email}`);

              // Send welcome email asynchronously (don't block user creation)
              sendWelcomeEmail({
                email: user.email,
                name: user.name,
              }).catch((error) => {
                console.error("[Welcome Email] Failed to send:", error);
              });
            } catch (error) {
              console.error(
                "[Database Hook] Error in welcome email hook:",
                error,
              );
              // Don't throw - we don't want to fail user creation if email fails
            }
          }
        },
      },
    },
  },
} satisfies BetterAuthOptions);
