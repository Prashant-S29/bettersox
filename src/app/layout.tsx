import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Provider } from "~/lib/provider";
import { SideMenu } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "BetterSox",
  description:
    "A better way to find open source project with advance filters and more. All for free and no signups required.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Provider>
          <Toaster />
          {/* <Header /> */}
          <SideMenu />
          <main className="w-full">
            {/* <SidebarTrigger /> */}
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
