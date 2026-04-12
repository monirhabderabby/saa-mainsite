// lib/queue-key.ts

import prisma from "./prisma";

export async function generateQueueKey(): Promise<string> {
  let id: string;
  let exists = true;

  do {
    id = `Qu-${Math.floor(100000 + Math.random() * 900000)}`;
    exists = !!(await prisma.complaint.findUnique({ where: { uniqueId: id } }));
  } while (exists);

  return id;
}
