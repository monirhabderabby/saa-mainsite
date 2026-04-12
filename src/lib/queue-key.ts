// lib/queue-key.ts

import prisma from "./prisma";

export async function generateQueueKey(): Promise<string> {
  // Count existing queues and pad to 6 digits
  const count = await prisma.queue.count();
  const next = count + 1;
  const padded = String(next).padStart(6, "0");
  return `QU-${padded}`;
}
