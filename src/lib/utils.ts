import { clsx, type ClassValue } from "clsx";
import { htmlToText } from "html-to-text";
import { twMerge } from "tailwind-merge";

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
