"use client";

import { CommandPalette } from "@/components/ui/command-palette";
import {
  CircleQuestionMark,
  Code,
  Laptop,
  Sheet,
  User,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CommandPaletteContainer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const groups = [
    {
      id: "suggestions",
      heading: "Suggestions",
      items: [
        {
          id: "issue-sheet",
          label: "Issue Sheet",
          icon: CircleQuestionMark,
          onSelect: () => router.push("/issue-sheet"),
        },
        {
          id: "update-sheet",
          label: "Update Sheet",
          icon: Sheet,
          onSelect: () => router.push("/update-sheet"),
        },
        {
          id: "station",
          label: "Station",
          icon: Laptop,
          onSelect: () => router.push("/station-update"),
        },
      ],
    },
    {
      id: "tools",
      heading: "Tools",
      items: [
        {
          id: "tools-container",
          label: "All Tools",
          icon: Wrench,
          shortcut: ["CTRL", "T"],
          onSelect: () => router.push("/tools"),
        },
        {
          id: "fsd-projects",
          label: "FSD",
          icon: Code,
          shortcut: ["CTRL", "T"],
          onSelect: () => router.push("/tools/fsd-projects"),
        },
      ],
    },
    {
      id: "settings",
      heading: "Settings",
      items: [
        {
          id: "profile",
          label: "Profile",
          icon: User,
          shortcut: ["CTRL", "P"],
          onSelect: () => router.push("/account"),
        },
      ],
    },
  ];

  return (
    <div className="">
      {/* <p className="text-muted-foreground text-sm">
        Press{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>{" "}
        to open the command palette
      </p>
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button> */}

      <CommandPalette open={open} onOpenChange={setOpen} groups={groups} />
    </div>
  );
}
