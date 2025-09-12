"use client";

import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import RestrictedWords from "./restricted-words-extension";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  restrictedWords?: string[];
  maxChars?: number;
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
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        let cleanText = text;

        if (html) {
          // Convert HTML to plain text while preserving line breaks
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;

          // Replace <div>, <br>, <p> with newlines
          const walk = (node: HTMLElement | ChildNode): string => {
            if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
            if (node.nodeType !== Node.ELEMENT_NODE) return "";

            const el = node as HTMLElement;
            let content = "";
            el.childNodes.forEach((child) => {
              content += walk(child);
            });

            if (el.tagName === "BR") return content + "\n";
            if (el.tagName === "P" || el.tagName === "DIV")
              return content + "\n";
            return content;
          };

          cleanText = walk(tempDiv);
        }

        if (cleanText) {
          // Split into paragraphs, trim, remove empty lines
          const paragraphs = cleanText
            .split(/\n+/)
            .map((p) => p.trim())
            .filter(Boolean);

          // Wrap each paragraph in <p> for proper spacing
          const content = paragraphs.map((p) => `<p>${p}</p>`).join("");

          editor?.commands.insertContent(content);
          return true; // Prevent default paste handling
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange?.(text); // allow full text, even beyond maxChars
      //   onCharCountChange?.(editor.storage.characterCount?.characters() ?? 0);
    },
  });

  if (!editor) return null;

  const currentCount = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="space-y-2">
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
          white-space: pre-wrap; /* preserve spacing */
        }
        .ProseMirror:focus {
          outline: none;
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
