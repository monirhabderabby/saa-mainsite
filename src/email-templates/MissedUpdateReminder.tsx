import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const demo = [
  {
    title: "Project 1",
    clientName: "Client 1",
    orderId: "123456",
    status: "Pending",
    nextUpdate: new Date("2021-10-10"),
    profileName: "Profile 1",
  },
] as MissedProject[];

interface MissedProject {
  title: string;
  clientName: string;
  orderId?: string;
  status: string;
  nextUpdate: Date;
  profileName: string;
}

interface MissedUpdateReminderProps {
  userName?: string;
  missedProjects?: MissedProject[];
  dashboardUrl?: string;
  companyLogo?: string;
}

const supportEmail = "support@scaleupadsagency.com";
const companyName = "ScaleUp Ads Agency";

export const MissedUpdateReminder = ({
  userName = "User",
  missedProjects = demo,
  dashboardUrl = "https://yourdomain.com/dashboard",
  companyLogo = "https://files.edgestore.dev/46caec8oilyqam7f/StaticFiles/_public/black-logo.svg",
}: MissedUpdateReminderProps) => {
  const missedCount = missedProjects.length;

  return (
    <Html>
      <Tailwind>
        {/* Head must be inside Tailwind so Tailwind can inject <style> when needed */}
        <Head />

        <Preview>
          {missedCount.toString()} project update{missedCount === 1 ? "" : "s"}{" "}
          overdue - Action required
        </Preview>

        <Body className="bg-gray-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded-lg my-10 mx-auto p-0 max-w-2xl bg-white shadow-sm">
            {/* Header with gradient */}
            <Section className="bg-gradient-to-r from-[#FFC300] to-[#22c55e] p-6 rounded-t-lg">
              <Section className="text-center">
                <Img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  width="140"
                  height="50"
                  className="mx-auto"
                />
              </Section>
            </Section>

            {/* Alert Banner */}
            <Section className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6 rounded">
              <Text className="text-red-800 font-semibold text-base m-0">
                ⚠️ Missed Updates Alert
              </Text>
              <Text className="text-red-700 text-sm m-0 mt-1">
                You have {missedCount} project{missedCount === 1 ? "" : "s"}{" "}
                that missed their scheduled update time.
              </Text>
            </Section>

            {/* Greeting */}
            <Section className="px-6 pt-6">
              <Text className="text-gray-800 text-lg font-semibold m-0">
                Hi {userName},
              </Text>
              <Text className="text-gray-600 mt-3 mb-0">
                The following projects were scheduled for updates but haven't
                been updated yet. Please review and provide updates as soon as
                possible.
              </Text>
            </Section>

            {/* Projects List */}
            <Section className="px-6 py-4">
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Project
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {missedProjects.map((project, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom:
                          index < missedProjects.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "12px 8px" }}>
                        <Text className="m-0 text-sm font-medium text-gray-900">
                          {project.title}
                        </Text>
                        <Text className="m-0 text-xs text-gray-600 mt-1">
                          {project.clientName}
                          {project.orderId && (
                            <span className="ml-2 font-mono text-gray-500">
                              #{project.orderId}
                            </span>
                          )}
                        </Text>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "500",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            borderRadius: "4px",
                          }}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <Text className="m-0 text-xs text-red-600 font-medium">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(project.nextUpdate))}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Hr className="border-gray-200 mx-6" />

            {/* CTA Button */}
            <Section className="px-6 py-6 text-center">
              <Text className="text-gray-700 mb-4">
                Click below to update your projects now:
              </Text>

              {/* Note: removed hover:shadow-lg because react-email cannot inline hover variants reliably */}
              <Button
                href={dashboardUrl}
                className="bg-gradient-to-r from-[#FFC300] to-[#22c55e] text-gray-900 px-8 py-3 rounded-lg font-semibold text-base no-underline inline-block shadow-md"
                aria-label="Go to dashboard"
              >
                Update Projects Now
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="px-6 pb-6">
              <Text className="text-sm text-gray-600 text-center">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="text-sm text-center">
                <a
                  href={dashboardUrl}
                  className="text-[#22c55e] underline break-all"
                >
                  {dashboardUrl}
                </a>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 px-6 py-6 rounded-b-lg border-t border-gray-200">
              <Text className="text-gray-500 text-xs text-center m-0">
                This is an automated reminder from {companyName}.
              </Text>

              <Text className="text-gray-500 text-xs text-center mt-2 mb-0">
                Need help? Contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-[#22c55e] underline"
                >
                  {supportEmail}
                </a>
              </Text>

              <Text className="text-gray-400 text-xs text-center mt-3 mb-0">
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

export default MissedUpdateReminder;
