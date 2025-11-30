import { Section, Text, Button } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout";

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName }) => {
  return (
    <EmailLayout previewText="Welcome to BetterSox">
      <Section>
        <Text className="mb-4 text-base leading-relaxed text-[#ffffff]">
          Hey {userName},
        </Text>
        <Text className="mb-6 text-base leading-relaxed text-[#E2E2E2]">
          Thanks for signing up! We&apos;re excited to help you discover amazing
          open source projects matching your interests.
        </Text>

        <Section className="my-5">
          <Button
            className="inline-block rounded-[6.6px] bg-[#E7E7E7] px-3 py-2 text-center text-sm font-medium text-[#000000] no-underline"
            href="https://bettersox.vercel.app"
          >
            Start Exploring
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
};
