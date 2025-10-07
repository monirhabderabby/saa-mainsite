"use client";

import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import RestrictedWords from "./restricted-words-extension";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  restrictedWords?: string[];
  maxChars?: number;
}

/** escape HTML so we can safely put plain text inside <pre><code> */
function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function RichTextEditor({
  value = "",
  onChange,
  restrictedWords = [],
  maxChars = 2500,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      RestrictedWords.configure({ words: restrictedWords }),
      CharacterCount.configure({}),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      handlePaste(view, event: ClipboardEvent) {
        // always prevent default paste (we will handle insertion ourselves)
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        // Helper: heuristic: treat as preformatted if there are:
        // - leading spaces/tabs on lines, OR
        // - multiple consecutive spaces, OR
        // - newline characters (multiline)
        const isPreformatted = (s: string) =>
          /\n\s+/.test(s) || /\t/.test(s) || / {2,}/.test(s);

        // 1) Handle HTML paste (from Word, Notion, etc.)
        if (html) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // strip dangerous tags
            doc.querySelectorAll("script, style").forEach((el) => el.remove());

            // sanitize attributes (keep href/src/alt only)
            doc.body.querySelectorAll("*").forEach((el) => {
              Array.from(el.attributes).forEach((attr) => {
                if (!["href", "src", "alt"].includes(attr.name)) {
                  el.removeAttribute(attr.name);
                }
              });
            });

            const bodyText = doc.body.innerText || "";

            if (isPreformatted(bodyText)) {
              // insert as pre > code so indentation/space preserved reliably
              const escaped = escapeHtml(bodyText.replace(/\r\n/g, "\n"));
              editor?.commands.insertContent(
                `<pre><code>${escaped}</code></pre>`
              );
            } else {
              // safe to insert sanitized HTML
              editor?.commands.insertContent(doc.body.innerHTML);
            }
            return true;
          } catch {
            // fall back to plain text route below
            // continue
          }
        }

        // 2) Handle plain-text paste (preserve indentation/spacing)
        if (text) {
          const normalized = text.replace(/\r\n/g, "\n");

          if (isPreformatted(normalized) || /\n/.test(normalized)) {
            // treat multiline or indented text as code/preformatted block
            const escaped = escapeHtml(normalized);
            editor?.commands.insertContent(
              `<pre><code>${escaped}</code></pre>`
            );
            return true;
          } else {
            // short single-line plain text: insert as text/paragraphs, preserving simple breaks
            const htmlified = escapeHtml(normalized).replace(/\n/g, "<br/>");
            editor?.commands.insertContent(htmlified);
            return true;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // When a value comes from props (editing previously saved content),
  // normalize/wrap when necessary so indentation/spaces survive.
  useEffect(() => {
    if (!editor) return;

    // if equal, no-op
    try {
      if (value === editor.getHTML()) return;
    } catch {
      // ignore
    }

    const content = value || "";

    // If content is empty just set it
    if (!content) {
      editor.commands.setContent("");
      return;
    }

    // Heuristics to detect plain-text-like content that should be rendered preformatted:
    const looksLikePlainText = (s: string) => {
      // no HTML tags
      const hasTags = /<[^>]+>/.test(s);
      const containsIndented = /\n\s+/.test(s);
      const containsMultipleSpaces = / {2,}/.test(s);
      const containsNewlines = /\n/.test(s);

      // If there are tags, parse innerText and check for indentation/newlines that indicate preformatted
      if (hasTags) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(s, "text/html");
          const inner = doc.body.innerText || "";
          if (/\n\s+/.test(inner) || / {2,}/.test(inner))
            return { pre: true, inner };
          return { pre: false, inner };
        } catch {
          return { pre: false, inner: "" };
        }
      }

      // no tags: check raw string
      if (containsIndented || containsMultipleSpaces || containsNewlines) {
        return { pre: true, inner: s };
      }
      return { pre: false, inner: s };
    };

    const maybe = looksLikePlainText(content);
    if (maybe.pre) {
      // wrap clean inner text into pre>code to preserve indentation for editing
      const escaped = escapeHtml(maybe.inner.replace(/\r\n/g, "\n"));
      editor.commands.setContent(`<pre><code>${escaped}</code></pre>`);
    } else {
      // safe to set the content as-is (it likely contains HTML structure we want)
      editor.commands.setContent(content);
    }
  }, [value, editor]);

  if (!editor) return null;

  const currentCount = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="space-y-2">
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
          white-space: pre-wrap; /* allow normal text wrapping */
          font-family: inherit; /* ✅ inherit Raleway from <body> */
          font-size: 0.95rem; /* optional – adjust to your UI */
          line-height: 1.6; /* nice readable spacing */
          color: inherit; /* use global text color */
        }

        .ProseMirror pre {
          white-space: pre; /* keep indentation in code blocks */
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono",
            "Courier New", monospace; /* monospace only for code */
          font-size: 0.9rem;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 0.375rem;
          padding: 0.5rem;
          overflow: auto;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p:empty::before {
          content: "";
          display: inline;
        }
      `}</style>

      <EditorContent
        editor={editor}
        className={cn(
          "border rounded-md p-3 min-h-[150px] prose prose-sm max-w-none",
          currentCount > maxChars && "border-red-500"
        )}
      />
      <p
        className={`text-sm ${
          currentCount > maxChars ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        {currentCount} of {maxChars} characters used
        {currentCount > maxChars && " - Limit exceeded!"}
      </p>
    </div>
  );
}
