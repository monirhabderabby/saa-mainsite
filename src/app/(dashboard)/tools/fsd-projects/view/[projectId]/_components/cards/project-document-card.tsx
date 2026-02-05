"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import MotionCard from "./motion-card";

export interface DocumentItem {
  key: string;
  label: string;
  icon: ReactNode;
  url?: string | null;
  iconBgColor: string;
}

interface Props {
  documents: DocumentItem[];
}

export default function ProjectDocumentsCard({ documents }: Props) {
  if (documents.length === 0) return null;

  return (
    <MotionCard delay={0.2}>
      <Card className="shadow-none dark:bg-white/5">
        <CardContent className="pt-3 px-3 space-y-3">
          <Label>Documents</Label>

          <div className="space-y-1">
            {documents.map((doc) => {
              return (
                <a
                  key={doc.key}
                  href={doc.url ?? "#"}
                  target="_blank"
                  className="group flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md ",
                        doc.iconBgColor,
                      )}
                    >
                      {doc.icon}
                    </div>

                    <span className="text-sm font-medium">{doc.label}</span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
