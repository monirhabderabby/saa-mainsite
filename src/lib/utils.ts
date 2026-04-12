import { clsx, type ClassValue } from "clsx";
import { htmlToText } from "html-to-text";
import { twMerge } from "tailwind-merge";
import prisma from "./prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextFromHtml(html: string): string {
  return htmlToText(html, {
    wordwrap: false,
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  });
}

export function countTipTapCharacters(html: string): number {
  // Get plain text
  const text = getTextFromHtml(html);
  // Remove line breaks and trim spaces, just like TipTap does
  return text.replace(/\r?\n|\r/g, "").trim().length;
}

export const generateUniqueIdForComplain = async (
  suffex: string,
): Promise<string> => {
  let id: string;
  let exists = true;

  do {
    id = `${suffex}-${Math.floor(100000 + Math.random() * 900000)}`;
    exists = !!(await prisma.complaint.findUnique({ where: { uniqueId: id } }));
  } while (exists);

  return id;
};
export const generateUniqueIdForQueue = async (
  suffex: string,
): Promise<string> => {
  let id: string;
  let exists = true;

  do {
    id = `${suffex}-${Math.floor(100000 + Math.random() * 900000)}`;
    exists = !!(await prisma.queue.findUnique({ where: { queueKey: id } }));
  } while (exists);

  return id;
};
