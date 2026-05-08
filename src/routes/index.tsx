import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, Wand2, Upload, ClipboardPaste, Loader2, RotateCcw,
  Pencil, Eye, Copy, Undo2, Redo2, Bold, Italic, List, ListOrdered, Quote,
  Heading1, Heading2, Heading3, Table as TableIcon, Minus, Code2, Palette, Check,
} from "lucide-react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { Toaster } from "@/components/ui/sonner";
import { DocPreview } from "@/components/DocPreview";
import { ExportMenu } from "@/components/ExportMenu";
import { cleanText } from "@/utils/clean.functions";
import { THEMES, DEFAULT_THEME, DOC_TYPES, type ThemeId } from "@/lib/themes";
import logo from "@/assets/physique57-logo.png";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Lumen — Turn messy text into beautiful documents" },
      { name: "description", content: "Paste raw, unstructured text. Get back a beautifully formatted, editable document with 6 themes and 11 export formats." },
    ],
  }),
});

const TONES = ["Neutral", "Professional", "Friendly", "Persuasive", "Concise", "Authoritative"] as const;
const LENGTHS = ["Auto", "Brief", "Standard", "Detailed", "Exhaustive"] as const;

const SAMPLE = `quarterly review q3 - revenue grew 18% YoY hitting $4.2M, big driver was enterprise tier (up 31%). churn ticked up to 4.1% mostly in starter cohort. team shipped 14 features incl. SSO, audit logs, and the new analytics dashboard. hiring: closed 3 senior eng roles, 1 PM, 2 designers. risks: AWS cost up 22%, need to address. plans for q4: launch ai assistant, expand EU presence, ship mobile beta. customer NPS up to 52 from 47.`;

