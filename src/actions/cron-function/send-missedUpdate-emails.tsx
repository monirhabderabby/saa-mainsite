"use server";

import MissedUpdateReminder from "@/email-templates/MissedUpdateReminder";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OverdueProject = Prisma.ProjectGetPayload<{
  include: {
    profile: {
      select: { name: true };
    };
    projectAssignments: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            fullName: true;
          };
        };
      };
    };
  };
}>;

type UserBucket = {
  email: string;
  fullName: string;
  projects: OverdueProject[];
};

type MissedProjectForEmail = {
  title: string;
  clientName: string;
  orderId?: string;
  status: string;
  nextUpdate: Date;
  profileName: string;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function sendMissedUpdateEmails() {
  try {
    const today = startOfToday();

    // 1) Fetch overdue projects
    const overdueProjects = await prisma.project.findMany({
      where: {
        nextUpdate: { lt: today },
        status: { in: ["NRA", "WIP", "Revision"] },
      },
      include: {
        profile: true,
        projectAssignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (overdueProjects.length === 0) {
      return {
        success: true,
        message: "No overdue projects",
        results: [] as const,
      };
    }

    // 2) Group projects by assigned user
    const userProjectsMap = new Map<string, UserBucket>();

    for (const project of overdueProjects) {
      for (const assignment of project.projectAssignments) {
        const user = assignment.user;
        if (!user?.id) continue;

        // Optional: skip if user has no email (avoid resend error)
        if (!user.email) continue;

        const existing = userProjectsMap.get(user.id);

        if (!existing) {
          userProjectsMap.set(user.id, {
            email: user.email,
            fullName: user.fullName ?? "User",
            projects: [project],
          });
        } else {
          existing.projects.push(project);
        }
      }
    }

    if (userProjectsMap.size === 0) {
      return {
        success: true,
        message: "No users to notify",
        results: [] as const,
      };
    }

    // 3) Send emails
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`;

    const results = await Promise.all(
      Array.from(userProjectsMap.values()).map(async (userBucket) => {
        const missedProjects: MissedProjectForEmail[] = userBucket.projects.map(
          (project) => ({
            title: project.title,
            clientName: project.clientName,
            orderId: project.orderId || undefined,
            status: project.status,
            nextUpdate: project.nextUpdate!, // if schema guarantees it exists when overdue
            profileName: project.profile.name,
          }),
        );

        try {
          const subject = `⚠️ ${missedProjects.length} Project Update${
            missedProjects.length > 1 ? "s" : ""
          } Overdue`;

          const { data, error } = await resend.emails.send({
            from: "ScaleUp Ads Agency <noreply@scaleupadsagency.com>",
            to: [userBucket.email],
            subject,
            react: MissedUpdateReminder({
              userName: userBucket.fullName,
              missedProjects,
              dashboardUrl,
            }),
          });

          if (error) {
            return { success: false as const, email: userBucket.email, error };
          }

          return {
            success: true as const,
            email: userBucket.email,
            emailId: data?.id,
          };
        } catch (err) {
          return {
            success: false as const,
            email: userBucket.email,
            error: err,
          };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    return {
      success: true,
      message: `Sent ${successCount} emails, ${failCount} failed`,
      results,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send missed update emails",
      error,
    };
  }
}
