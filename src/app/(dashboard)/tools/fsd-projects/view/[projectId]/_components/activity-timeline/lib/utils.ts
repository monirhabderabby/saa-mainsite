export interface ParsedChange {
  field: string;
  from: unknown;
  to: unknown;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function parseChanges(
  changes: Record<string, unknown> | null,
): ParsedChange[] {
  if (!changes) return [];

  return Object.entries(changes)
    .map(([field, value]) => {
      // Handle array format: ["oldValue", "newValue"]
      if (Array.isArray(value) && value.length >= 2) {
        return { field, from: value[0], to: value[1] };
      }

      // Handle object format: { from: "oldValue", to: "newValue" }
      if (value && typeof value === "object") {
        const v = value as Record<string, unknown>;
        if ("from" in v || "to" in v) {
          return { field, from: v.from, to: v.to };
        }
      }

      return null;
    })
    .filter((change): change is ParsedChange => change !== null);
}

export function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
