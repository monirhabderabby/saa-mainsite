"use client";

import { Button } from "@/components/ui/button";
import { IssueSheetData } from "@/helper/issue-sheets/get-issue-sheets";
import { Role } from "@prisma/client";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import IssueViewModal from "./issue-view-modal";

interface Props {
  data: IssueSheetData;
  currentUserRole: Role;
  canEdit: boolean;
}
const IssueSheetColumnAction = ({ data, currentUserRole, canEdit }: Props) => {
  // Conditions:
  // - Admin/Super Admin can always edit
  // - Non-admins can edit only if canEdit=true

  const editable =
    currentUserRole === "SUPER_ADMIN" || currentUserRole === "ADMIN" || canEdit;

  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      {editable ? (
        <Button size="icon" variant="ghost" asChild>
          <Link href={`/issue-sheet/edit/${data.id}`}>
            <Pencil />
          </Link>
        </Button>
      ) : (
        <Button size="icon" variant="ghost" disabled>
          <Pencil />
        </Button>
      )}

      <Button size="icon" variant="ghost" onClick={() => setViewOpen(true)}>
        <Eye />
      </Button>

      <IssueViewModal
        data={data}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
    </>
  );
};

export default IssueSheetColumnAction;
