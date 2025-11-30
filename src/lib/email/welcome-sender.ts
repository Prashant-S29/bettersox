import { Resend } from "resend";
import { env } from "~/env";
import { renderWelcomeEmail } from "./render";

const resend = new Resend(env.RESEND_API_KEY);
const FROM_EMAIL = "onboarding@resend.dev";

interface WelcomeEmailParams {
  email: string;
  name: string;
}

export const sendWelcomeEmail = async (
  params: WelcomeEmailParams,
): Promise<void> => {
  try {
    const { html, text } = await renderWelcomeEmail(params.name);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "Welcome to BetterSox!",
      html,
      text,
    });

    if (result.error) {
      console.error("[Welcome Email] Resend error:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("[Welcome Email] Exception:", error);
    throw error;
  }
};
