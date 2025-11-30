import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Tailwind,
  Font,
} from "@react-email/components";
import { LOGO } from "~/constants";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  trackerId?: string;
}

export const EmailLayout: React.FC<LayoutProps> = ({
  children,
  previewText,
  trackerId,
}) => {
  return (
    <Html>
      <Tailwind>
        <Head>
          {previewText && <title>{previewText}</title>}
          <Font
            fontFamily="Inter"
            fallbackFontFamily="sans-serif"
            webFont={{
              url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body className="m-0 flex h-full w-full flex-col items-center justify-center bg-[#1a1a1a] p-0">
          <Container className="flex max-w-[600px] flex-col items-center justify-center bg-[#1a1a1a] p-0">
            <Section className="h-[50px] w-[200px] bg-[#1a1a1a] md:h-[100px]" />

            <Section className="w-full text-center">
              <Img
                src={LOGO}
                alt="BetterSox Logo"
                className="mx-auto w-[400px]"
                style={{ margin: "0 auto", display: "block" }}
              />
              <Text className="mt-0 text-center text-sm text-[#808080]">
                Open Source search engine to find open source projects
              </Text>
            </Section>

            <Hr className="m-0 h-px border-t border-[#80808050]" />

            <Section className="px-5">{children}</Section>

            {trackerId && (
              <>
                <Hr className="m-0 h-px border-t border-[#80808050]" />
                <Section className="px-5 pb-5">
                  <Text className="mb-3 text-sm leading-relaxed text-[#808080]">
                    You are receiving this because you have enabled a repo
                    tracker on your BetterSox account.
                  </Text>
                  <Section>
                    <Link
                      href={`https://bettersox.vercel.app/track/${trackerId}`}
                      target="_blank"
                      className="text-sm text-[#808080] underline underline-offset-2"
                    >
                      Manage this Tracker
                    </Link>
                  </Section>
                </Section>
              </>
            )}

            <Hr className="m-0 h-px border-t border-[#80808050]" />

            <Section className="px-5 pb-5">
              <Text className="mb-3 text-sm leading-relaxed text-[#808080]">
                At BetterSox, we aim to reduce the initial friction for new
                developers to contribute to open source projects. We want to
                make it easy for developers to find projects that align with
                their interests and skills.
              </Text>
              <Link
                href="https://bettersox.vercel.app/welcome"
                className="text-sm text-[#808080] underline underline-offset-2"
              >
                Learn more
              </Link>
            </Section>

            <Hr className="m-0 h-px border-t border-[#80808050]" />

            <Section className="p-5 text-center">
              <Link
                href="https://github.com/Prashant-S29/bettersox"
                className="text-sm text-[#808080] underline underline-offset-2"
              >
                GitHub
              </Link>
              <span className="mx-3"></span>
              <Link
                href="https://x.com/prashant_gigs"
                className="text-sm text-[#808080] underline underline-offset-2"
              >
                X (Twitter)
              </Link>
            </Section>
            <Section className="h-[50px] w-[200px] bg-[#1a1a1a] md:h-[100px]" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
