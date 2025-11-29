import { render } from "@react-email/render";
import { WelcomeEmail } from "~/components/email/Welcome";
import { TrackerNotificationEmail } from "~/components/email/TrackerNotification";

export async function renderWelcomeEmail(userName: string) {
  const html = await render(<WelcomeEmail userName={userName} />);
  const text = await render(<WelcomeEmail userName={userName} />, { plainText: true });
  
  return { html, text };
}

export async function renderTrackerNotificationEmail(params: {
  userName: string;
  repoFullName: string;
  events: Array<{
    id: string;
    type: string;
    title: string;
    url: string;
    author: string;
    timestamp: string;
  }>;
  trackerId: string;
}) {
  const html = await render(<TrackerNotificationEmail {...params} />);
  const text = await render(<TrackerNotificationEmail {...params} />, { plainText: true });
  
  return { html, text };
}
