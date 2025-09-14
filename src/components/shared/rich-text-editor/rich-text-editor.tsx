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

        if (html) {
          // Use a DOM parser to clean up unwanted tags
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Remove script/style tags
          doc.querySelectorAll("script, style").forEach((el) => el.remove());

          // Optionally strip other unwanted attributes
          doc.body.querySelectorAll("*").forEach((el) => {
            Array.from(el.attributes).forEach((attr) => {
              if (!["href", "src", "alt"].includes(attr.name))
                el.removeAttribute(attr.name);
            });
          });

          // Insert sanitized HTML into editor
          editor?.commands.insertContent(doc.body.innerHTML);
          return true;
        }

        if (text) {
          editor?.commands.insertContent(text.replace(/\n+/g, "<p></p>"));
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML(); // gets full rich text content
      // const text = editor.getText();
      onChange?.(html); // allow full text, even beyond maxChars
      //   onCharCountChange?.(editor.storage.characterCount?.characters() ?? 0);
    },
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

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
