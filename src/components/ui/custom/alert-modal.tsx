"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../modal";

interface Props {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  title?: string;
}

const AlertModal = ({
  isOpen,
  loading,
  onClose,
  onConfirm,
  message,
  title,
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <Modal
      title={title ?? "Confirm Action"}
      description={
        message ??
        "Are you sure you want to proceed? This action cannot be undone."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex w-full items-center justify-end space-x-2 pt-6">
        <Button
          disabled={loading}
          variant="outline"
          onClick={onClose}
          className="text-primary hover:text-primary/80"
        >
          Cancel
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          Continue {loading && <Loader2 className="animate-spin" />}
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
