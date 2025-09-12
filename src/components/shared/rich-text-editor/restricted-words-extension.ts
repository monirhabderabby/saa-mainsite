import { Mark } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

interface RestrictedWordsOptions {
  words: string[];
}

const RestrictedWords = Mark.create<RestrictedWordsOptions>({
  name: "restrictedWords",

  addOptions() {
    return {
      words: [],
    };
  },

  addProseMirrorPlugins() {
    const { words } = this.options;

    return [
      new Plugin({
        key: new PluginKey("restrictedWords"), // ✅ unique key
        props: {
          decorations: (state) => {
            const { doc } = state;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decorations: any[] = [];
            const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");

            doc.descendants((node, pos) => {
              if (node.isText) {
                let match;
                while ((match = regex.exec(node.text ?? ""))) {
                  const start = pos + match.index;
                  const end = start + match[0].length;

                  decorations.push(
                    Decoration.inline(start, end, {
                      class: "bg-red-200 text-red-800 font-semibold",
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

export default RestrictedWords;
