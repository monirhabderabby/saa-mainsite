// components/queue/modals/bulk-upload-modal.tsx
"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

import {
  bulkCreateQueueAction,
  type BulkRowResult,
} from "@/actions/queue/bulk-create";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Profile, Services } from "@prisma/client";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  services: Services[];
  onSuccess?: () => void;
}

interface ParsedRow {
  id: string;
  profileId: string;
  serviceId: string;
  clientName: string;
  orderId: string;
  message: string;
  rawProfile?: string;
  rawService?: string;
}

const MAX_ROWS = 200;
const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const TEMPLATE_HEADERS = [
  "Profile",
  "Service Line",
  "Client Name",
  "Order ID",
  "Message",
];

type Step = "upload" | "preview" | "results";

const makeRowId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const norm = (s: unknown) =>
  typeof s === "string" ? s.trim().toLowerCase() : "";

function pickField(row: Record<string, unknown>, keys: string[]) {
  for (const k of Object.keys(row)) {
    const key = k.trim().toLowerCase();
    if (keys.includes(key)) {
      const v = row[k];
      if (v === undefined || v === null) return "";
      return String(v).trim();
    }
  }
  return "";
}

function validateRow(row: ParsedRow): string[] {
  const errs: string[] = [];
  if (!row.profileId) errs.push("Profile required");
  if (!row.clientName.trim()) errs.push("Client name required");
  if (!row.message.trim()) errs.push("Message required");
  return errs;
}

