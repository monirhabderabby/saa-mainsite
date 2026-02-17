"use client";

import { cn } from "@/lib/utils";
import { Check, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnvLine {
  id: string;
  raw: string;
}

type LineKind = "comment" | "key-value" | "blank" | "invalid";

interface ParsedLine {
  kind: LineKind;
  key: string;
  value: string;
  comment: string;
  raw: string;
}

// ─── Pure helpers (module-scope, never recreated) ─────────────────────────────

let _uid = 0;
const uid = () => `el-${++_uid}`;

function parseLine(raw: string): ParsedLine {
  const trimmed = raw.trim();
  if (trimmed === "")
    return { kind: "blank", key: "", value: "", comment: "", raw };
  if (trimmed.startsWith("#"))
    return { kind: "comment", key: "", value: "", comment: trimmed, raw };

  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1)
    return { kind: "invalid", key: raw, value: "", comment: "", raw };

  const key = raw.slice(0, eqIdx).trim();
  const rest = raw.slice(eqIdx + 1);

  let value = rest;
  let comment = "";
  let inSingle = false,
    inDouble = false;
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) {
      value = rest.slice(0, i).trimEnd();
      comment = rest.slice(i);
      break;
    }
  }

  return { kind: "key-value", key, value: value.trim(), comment, raw };
}

function rawToLines(raw: string): EnvLine[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((r) => ({ id: uid(), raw: r }));
}

function linesToRaw(lines: EnvLine[]): string {
  return lines.map((l) => l.raw).join("\n");
}

function looksLikeEnv(text: string): boolean {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  let kv = 0;
  for (const l of lines) {
    if (/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(l.trim())) kv++;
  }
  return kv >= 1;
}

const SECRET_KEYWORDS =
  /SECRET|KEY|TOKEN|PASSWORD|PASS|PWD|AUTH|CREDENTIAL|PRIVATE/i;
function isSecret(key: string) {
  return SECRET_KEYWORDS.test(key);
}
function maskValue(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return (
    value.slice(0, 2) +
    "•".repeat(Math.min(value.length - 2, 10)) +
    value.slice(-2)
  );
}

// ─── Token renderer ───────────────────────────────────────────────────────────

function LineTokens({
  parsed,
  masked,
}: {
  parsed: ParsedLine;
  masked: boolean;
}) {
  const { kind, key, value, comment, raw } = parsed;
  if (kind === "blank") return <span className="env-blank"> </span>;
  if (kind === "comment") return <span className="env-comment">{raw}</span>;
  if (kind === "invalid") return <span className="env-invalid">{raw}</span>;
  const displayValue = masked && isSecret(key) ? maskValue(value) : value;
  return (
    <>
      <span className="env-key">{key}</span>
      <span className="env-eq">=</span>
      <span className="env-value">{displayValue}</span>
      {comment && <span className="env-inline-comment"> {comment}</span>}
    </>
  );
}

// ─── Single editable line ─────────────────────────────────────────────────────

interface EnvLineRowProps {
  line: EnvLine;
  index: number;
  masked: boolean;
  focused: boolean;
  allSelected: boolean;
  onChange: (id: string, raw: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLDivElement>,
    id: string,
    index: number,
  ) => void;
  onFocus: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}

function EnvLineRow({
  line,
  index,
  masked,
  focused,
  allSelected,
  onChange,
  onKeyDown,
  onFocus,
  registerRef,
}: EnvLineRowProps) {
  const parsed = useMemo(() => parseLine(line.raw), [line.raw]);
  const divRef = useRef<HTMLDivElement>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (divRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      registerRef(line.id, el);
    },
    [line.id, registerRef],
  );

  useLayoutEffect(() => {
    const el = divRef.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== line.raw) el.textContent = line.raw;
  }, [line.raw]);

  return (
    <div className="env-row" data-focused={focused} data-selected={allSelected}>
      <span className="env-lineno" aria-hidden>
        {index + 1}
      </span>

      {!focused && (
        <div className="env-overlay" aria-hidden>
          <LineTokens parsed={parsed} masked={masked} />
        </div>
      )}

      <div
        ref={setRef}
        role="textbox"
        aria-label={`Line ${index + 1}`}
        aria-multiline={false}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        data-id={line.id}
        className={cn(
          "env-input",
          focused ? "env-input--visible" : "env-input--hidden",
        )}
        onFocus={() => onFocus(line.id)}
        onBlur={(e) => {
          const raw = e.currentTarget.textContent ?? "";
          if (raw !== line.raw) onChange(line.id, raw);
        }}
        onInput={(e) => {
          const raw = (e.currentTarget as HTMLDivElement).textContent ?? "";
          onChange(line.id, raw);
        }}
        onKeyDown={(e) => onKeyDown(e, line.id, index)}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EnvEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  maxChars?: number;
  placeholder?: string;
}

