import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  userName?: string;
  verificationUrl?: string;
  companyLogo?: string;
}

const supportEmail = "support@scaleupadsagency.com";
const companyName = "ScaleUp Ads Agency";

export const EmailVerification = ({
  userName = "User",
  verificationUrl = "https://example.com/verify",
  companyLogo = "https://files.edgestore.dev/vkpagg64z2y0yvdx/saa/_public/black-logo.png",
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your ScaleUp Ads Agency email</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded my-10 mx-auto p-5 max-w-md bg-white">
            {/* Header with Logo */}
            <Section className="mt-4 text-center flex justify-center">
              <Img src={companyLogo} alt="Logo" width="160" height="60" />;
            </Section>

            {/* Title */}
            <Section className="mt-6">
              <Text className="text-2xl font-bold text-center text-gray-800">
                Verify Your Email
              </Text>
            </Section>

            {/* Greeting */}
            <Section>
              <Text className="text-gray-700">Hello {userName},</Text>
              <Text className="text-gray-700">
                Thank you for signing up with {companyName}. To complete your
                registration we need to verify your email address.
              </Text>
            </Section>

            {/* Verification Button */}
            <Section className="my-8 text-center">
              <Button
                href={verificationUrl}
                className="bg-black text-white px-6 py-2 rounded-md font-semibold text-base no-underline inline-block"
                aria-label="Verify your email address"
              >
                Verify Email
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section>
              <Text className="text-sm text-gray-600">
                If the button doesn’t work, copy and paste this link into your
                browser:
              </Text>
              <Text className="text-sm">
                <a href={verificationUrl} className="text-blue-600 underline">
                  {verificationUrl}
                </a>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 text-center text-gray-500 text-xs border-t border-gray-200 pt-4">
              <Text>
                Need help? Contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-blue-600 underline"
                >
                  {supportEmail}
                </a>
              </Text>
              <Text>
                &copy; {new Date().getFullYear()} {companyName}. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerification;
