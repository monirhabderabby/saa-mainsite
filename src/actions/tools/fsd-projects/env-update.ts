"use server";

import prisma from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

type EnvField = "developmentEnv" | "productionEnv";

interface EditEnvParams {
  field: EnvField;
  value: string;
  projectId: string;
}

type ActionResult = { success: true } | { success: false; message: string };

// ─── Validation ───────────────────────────────────────────────────────────────

const ALLOWED_FIELDS: ReadonlySet<EnvField> = new Set<EnvField>([
  "developmentEnv",
  "productionEnv",
]);

const MAX_ENV_LENGTH = 50_000;

function validate({ field, value, projectId }: EditEnvParams): string | null {
  if (!projectId?.trim()) return "Project ID is required.";
  if (!ALLOWED_FIELDS.has(field)) return "Invalid environment field.";
  if (typeof value !== "string") return "Value must be a string.";
  if (value.length > MAX_ENV_LENGTH)
    return `Value exceeds maximum length of ${MAX_ENV_LENGTH.toLocaleString()} characters.`;
  return null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function editEnv(params: EditEnvParams): Promise<ActionResult> {
  // 1. Validate inputs before touching the DB
  const validationError = validate(params);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const { field, value, projectId } = params;

  // 2. Update — upsert-style: findUnique + update in one query using
  //    update's implicit 404 throw, caught below.
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { [field]: value },
      // Only select the id — we don't need the full row back
      select: { id: true },
    });

    return { success: true };
  } catch (error) {
    // Prisma throws P2025 when the record doesn't exist
    if (isPrismaNotFound(error)) {
      return { success: false, message: "Project not found." };
    }

    // Unexpected error — log server-side, return a safe message to the client
    console.error("[editEnv] Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPrismaNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}
