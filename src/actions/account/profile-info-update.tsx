"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { personalInfoSchema, PersonalInfoSchema } from "@/schemas/account";
import { revalidatePath } from "next/cache";

export async function UpdatePersonalInfoAction(data: PersonalInfoSchema) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return {
      success: false,
      message: "You need to be logged in to update your information.",
    };
  }

  const parsed = personalInfoSchema.safeParse(data);

  if (!parsed.success) {
    // Generate a friendly list of validation errors
    const errors = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)
      .join(". ");

    return {
      success: false,
      message: `Oops! There were some issues with your input: ${errors}`,
    };
  }

  try {
    await prisma.user.update({
      where: { id: cu.user.id },
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        dateOfBirth: parsed.data.dateOfBirth,
        phone: parsed.data.phone,
        parmanentAddress: parsed.data.parmanentAddress,
        presentAddress: parsed.data.presentAddress,
      },
    });

    revalidatePath("/account");

    return {
      success: true,
      message: "Your personal information has been updated successfully! 🎉",
    };
  } catch (error) {
    console.error("UpdatePersonalInfo error:", error);
    return {
      success: false,
      message:
        "Oops! Something went wrong while updating your info. Please try again later.",
    };
  }
}

export async function UpdateProfilePhotoAction(url: string) {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) {
    return {
      success: false,
      message: "You need to be logged in to update your profile photo.",
    };
  }

  if (!url || typeof url !== "string") {
    return {
      success: false,
      message: "Invalid image URL.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: cu.user.id },
      data: { image: url },
    });

    // revalidate the account/profile page
    revalidatePath("/account");

    return {
      success: true,
      message: "Your profile photo has been updated successfully! 🎉",
    };
  } catch (error) {
    console.error("UpdateProfilePhotoAction error:", error);
    return {
      success: false,
      message:
        "Oops! Something went wrong while updating your profile photo. Please try again later.",
    };
  }
}
