"use server";

import { auth, signOut } from "@/auth";

interface ResType {
  success: boolean;
  message: string;
}

export async function logoutAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "No user session found." } as ResType;
  }

  // Invalidate session (assuming NextAuth)
  await signOut(); // or `signOut({ redirect: false })` if used inside server action

  return { success: true, message: "Logged out successfully." } as ResType;
}
