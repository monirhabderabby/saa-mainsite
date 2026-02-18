"use client";

import { editEnv } from "@/actions/tools/fsd-projects/env-update";
import { SafeProjectDto } from "@/app/api/tools/fsd-project/route";
import { Button } from "@/components/ui/button";
import { SpotlightNavbar } from "@/components/ui/spot-light-navbar";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

const EnvEditor = dynamic(
  () => import("@/components/shared/rich-text-editor/env-text-editor"),
  {
    ssr: false,
  },
);

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
  data: SafeProjectDto;
}

type EnvKind = "development" | "production";

interface EnvState {
  development: string;
  production: string;
}

interface SaveStatus {
  kind: EnvKind | null;
  state: "idle" | "saving" | "success" | "error";
  message: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUB_NAV_ITEMS = [
  { label: "Development", href: "#development" },
  { label: "Production", href: "#production" },
];

const SUCCESS_RESET_MS = 2500;
const MAX_CHARS = 5000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function EnvVariables({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSubTab = (searchParams.get("subtab") ?? "development") as EnvKind;

  const [pending, startTransition] = useTransition();

  // Stable initial values — computed once from first render
  const initialValues = useRef<EnvState>({
    development: data.developmentEnv ?? "",
    production: data.productionEnv ?? "",
  });

  // Server truth — updated after each successful save
  const [savedValues, setSavedValues] = useState<EnvState>(
    initialValues.current,
  );
  // Editor drafts
  const [draftValues, setDraftValues] = useState<EnvState>(
    initialValues.current,
  );

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    kind: null,
    state: "idle",
    message: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────

  const isDirty = useMemo(
    () => draftValues[activeSubTab] !== savedValues[activeSubTab],
    [draftValues, savedValues, activeSubTab],
  );

  const defaultNavIndex = useMemo(() => {
    const idx = SUB_NAV_ITEMS.findIndex(
      (i) => i.href.replace("#", "") === activeSubTab,
    );
    return idx !== -1 ? idx : 0;
  }, [activeSubTab]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleSubNavClick = useCallback(
    (item: { label: string; href: string }) => {
      const subtab = item.href.replace("#", "") as EnvKind;
      const params = new URLSearchParams(searchParams.toString());
      params.set("subtab", subtab);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleDevChange = useCallback((raw: string) => {
    setDraftValues((prev) =>
      prev.development === raw ? prev : { ...prev, development: raw },
    );
  }, []);

  const handleProdChange = useCallback((raw: string) => {
    setDraftValues((prev) =>
      prev.production === raw ? prev : { ...prev, production: raw },
    );
  }, []);

  const handleReset = useCallback(() => {
    setDraftValues((prev) => ({
      ...prev,
      [activeSubTab]: savedValues[activeSubTab],
    }));
  }, [activeSubTab, savedValues]);

  const saveEnv = useCallback(
    (kind: EnvKind) => {
      // Clear any lingering success timer from a previous save
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }

      setSaveStatus({ kind, state: "saving", message: null });

      startTransition(async () => {
        const result = await editEnv({
          field: kind === "development" ? "developmentEnv" : "productionEnv",
          value: draftValues[kind],
          projectId: data.id,
        });

        if (!result.success) {
          setSaveStatus({ kind, state: "error", message: result.message });
          return;
        }

        setSavedValues((prev) => ({ ...prev, [kind]: draftValues[kind] }));
        setSaveStatus({ kind, state: "success", message: "Saved" });

        successTimerRef.current = setTimeout(() => {
          setSaveStatus((prev) =>
            prev.state === "success"
              ? { kind: null, state: "idle", message: null }
              : prev,
          );
        }, SUCCESS_RESET_MS);
      });
    },
    [data.id, draftValues, startTransition],
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <SpotlightNavbar
        items={SUB_NAV_ITEMS}
        onItemClick={handleSubNavClick}
        defaultActiveIndex={defaultNavIndex}
      />

      <div className="mt-6">
        {/*
              Both editors stay mounted — hidden via CSS to avoid remount
              cost and caret-position loss on tab switch.
            */}
        <div className={activeSubTab === "development" ? undefined : "hidden"}>
          <EnvEditor
            value={draftValues.development ?? ""}
            onChange={handleDevChange}
            maxChars={MAX_CHARS}
          />
        </div>

        <div className={activeSubTab === "production" ? undefined : "hidden"}>
          <EnvEditor
            value={draftValues.production}
            onChange={handleProdChange}
            maxChars={MAX_CHARS}
          />
        </div>

        {saveStatus.state === "error" && saveStatus.kind === activeSubTab && (
          <p className="text-sm text-red-500" role="alert">
            {saveStatus.message}
          </p>
        )}
        {saveStatus.state === "success" && saveStatus.kind === activeSubTab && (
          <p className="text-sm text-green-600" role="status">
            {saveStatus.message}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={pending || !isDirty}
            size="sm"
          >
            Reset
          </Button>
          {isDirty && (
            <Button
              onClick={() => saveEnv(activeSubTab)}
              disabled={pending || !isDirty}
              aria-busy={pending}
              size="sm"
            >
              {pending ? "Saving…" : "Save"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
