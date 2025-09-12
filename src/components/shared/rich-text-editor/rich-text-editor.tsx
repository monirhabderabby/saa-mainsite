"use client";

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
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (onChange) onChange(text);
    },
    editorProps: {
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        // ✅ If HTML exists, let ProseMirror handle it (don’t force insertContent)
        if (html) {
          return false; // allow default Tiptap handling
        }

        // ✅ If only plain text, insert safely
        if (text) {
          editor?.commands.insertContent(text);
          return true;
        }

        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>

      <EditorContent
        editor={editor}
        className="border rounded-md p-3 min-h-[150px] prose prose-sm max-w-none"
      />
      <p className="text-sm text-muted-foreground">
        {editor.storage.characterCount?.characters() ?? 0}/{maxChars}
      </p>
    </div>
  );
}
