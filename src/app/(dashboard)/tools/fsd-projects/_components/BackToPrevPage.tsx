"use client";
import { Button } from "@/components/ui/button";
import { MoveLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const BackToPrevPage = () => {
  const router = useRouter();
  return (
    <Button size="icon" onClick={() => router.back()} variant="link">
      <MoveLeftIcon />
    </Button>
  );
};

export default BackToPrevPage;
