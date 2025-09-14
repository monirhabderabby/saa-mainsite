export function getDayRange(dateStr: string) {
  const start = new Date(dateStr);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
