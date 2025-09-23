import prisma from "@/lib/prisma";

/**
 * Ensures that a user has UPDATE_SHEET permission
 * with `isMessageTLCheckAllowed = true`.
 */
export async function ensureUpdateSheetPermission(userId: string) {
  const updateSheetPermission = await prisma.permissions.findFirst({
    where: {
      userId,
      name: "UPDATE_SHEET",
    },
  });

  if (updateSheetPermission) {
    // Only update if not already true
    if (!updateSheetPermission.isMessageTLCheckAllowed) {
      await prisma.permissions.update({
        where: { id: updateSheetPermission.id },
        data: { isMessageTLCheckAllowed: true },
      });
    }
  } else {
    // Create new permission entry
    await prisma.permissions.create({
      data: {
        userId,
        name: "UPDATE_SHEET",
        isMessageTLCheckAllowed: true,
      },
    });
  }
}