export function BulkUploadModal({
  open,
  onOpenChange,
  profiles,
  services,
  onSuccess,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<BulkRowResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const profileByName = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((p) => map.set(norm(p.name), p.id));
    return map;
  }, [profiles]);

  const serviceByName = useMemo(() => {
    const map = new Map<string, string>();
    services.forEach((s) => map.set(norm(s.name), s.id));
    return map;
  }, [services]);

  const validRows = useMemo(
    () => rows.filter((r) => validateRow(r).length === 0),
    [rows],
  );
  const invalidCount = rows.length - validRows.length;

  const resetAll = useCallback(() => {
    setStep("upload");
    setRows([]);
    setResults([]);
    setFileName("");
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleClose = (next: boolean) => {
    if (isPending) return;
    if (!next) resetAll();
    onOpenChange(next);
  };

  const parseFile = useCallback(
    async (file: File) => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        toast.error("Unsupported file type. Use .csv, .xls or .xlsx");
        return;
      }
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) {
          toast.error("No sheets found in file.");
          return;
        }
        const sheet = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: false,
        });

        if (data.length === 0) {
          toast.error("File is empty.");
          return;
        }
        if (data.length > MAX_ROWS) {
          toast.error(`Too many rows. Maximum is ${MAX_ROWS}.`);
          return;
        }

        const parsed: ParsedRow[] = data.map((row) => {
          const rawProfile = pickField(row, ["profile", "profile name"]);
          const rawService = pickField(row, [
            "service",
            "service line",
            "service name",
          ]);
          const clientName = pickField(row, [
            "client name",
            "client",
            "clientname",
          ]);
          const orderId = pickField(row, ["order id", "orderid", "order"]);
          const message = pickField(row, [
            "message",
            "details",
            "description",
          ]);

          return {
            id: makeRowId(),
            profileId: profileByName.get(norm(rawProfile)) ?? "",
            serviceId: serviceByName.get(norm(rawService)) ?? "",
            clientName,
            orderId,
            message,
            rawProfile,
            rawService,
          };
        });

        // Drop fully-empty rows
        const cleaned = parsed.filter(
          (r) =>
            r.rawProfile ||
            r.rawService ||
            r.clientName ||
            r.orderId ||
            r.message,
        );

        if (cleaned.length === 0) {
          toast.error("No data rows detected.");
          return;
        }

        setRows(cleaned);
        setFileName(file.name);
        setStep("preview");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file.");
      }
    },
    [profileByName, serviceByName],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const updateRow = (id: string, patch: Partial<ParsedRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: makeRowId(),
        profileId: "",
        serviceId: "",
        clientName: "",
        orderId: "",
        message: "",
      },
    ]);
  };

  const downloadTemplate = () => {
    const sample = [
      {
        Profile: profiles[0]?.name ?? "Profile Name",
        "Service Line": services[0]?.name ?? "",
        "Client Name": "Acme Corporation",
        "Order ID": "ORD-9876",
        Message: "Describe what you need from the sales team...",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample, { header: TEMPLATE_HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Queue Template");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([out], { type: "application/octet-stream" }),
      "queue-bulk-upload-template.xlsx",
    );
  };

  const handleSubmit = () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to submit.");
      return;
    }
    startTransition(async () => {
      const payload = validRows.map((r) => ({
        profileId: r.profileId,
        clientName: r.clientName,
        orderId: r.orderId || undefined,
        message: r.message,
        serviceId: r.serviceId || undefined,
      }));
      const res = await bulkCreateQueueAction(payload);
      setResults(res.results);
      setStep("results");
      if (res.totalCreated > 0) {
        toast.success(res.message);
        onSuccess?.();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[860px] p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold leading-none">
                Bulk Upload Queues
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-none">
                {step === "upload" &&
                  "Upload a CSV or Excel file to create multiple queues at once."}
                {step === "preview" &&
                  `Review ${rows.length} row${rows.length === 1 ? "" : "s"} from ${fileName || "your file"}.`}
                {step === "results" && "Bulk upload finished."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {step === "upload" && (
            <UploadStep
              isDragging={isDragging}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onPick={() => inputRef.current?.click()}
              onDownloadTemplate={downloadTemplate}
              inputRef={inputRef}
              onFileChange={handleFileChange}
            />
          )}

          {step === "preview" && (
            <PreviewStep
              rows={rows}
              profiles={profiles}
              services={services}
              isPending={isPending}
              invalidCount={invalidCount}
              onUpdate={updateRow}
              onRemove={removeRow}
              onAddRow={addRow}
              onReupload={resetAll}
            />
          )}

          {step === "results" && (
            <ResultsStep
              results={results}
              totalSubmitted={rows.length}
              totalCreated={results.filter((r) => r.success).length}
            />
          )}
        </div>

        <DialogFooter className="px-4 sm:px-5 py-3 border-t border-border/60 bg-muted/20 gap-2 flex-row sm:justify-between flex-wrap">
          {step === "preview" ? (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
                <Badge variant="outline" className="h-5 text-[10px]">
                  {validRows.length} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] text-destructive border-destructive/40"
                  >
                    {invalidCount} invalid
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2 ml-auto sm:ml-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleClose(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleSubmit}
                  disabled={isPending || validRows.length === 0}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-3 w-3" />
                      Create {validRows.length} queue
                      {validRows.length === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : step === "results" ? (
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={resetAll}
              >
                Upload another
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs ml-auto"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Steps ---------------- */

function UploadStep({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
  onDownloadTemplate,
  inputRef,
  onFileChange,
}: {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onPick: () => void;
  onDownloadTemplate: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onPick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPick();
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-lg px-4 py-8 sm:py-10 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/70 hover:border-primary/60 hover:bg-muted/40",
        )}
      >
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop your file here, or{" "}
              <span className="text-primary underline-offset-2 hover:underline">
                browse
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .csv, .xls, .xlsx · up to {MAX_ROWS} rows
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              Expected columns
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Profile</span>{" "}
              <span className="text-destructive">*</span>,{" "}
              <span className="font-medium text-foreground">Service Line</span>{" "}
              (optional),{" "}
              <span className="font-medium text-foreground">Client Name</span>{" "}
              <span className="text-destructive">*</span>,{" "}
              <span className="font-medium text-foreground">Order ID</span>{" "}
              (optional),{" "}
              <span className="font-medium text-foreground">Message</span>{" "}
              <span className="text-destructive">*</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadTemplate();
            }}
          >
            <Download className="h-3 w-3" />
            Template
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreviewStep({
  rows,
  profiles,
  services,
  isPending,
  invalidCount,
  onUpdate,
  onRemove,
  onAddRow,
  onReupload,
}: {
  rows: ParsedRow[];
  profiles: Profile[];
  services: Services[];
  isPending: boolean;
  invalidCount: number;
  onUpdate: (id: string, patch: Partial<ParsedRow>) => void;
  onRemove: (id: string) => void;
  onAddRow: () => void;
  onReupload: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-4 sm:px-5 py-2.5 border-b border-border/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>{rows.length} row{rows.length === 1 ? "" : "s"}</span>
          {invalidCount > 0 && (
            <span className="text-destructive">
              · {invalidCount} need attention
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onAddRow}
            disabled={isPending}
          >
            <PlusCircle className="h-3 w-3" /> Add row
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onReupload}
            disabled={isPending}
          >
            <Upload className="h-3 w-3" /> Re-upload
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground w-8">
                  #
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground w-[170px]">
                  Profile <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground w-[150px]">
                  Service Line
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">
                  Client Name <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground w-[120px]">
                  Order ID
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">
                  Message <span className="text-destructive">*</span>
                </th>
                <th className="px-3 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const errs = validateRow(row);
                const isInvalid = errs.length > 0;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-t border-border/60",
                      isInvalid && "bg-destructive/[0.03]",
                    )}
                  >
                    <td className="px-3 py-2 text-muted-foreground tabular-nums align-top pt-3">
                      <div className="flex items-center gap-1">
                        {isInvalid ? (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        )}
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Select
                        value={row.profileId || undefined}
                        onValueChange={(v) =>
                          onUpdate(row.id, { profileId: v })
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 text-xs",
                            !row.profileId && "text-muted-foreground",
                          )}
                        >
                          <SelectValue
                            placeholder={
                              row.rawProfile
                                ? `Unmatched: ${row.rawProfile}`
                                : "Select..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="text-xs"
                            >
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Select
                        value={row.serviceId || "__none__"}
                        onValueChange={(v) =>
                          onUpdate(row.id, {
                            serviceId: v === "__none__" ? "" : v,
                          })
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue
                            placeholder={
                              row.rawService
                                ? `Unmatched: ${row.rawService}`
                                : "—"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="__none__"
                            className="text-xs text-muted-foreground"
                          >
                            — None —
                          </SelectItem>
                          {services.map((s) => (
                            <SelectItem
                              key={s.id}
                              value={s.id}
                              className="text-xs"
                            >
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Input
                        value={row.clientName}
                        onChange={(e) =>
                          onUpdate(row.id, { clientName: e.target.value })
                        }
                        placeholder="Client name"
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Input
                        value={row.orderId}
                        onChange={(e) =>
                          onUpdate(row.id, { orderId: e.target.value })
                        }
                        placeholder="Optional"
                        className="h-7 text-xs"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Textarea
                        value={row.message}
                        onChange={(e) =>
                          onUpdate(row.id, { message: e.target.value })
                        }
                        placeholder="Message"
                        className="text-xs resize-none min-h-[28px] h-7 py-1 leading-snug"
                        rows={1}
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(row.id)}
                        disabled={isPending}
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border/60">
          {rows.map((row, idx) => {
            const errs = validateRow(row);
            const isInvalid = errs.length > 0;
            return (
              <div
                key={row.id}
                className={cn(
                  "p-3 space-y-2.5",
                  isInvalid && "bg-destructive/[0.03]",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    {isInvalid ? (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <span className="font-medium">Row {idx + 1}</span>
                    {isInvalid && (
                      <span className="text-[10px] text-destructive">
                        {errs.join(" · ")}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -mr-1 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(row.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <FieldRow label="Profile" required>
                    <Select
                      value={row.profileId || undefined}
                      onValueChange={(v) => onUpdate(row.id, { profileId: v })}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs",
                          !row.profileId && "text-muted-foreground",
                        )}
                      >
                        <SelectValue
                          placeholder={
                            row.rawProfile
                              ? `Unmatched: ${row.rawProfile}`
                              : "Select..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-xs"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="Service Line">
                    <Select
                      value={row.serviceId || "__none__"}
                      onValueChange={(v) =>
                        onUpdate(row.id, {
                          serviceId: v === "__none__" ? "" : v,
                        })
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue
                          placeholder={
                            row.rawService
                              ? `Unmatched: ${row.rawService}`
                              : "—"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="__none__"
                          className="text-xs text-muted-foreground"
                        >
                          — None —
                        </SelectItem>
                        {services.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="text-xs"
                          >
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="Client Name" required>
                    <Input
                      value={row.clientName}
                      onChange={(e) =>
                        onUpdate(row.id, { clientName: e.target.value })
                      }
                      placeholder="Client name"
                      className="h-8 text-xs"
                      disabled={isPending}
                    />
                  </FieldRow>

                  <FieldRow label="Order ID">
                    <Input
                      value={row.orderId}
                      onChange={(e) =>
                        onUpdate(row.id, { orderId: e.target.value })
                      }
                      placeholder="Optional"
                      className="h-8 text-xs"
                      disabled={isPending}
                    />
                  </FieldRow>

                  <FieldRow label="Message" required>
                    <Textarea
                      value={row.message}
                      onChange={(e) =>
                        onUpdate(row.id, { message: e.target.value })
                      }
                      placeholder="Message"
                      className="text-xs resize-none min-h-[60px]"
                      disabled={isPending}
                    />
                  </FieldRow>
                </div>
              </div>
            );
          })}
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
            <p className="text-sm font-medium">All rows removed</p>
            <p className="text-xs text-muted-foreground">
              Add a row manually or re-upload a file.
            </p>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={onAddRow}
              >
                <PlusCircle className="h-3 w-3" /> Add row
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={onReupload}
              >
                <Upload className="h-3 w-3" /> Re-upload
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>

    </div>
  );
}

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ResultsStep({
  results,
  totalSubmitted,
  totalCreated,
}: {
  results: BulkRowResult[];
  totalSubmitted: number;
  totalCreated: number;
}) {
  const totalFailed = results.length - totalCreated;
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 sm:px-5 py-3 border-b border-border/60 grid grid-cols-3 gap-2">
        <Stat label="Submitted" value={totalSubmitted} />
        <Stat label="Created" value={totalCreated} tone="success" />
        <Stat label="Failed" value={totalFailed} tone="danger" />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <ul className="divide-y divide-border/60">
          {results.map((r) => (
            <li
              key={r.index}
              className="px-4 sm:px-5 py-2.5 flex items-start gap-2.5 text-xs"
            >
              {r.success ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  Row {r.index + 1}
                  {r.clientName ? ` · ${r.clientName}` : ""}
                  {r.queueKey ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({r.queueKey})
                    </span>
                  ) : null}
                </p>
                <p
                  className={cn(
                    "text-[11px] mt-0.5",
                    r.success ? "text-muted-foreground" : "text-destructive",
                  )}
                >
                  {r.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/5",
        tone === "danger" && value > 0 && "border-destructive/30 bg-destructive/5",
        !tone && "border-border/60 bg-card",
      )}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-semibold tabular-nums leading-tight",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "danger" && value > 0 && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

