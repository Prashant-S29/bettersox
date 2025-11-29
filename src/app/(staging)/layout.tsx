import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Provider } from "~/lib/provider";

export const metadata: Metadata = {
  title: "Staging | BetterSox",
  description:
    "A better way to find open source project with advance filters and more. All for free and no signup required.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function StagingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
