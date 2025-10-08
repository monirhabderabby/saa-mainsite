import useClickOutside from "@/hook/use-click-outside";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const TRANSITION = {
  type: "spring",
  bounce: 0.05,
  duration: 0.3,
} as const;

interface Props {
  initialData: string | null;
  onSubmit: (note: string) => void;
}

const AddNotePopoverForSales = ({ initialData, onSubmit }: Props) => {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState<string | null>(initialData);

  const openMenu = () => {
    setNote(initialData);
    setIsOpen(true);
  };

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setNote(null);
  }, []);

  useClickOutside({
    ref: formContainerRef,
    handler: closeMenu,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  // 🪄 When textarea appears, move cursor to the end
  useEffect(() => {
    if (isOpen && textareaRef.current && note) {
      const len = note.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isOpen, note]);

  return (
    <MotionConfig transition={TRANSITION}>
      <div className="relative flex items-center justify-center">
        <motion.button
          key="button"
          layoutId={`popover-${uniqueId}`}
          className="flex h-9 items-center border border-border bg-background px-3 text-foreground hover:bg-accent"
          style={{ borderRadius: 8 }}
          onClick={openMenu}
        >
          <motion.span
            layoutId={`popover-label-${uniqueId}`}
            className="text-sm"
          >
            Add Note
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={formContainerRef}
              layoutId={`popover-${uniqueId}`}
              className="absolute h-[200px] w-[364px] overflow-hidden border border-border bg-background outline-none"
              style={{ borderRadius: 12 }}
            >
              <form
                className="flex h-full flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (note && note.trim()) onSubmit(note.trim());
                  closeMenu();
                }}
              >
                <textarea
                  ref={textareaRef}
                  className="h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-none text-foreground"
                  autoFocus
                  placeholder="write your note here..."
                  value={note || ""}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="flex justify-between px-4 py-3 border-t border-border">
                  <button
                    type="button"
                    className="flex items-center p-1 text-muted-foreground hover:text-foreground"
                    onClick={closeMenu}
                    aria-label="Close popover"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    className="relative ml-1 flex h-8 shrink-0 select-none items-center justify-center rounded-lg border border-border bg-transparent px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    aria-label="Submit note"
                  >
                    Submit Note
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default AddNotePopoverForSales;
