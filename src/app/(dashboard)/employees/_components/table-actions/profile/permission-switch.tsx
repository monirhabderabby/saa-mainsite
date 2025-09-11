"use client";

import { updatePermission } from "@/actions/user/update";
import { Switch } from "@/components/ui/switch";
import { PermissionField } from "@/types/user";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PermissionSwitchProps {
  label: string;
  checked: boolean;
  permissionId: string;
  field: PermissionField;
}

export function PermissionSwitch({
  label,
  checked,
  permissionId,
  field,
}: PermissionSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const [localChecked, setLocalChecked] = useState(checked);

  const onChange = (value: boolean) => {
    // Optimistically update
    setLocalChecked(value);

    startTransition(() => {
      updatePermission({ id: permissionId, field, value }).then((res) => {
        if (!res.success) {
          // Rollback on error
          setLocalChecked((prev) => !prev);
          toast.error(res.message);
        }
      });
    });
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <Switch
        checked={localChecked}
        disabled={isPending}
        onCheckedChange={onChange}
      />
    </div>
  );
}
