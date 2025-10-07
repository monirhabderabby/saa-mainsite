import DOMPurify from "isomorphic-dompurify";

/**
 * Cleans up the HTML before rendering
 * - Sanitizes unsafe tags
 * - Converts <pre><code> blocks into styled divs (so font matches project)
 */
export function normalizeEditorHtml(html: string): string {
  if (!html) return "";

  // sanitize for safety
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  // convert <pre><code> to <div class="formatted-block"> for project style
  return clean
    .replaceAll("<pre><code>", '<div class="formatted-block">')
    .replaceAll("</code></pre>", "</div>");
}
