export function getDayRange(dateStr: string) {
  // dateStr = "2026-02-09"
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create LOCAL date boundaries
  const startLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endLocal = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    start: startLocal,
    end: endLocal,
  };
}
