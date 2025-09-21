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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  companyName?: string;
  companyLogo?: string;
}

const supportEmail = "support@scaleupads.com";
const defaultCompanyName = "ScaleUp Ads Agency";

export const PasswordResetEmail = ({
  userName = "Monir Hossain",
  resetUrl = "https://example.com/reset-password",
  companyName = defaultCompanyName,
  companyLogo = "https://files.edgestore.dev/vkpagg64z2y0yvdx/saa/_public/black-logo.png",
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your {companyName} password</Preview>
      <Tailwind>
        <Body className="bg-gray-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-md bg-white shadow-sm">
            {/* Header with Logo */}
            <Section className="mt-4 text-center">
              <Img
                src={companyLogo}
                alt={`${companyName} Logo`}
                width="120"
                height="40"
                className="mx-auto"
              />
            </Section>

            {/* Company Name */}
            {/* <Section className="mt-4">
              <Text className="text-lg font-semibold text-center text-gray-800 tracking-wide">
                {companyName}
              </Text>
            </Section> */}

            {/* Title */}
            <Section className="mt-6">
              <Text className="text-2xl font-bold text-center text-gray-900 mb-6">
                Reset your password
              </Text>
            </Section>

            {/* Greeting and Body */}
            <Section>
              <Text className="text-gray-700 mb-4">Hey {userName},</Text>
              <Text className="text-gray-700 leading-relaxed">
                Need to reset your password? No problem! Just click the button
                below and you&apos;ll be on your way. If you did not make this
                request, please ignore this email.
              </Text>
            </Section>

            {/* Reset Password Button */}
            <Section className="my-8 text-center">
              <Button
                href={resetUrl}
                className="bg-[#FFC300] text-white px-8 py-3 rounded-lg font-semibold text-base no-underline inline-block"
              >
                Reset your password
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mt-6">
              <Text className="text-sm text-gray-600 leading-relaxed">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Text className="text-sm mt-2">
                <a
                  href={resetUrl}
                  className="text-blue-500 underline break-all"
                >
                  {resetUrl}
                </a>
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="mt-6">
              <Text className="text-xs text-gray-500 leading-relaxed">
                This password reset link will expire in 15 mins for security
                reasons.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-4 text-center text-gray-500 text-xs border-t border-gray-200 pt-6">
              <Text className="mb-2">
                Need help? Contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-blue-500 underline"
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

export default PasswordResetEmail;
