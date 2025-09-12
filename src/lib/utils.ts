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