function extractTitle(md: string) {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? "Untitled Document";
}

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<string>("auto");
  const [tone, setTone] = useState<typeof TONES[number]>("Professional");
  const [length, setLength] = useState<typeof LENGTHS[number]>("Auto");
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [editable, setEditable] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => extractTitle(output), [output]);

  const setOutputTracked = useCallback((next: string) => {
    setOutput((prev) => {
      if (prev === next) return prev;
      setHistory((h) => [...h.slice(-49), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const refine = useCallback(async (extra?: string) => {
    if (!input.trim()) { toast.error("Paste some text first"); return; }
    setLoading(true);
    try {
      const dt = DOC_TYPES.find((d) => d.id === docType);
      const directives = [
        docType !== "auto" && `Document type: ${dt?.label}.`,
        `Tone: ${tone}.`,
        length !== "Auto" && `Length: ${length}.`,
        extra,
      ].filter(Boolean).join(" ");
      const res = await cleanText({
        data: {
          text: `${directives}\n\n${input.trim()}`,
          style: docType === "auto" ? "report" : docType,
          docTypeHint: dt?.hint,
        },
      });
      setOutputTracked(res.markdown);
      toast.success("Document refined");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to refine");
    } finally { setLoading(false); }
  }, [input, docType, tone, length, setOutputTracked]);

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { setInput(t); toast.success("Pasted from clipboard"); }
    } catch { toast.error("Clipboard access denied"); }
  };

  const handleFile = async (file: File) => {
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".docx")) {
        const buf = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
        setInput(value);
      } else {
        const t = await file.text();
        setInput(t);
      }
      toast.success(`Loaded ${file.name}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not read file");
    }
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [output, ...f]);
      setOutput(prev);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, output]);
      setOutput(next);
      return f.slice(1);
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); refine(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [output, refine]);

  const copyMd = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Markdown copied");
  };

  // Format actions: insert/transform at line where caret is. Simple operations on raw markdown.
  const applyFormat = (kind: string) => {
    if (!output) return;
    let md = output;
    const wrap = (s: string, w: string) => `${w}${s}${w}`;
    switch (kind) {
      case "h1": md = `# New Heading\n\n` + md; break;
      case "h2": md = md + `\n\n## New Section\n`; break;
      case "h3": md = md + `\n\n### New Subsection\n`; break;
      case "bullet": md = md + `\n\n- Item one\n- Item two\n- Item three\n`; break;
      case "ordered": md = md + `\n\n1. First\n2. Second\n3. Third\n`; break;
      case "quote": md = md + `\n\n> Memorable quote goes here.\n`; break;
      case "table": md = md + `\n\n| Column A | Column B | Column C |\n|---|---|---|\n| Row 1 | Value | Value |\n| Row 2 | Value | Value |\n`; break;
      case "code": md = md + "\n\n```\ncode block\n```\n"; break;
      case "hr": md = md + `\n\n---\n`; break;
      case "bold": md = md.replace(/\b(\w{4,})\b/, (m) => wrap(m, "**")); break;
      case "italic": md = md.replace(/\b(\w{4,})\b/, (m) => wrap(m, "_")); break;
    }
    setOutputTracked(md);
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" richColors />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0" style={{ background: "var(--gradient-radial)" }} />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-[var(--shadow-glow)]">
              <img src={logo} alt="Physique 57 India" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-[0.04em] text-foreground" style={{ fontFamily: '"Play", sans-serif' }}>
                PHYSIQUE 57 <span style={{ color: "var(--p57-cyan)" }}>· LUMEN</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">brand document refinery</div>
            </div>
          </div>
          <a href="#workspace" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">Skip to editor ↓</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-10 pt-12 text-center sm:pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--p57-cyan)" }} />
            16 document types · 9 themes · editable · 11 exports
          </div>
          </div>
          <h1 className="display text-5xl font-semibold leading-[1.05] sm:text-7xl">
            Raw text in. <span className="gold-text italic">Beautiful documents</span> out.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Drop messy notes, transcripts, or Word docs. Lumen restructures, edits, and typesets them into a publication-ready document — then lets you tweak it inline before exporting anywhere.
          </p>
        </motion.div>
      </section>

      {/* Workspace */}
      <section id="workspace" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Input */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-[var(--shadow-elegant)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span>Source</span>
                <span className="text-xs text-muted-foreground">{input.length.toLocaleString()} chars</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handlePaste} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs hover:bg-muted">
                  <ClipboardPaste className="h-3.5 w-3.5" /> Paste
                </button>
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs hover:bg-muted">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.docx,.text,.rtf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                <button onClick={() => setInput(SAMPLE)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
                  Sample
                </button>
                <button onClick={() => setInput("")} disabled={!input} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste any raw text — meeting notes, transcripts, drafts, scrambled emails, brain-dumps, .docx contents, anything."
              className="h-[380px] w-full resize-none rounded-xl border border-border bg-background/50 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />

            {/* Controls */}
            <div className="mt-4 space-y-3">
              <ControlRow label="Type">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </ControlRow>
              <ControlRow label="Tone">
                {TONES.map((t) => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>{t}</Chip>
                ))}
              </ControlRow>
              <ControlRow label="Length">
                {LENGTHS.map((l) => (
                  <Chip key={l} active={length === l} onClick={() => setLength(l)}>{l}</Chip>
                ))}
              </ControlRow>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">⌘/Ctrl + Enter to refine</div>
              <button
                onClick={() => refine()}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-accent px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {loading ? "Refining…" : "Refine document"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-[var(--shadow-elegant)] backdrop-blur">
            {/* Top bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Refined document</span>
                {output && <span className="text-xs text-muted-foreground">· {output.length.toLocaleString()} chars</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <IconBtn onClick={undo} disabled={!history.length} title="Undo"><Undo2 className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={redo} disabled={!future.length} title="Redo"><Redo2 className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={() => setEditable((v) => !v)} title={editable ? "View only" : "Edit"}>
                  {editable ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </IconBtn>
                <IconBtn onClick={copyMd} disabled={!output} title="Copy markdown"><Copy className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={() => refine("Regenerate with a fresh structure.")} disabled={loading || !input.trim()} title="Regenerate"><Wand2 className="h-3.5 w-3.5" /></IconBtn>
                <ExportMenu markdown={output} disabled={!output} />
              </div>
            </div>

            {/* Theme picker */}
            <div className="mb-3 flex items-center gap-2 overflow-x-auto rounded-xl border border-border bg-background/40 p-1.5">
              <Palette className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  title={t.desc}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs transition ${themeId === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  {themeId === t.id && <Check className="h-3 w-3" />}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Formatting toolbar */}
            <div className="mb-3 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-background/40 p-1.5">
              <ToolBtn onClick={() => applyFormat("h1")} title="Heading 1"><Heading1 className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("h2")} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("h3")} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></ToolBtn>
              <Sep />
              <ToolBtn onClick={() => applyFormat("bold")} title="Bold (first long word)"><Bold className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("italic")} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolBtn>
              <Sep />
              <ToolBtn onClick={() => applyFormat("bullet")} title="Bulleted list"><List className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("ordered")} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("quote")} title="Blockquote"><Quote className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("table")} title="Insert table"><TableIcon className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("code")} title="Code block"><Code2 className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("hr")} title="Divider"><Minus className="h-3.5 w-3.5" /></ToolBtn>
              <div className="ml-auto pr-2 text-[10px] uppercase tracking-widest text-muted-foreground">{editable ? "Editable preview" : "Read only"}</div>
            </div>

            <div className="max-h-[760px] overflow-auto rounded-xl">
              <DocPreview markdown={output} themeId={themeId} editable={editable} title={title} onChange={setOutputTracked} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { t: "Intelligent structure", d: "Sections, tables, lists, hierarchical typography — chosen automatically for the data." },
            { t: "Editable preview", d: "Click anywhere in the document and edit directly. Undo/redo, formatting toolbar, theme switcher." },
            { t: "11 export formats", d: "PDF, DOCX, HTML, Markdown, LaTeX, RTF, JSON, XML, CSV, TXT, EPUB-ready." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card/40 p-6">
              <div className="display text-lg font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Crafted with care · Lumen Document Refinery
      </footer>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-14 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}
function IconBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40">
      {children}
    </button>
  );
}
function ToolBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
      {children}
    </button>
  );
}
function Sep() { return <div className="mx-1 h-4 w-px bg-border" />; }
