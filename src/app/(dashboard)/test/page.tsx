"use client";
import { Button } from "@/components/ui/button";
import { downloadAttachment } from "@/lib/download-attachments";

const Page = () => {
  return (
    <div className="w-full min-h-[400px] flex justify-center items-center">
      <Button
        onClick={() =>
          downloadAttachment(
            "https://drive.google.com/file/d/122Yv_Jz1PjM-5nueJuo8ZX1AiiN7Avx7/view?usp=sharing"
          )
        }
      >
        Download
      </Button>
    </div>
  );
};

export default Page;
