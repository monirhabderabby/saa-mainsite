import { useEffect } from "react";

interface UseClickOutsideProps {
  ref: React.RefObject<HTMLElement>;
  handler: () => void;
  mouseEvent?: "mousedown" | "click";
  enabled?: boolean;
}

export default function useClickOutside({
  ref,
  handler,
  mouseEvent = "mousedown",
  enabled = true,
}: UseClickOutsideProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener(mouseEvent, handleClickOutside);

    return () => {
      document.removeEventListener(mouseEvent, handleClickOutside);
    };
  }, [ref, handler, mouseEvent, enabled]);
}