export default function EnvEditor({
  value = "",
  onChange,
  maxChars = 5000,
  placeholder = "Paste or type your .env variables here…",
}: EnvEditorProps) {
  const [lines, setLines] = useState<EnvLine[]>(() =>
    value ? rawToLines(value) : [{ id: uid(), raw: "" }],
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const allSelectedRef = useRef(false);
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) lineRefs.current.set(id, el);
    else lineRefs.current.delete(id);
  }, []);

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const currentRaw = linesToRaw(lines);
    if (value === currentRaw) return;
    setLines(value ? rawToLines(value) : [{ id: uid(), raw: "" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setAllSelectedSync = useCallback((val: boolean) => {
    allSelectedRef.current = val;
    setAllSelected(val);
  }, []);

  const commit = useCallback((nextLines: EnvLine[]) => {
    onChangeRef.current?.(linesToRaw(nextLines));
  }, []);

  const updateLine = useCallback(
    (id: string, raw: string) => {
      setLines((prev) => {
        const next = prev.map((l) => (l.id === id ? { ...l, raw } : l));
        commit(next);
        return next;
      });
    },
    [commit],
  );

  const focusLine = useCallback((id: string, position?: "start" | "end") => {
    requestAnimationFrame(() => {
      const el = lineRefs.current.get(id);
      if (!el) return;
      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (el.childNodes.length === 0)
        el.appendChild(document.createTextNode(""));
      const node = el.childNodes[0];
      const pos = position === "start" ? 0 : ((node as Text).length ?? 0);
      range.setStart(node, pos);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  }, []);

  // ── Clear all ─────────────────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    const fresh: EnvLine = { id: uid(), raw: "" };
    setLines([fresh]);
    setFocusedId(null);
    setAllSelectedSync(false);
    commit([fresh]);
    // Focus after state settles
    requestAnimationFrame(() => focusLine(fresh.id, "start"));
  }, [commit, focusLine, setAllSelectedSync]);

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, id: string, index: number) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "a") {
        e.preventDefault();
        setAllSelectedSync(true);
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
        return;
      }

      if (allSelectedRef.current) {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          clearAll();
          return;
        }
        if (e.key.length === 1 && !mod) {
          e.preventDefault();
          const fresh: EnvLine = { id: uid(), raw: e.key };
          setLines([fresh]);
          setAllSelectedSync(false);
          commit([fresh]);
          focusLine(fresh.id, "end");
          return;
        }
        if (e.key === "Escape") {
          setAllSelectedSync(false);
          return;
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const newLine: EnvLine = { id: uid(), raw: "" };
        setLines((prev) => {
          const next = [...prev];
          next.splice(index + 1, 0, newLine);
          commit(next);
          return next;
        });
        requestAnimationFrame(() => focusLine(newLine.id, "start"));
        return;
      }

      if (e.key === "Backspace") {
        const el = e.currentTarget;
        if (!el.textContent && lines.length > 1) {
          e.preventDefault();
          setLines((prev) => {
            const next = prev.filter((l) => l.id !== id);
            commit(next);
            return next;
          });
          const prevLine = lines[index - 1] ?? lines[index + 1];
          if (prevLine) focusLine(prevLine.id, "end");
        }
        return;
      }

      if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        focusLine(lines[index - 1].id, "end");
        return;
      }
      if (e.key === "ArrowDown" && index < lines.length - 1) {
        e.preventDefault();
        focusLine(lines[index + 1].id, "start");
        return;
      }
    },
    [lines, focusLine, commit, clearAll, setAllSelectedSync],
  );

  const handleBodyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "a") {
        e.preventDefault();
        setAllSelectedSync(true);
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
        return;
      }
      if (allSelectedRef.current) {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          clearAll();
          return;
        }
        if (e.key.length === 1 && !mod) {
          e.preventDefault();
          const fresh: EnvLine = { id: uid(), raw: e.key };
          setLines([fresh]);
          setAllSelectedSync(false);
          commit([fresh]);
          focusLine(fresh.id, "end");
          return;
        }
        if (e.key === "Escape") {
          setAllSelectedSync(false);
          if (lines.length > 0) focusLine(lines[0].id, "start");
          return;
        }
      }
    },
    [clearAll, commit, focusLine, lines, setAllSelectedSync],
  );

  // ── Paste ─────────────────────────────────────────────────────────────────

  const handleContainerPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData.getData("text/plain");
      if (!text) return;
      const isMultiline = text.includes("\n") || text.includes("\r");
      if (!isMultiline && !looksLikeEnv(text)) return;
      e.preventDefault();
      const pastedLines = rawToLines(text);
      setLines((prev) => {
        const focusedIndex = focusedId
          ? prev.findIndex((l) => l.id === focusedId)
          : -1;
        let next: EnvLine[];
        if (prev.length === 1 && !prev[0].raw) {
          next = pastedLines;
        } else if (focusedIndex === -1) {
          next = [...prev, ...pastedLines];
        } else {
          const before = prev.slice(0, focusedIndex);
          const after = prev.slice(focusedIndex + 1);
          next = [
            ...(!prev[focusedIndex].raw
              ? before
              : [...before, prev[focusedIndex]]),
            ...pastedLines,
            ...after,
          ];
        }
        commit(next);
        requestAnimationFrame(() => {
          const last = next[next.length - 1];
          if (last) focusLine(last.id, "end");
        });
        return next;
      });
    },
    [focusedId, focusLine, commit],
  );

  // ── Copy all ──────────────────────────────────────────────────────────────

  const handleCopyAll = useCallback(async () => {
    await navigator.clipboard.writeText(linesToRaw(lines));
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [lines]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    let kvCount = 0,
      commentCount = 0;
    for (const l of lines) {
      const p = parseLine(l.raw);
      if (p.kind === "key-value") kvCount++;
      else if (p.kind === "comment") commentCount++;
    }
    return { charCount: linesToRaw(lines).length, kvCount, commentCount };
  }, [lines]);

  const overLimit = stats.charCount > maxChars;
  const isEmpty = lines.length === 1 && !lines[0].raw;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="env-editor-root">
      <style>{STYLES}</style>

      {/* Toolbar */}
      <div className="env-toolbar">
        <div className="env-toolbar-stats">
          <span>{stats.kvCount} variables</span>
          {stats.commentCount > 0 && <span>{stats.commentCount} comments</span>}
          <span className={overLimit ? "env-stat-over" : ""}>
            {stats.charCount}/{maxChars}
          </span>
        </div>

        <div className="env-toolbar-actions">
          <button
            type="button"
            className="env-btn"
            onClick={() => setMasked((v) => !v)}
          >
            {masked ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{masked ? "Reveal" : "Mask"}</span>
          </button>

          <button
            type="button"
            className="env-btn"
            onClick={handleCopyAll}
            disabled={isEmpty}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy all"}</span>
          </button>

          <button
            type="button"
            className="env-btn env-btn--danger"
            onClick={clearAll}
            disabled={isEmpty}
            title="Clear all content"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div
        className={cn("env-body", overLimit && "env-body--over-limit")}
        tabIndex={0}
        onPaste={handleContainerPaste}
        onKeyDown={handleBodyKeyDown}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains("env-body") && lines.length > 0) {
            focusLine(lines[lines.length - 1].id, "end");
          }
        }}
      >
        {/*
          Placeholder lives directly in env-body — completely outside the
          row/input stacking context so nothing can cover it.
          Hidden as soon as the editor has any content OR a line is focused.
        */}
        {isEmpty && focusedId === null && (
          <div
            className="env-placeholder"
            onClick={() => focusLine(lines[0].id, "start")}
          >
            {placeholder}
          </div>
        )}

        {lines.map((line, index) => (
          <EnvLineRow
            key={line.id}
            line={line}
            index={index}
            masked={masked}
            focused={focusedId === line.id}
            allSelected={allSelected}
            onChange={updateLine}
            onKeyDown={handleKeyDown}
            onFocus={(id) => {
              setFocusedId(id);
              setAllSelectedSync(false);
            }}
            registerRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  .env-editor-root {
    --env-bg: #ffffff;
    --env-bg-focus: #f9f9f9;
    --env-border: #e5e5e5;
    --env-border-focus: #d1d1d1;
    --env-lineno: #c8c8c8;
    --env-lineno-focus: #a0a0a0;
    --env-key: #d97706;
    --env-eq: #9ca3af;
    --env-value: #374151;
    --env-comment: #9ca3af;
    --env-invalid: #ef4444;
    --env-inline-comment: #b0b8c8;
    --env-placeholder: #c0c0c0;
    --env-font: 'Geist Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
    --env-font-ui: inherit;
    border-radius: 10px;
    border: 1px solid var(--env-border);
    background: var(--env-bg);
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .env-editor-root:focus-within {
    border-color: var(--env-border-focus);
    box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
  }

  /* ── Toolbar ── */
  .env-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px 6px 52px;
    border-bottom: 1px solid var(--env-border);
    background: var(--env-bg);
    gap: 12px;
  }

  .env-toolbar-stats {
    display: flex;
    gap: 10px;
    font-family: var(--env-font-ui);
    font-size: 11px;
    color: var(--env-lineno);
    letter-spacing: 0.01em;
  }

  .env-stat-over { color: #ef4444 !important; }

  .env-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .env-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 5px;
    border: none;
    background: transparent;
    color: #6b7280;
    font-family: var(--env-font-ui);
    font-size: 11.5px;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    white-space: nowrap;
  }

  .env-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .env-btn:not(:disabled):hover {
    background: #f0f0f0;
    color: #111;
  }

  .env-btn--danger:not(:disabled):hover {
    background: #fee2e2;
    color: #dc2626;
  }

  /* ── Body ── */
  .env-body {
    position: relative;
    padding: 6px 0;
    min-height: 160px;
    max-height: 480px;
    overflow-y: auto;
    overflow-x: auto;
    outline: none;
  }

  .env-body--over-limit { background: #fff8f8; }

  /* ── Placeholder ──
     Direct child of env-body. No rows, no inputs, no stacking conflicts.
     Vertically centred, aligned with where line text starts (left: 52px). ── */
  .env-placeholder {
    position: absolute;
    top: 50%;
    left: 52px;
    transform: translateY(-50%);
    color: var(--env-placeholder);
    font-family: var(--env-font);
    font-size: 12.5px;
    line-height: 18px;
    cursor: text;
    user-select: none;
    white-space: nowrap;
    pointer-events: auto;
  }

  /* ── Row ── */
  .env-row {
    position: relative;
    display: flex;
    align-items: stretch;
    min-height: 26px;
  }

  .env-row:hover .env-lineno { color: var(--env-lineno-focus); }
  .env-row[data-focused="true"] { background: var(--env-bg-focus); }
  .env-row[data-focused="true"] .env-lineno { color: var(--env-lineno-focus); }
  .env-row[data-selected="true"] { background: #dbeafe; }
  .env-row[data-selected="true"] .env-lineno { color: #60a5fa; }
  .env-row[data-selected="true"] .env-overlay span { color: #1d4ed8 !important; opacity: 1 !important; }

  /* ── Line number ── */
  .env-lineno {
    flex: 0 0 40px;
    text-align: right;
    padding: 5px 10px 4px 8px;
    font-family: var(--env-font);
    font-size: 11px;
    line-height: 18px;
    color: var(--env-lineno);
    user-select: none;
    pointer-events: none;
    transition: color 0.1s;
    align-self: flex-start;
  }

  /* ── Syntax overlay ── */
  .env-overlay {
    position: absolute;
    left: 52px; right: 0; top: 0; bottom: 0;
    display: flex;
    align-items: center;
    padding: 4px 16px 4px 0;
    font-family: var(--env-font);
    font-size: 12.5px;
    line-height: 18px;
    pointer-events: none;
    user-select: none;
    white-space: pre;
    overflow: hidden;
  }

  .env-key    { color: var(--env-key); font-weight: 500; }
  .env-eq     { color: var(--env-eq); padding: 0 1px; }
  .env-value  { color: var(--env-value); }
  .env-comment { color: var(--env-comment); font-style: italic; }
  .env-inline-comment { color: var(--env-inline-comment); font-style: italic; }
  .env-invalid { color: var(--env-invalid); text-decoration: underline wavy; }
  .env-blank  { display: inline-block; width: 0; }

  /* ── Editable input ── */
  .env-input {
    flex: 1;
    min-width: 0;
    padding: 4px 16px 4px 0;
    margin-left: 12px;
    font-family: var(--env-font);
    font-size: 12.5px;
    line-height: 18px;
    color: var(--env-value);
    white-space: pre;
    outline: none;
    caret-color: #374151;
    word-break: keep-all;
    overflow-wrap: normal;
    min-height: 26px;
  }

  .env-input--hidden {
    opacity: 0;
    position: absolute;
    left: 52px; right: 0; top: 0; bottom: 0;
  }

  .env-input--visible {
    opacity: 1;
    position: relative;
  }
`;
