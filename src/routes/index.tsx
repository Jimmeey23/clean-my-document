import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, Wand2, Upload, ClipboardPaste, Loader2, RotateCcw,
  Pencil, Eye, Copy, Undo2, Redo2, Bold, Italic, List, ListOrdered, Quote,
  Heading1, Heading2, Heading3, Table as TableIcon, Minus, Code2, Palette, Check,
  Settings2, Ruler, ImageIcon, Type, Maximize2, Minimize2, Hash, Square, AlignLeft,
  CheckSquare, Lightbulb, AlertTriangle, FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { Toaster } from "@/components/ui/sonner";
import { DocPreview } from "@/components/DocPreview";
import { ExportMenu } from "@/components/ExportMenu";
import { cleanText } from "@/utils/clean.functions";
import {
  THEMES, DEFAULT_THEME, DOC_TYPES, DEFAULT_PAGE, PAGE_SIZES, PAGE_COLORS,
  BORDER_STYLES, MARGINS, BODY_FONTS,
  type ThemeId, type PageConfig, type PageSize, type BorderStyle, type Margins,
} from "@/lib/themes";
import logo from "@/assets/physique57-logo.png";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Lumen — Turn messy text into beautiful documents" },
      { name: "description", content: "Paste raw, unstructured text. Get back a beautifully formatted, editable document with 22 themes and 11 export formats." },
    ],
  }),
});

const TONES = ["Neutral", "Professional", "Friendly", "Persuasive", "Concise", "Authoritative", "Academic", "Marketing"] as const;
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
  const [page, setPage] = useState<PageConfig>(DEFAULT_PAGE);
  const [showPagePanel, setShowPagePanel] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => extractTitle(output), [output]);
  const updatePage = (patch: Partial<PageConfig>) => setPage((p) => ({ ...p, ...patch }));

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

  const applyFormat = (kind: string) => {
    if (!output && !["h1"].includes(kind)) return;
    let md = output;
    const wrap = (s: string, w: string) => `${w}${s}${w}`;
    switch (kind) {
      case "h1": md = `# New Heading\n\n` + md; break;
      case "h2": md = md + `\n\n## New Section\n`; break;
      case "h3": md = md + `\n\n### New Subsection\n`; break;
      case "bullet": md = md + `\n\n- Item one\n- Item two\n- Item three\n`; break;
      case "ordered": md = md + `\n\n1. First\n2. Second\n3. Third\n`; break;
      case "task": md = md + `\n\n- [ ] First action\n- [ ] Second action\n- [x] Done already\n`; break;
      case "quote": md = md + `\n\n> Memorable quote goes here.\n`; break;
      case "table": md = md + `\n\n| Column A | Column B | Column C |\n|---|---|---|\n| Row 1 | Value | Value |\n| Row 2 | Value | Value |\n`; break;
      case "code": md = md + "\n\n```\ncode block\n```\n"; break;
      case "hr": md = md + `\n\n---\n`; break;
      case "bold": md = md.replace(/\b(\w{4,})\b/, (m) => wrap(m, "**")); break;
      case "italic": md = md.replace(/\b(\w{4,})\b/, (m) => wrap(m, "_")); break;
      case "callout-tip":
        md = md + `\n\n<div class="callout tip"><span class="icon">💡</span><div><strong>Tip.</strong> Helpful insight goes here.</div></div>\n`; break;
      case "callout-warn":
        md = md + `\n\n<div class="callout warn"><span class="icon">⚠️</span><div><strong>Warning.</strong> Important caveat to note.</div></div>\n`; break;
      case "callout-success":
        md = md + `\n\n<div class="callout success"><span class="icon">✅</span><div><strong>Success.</strong> Best practice to follow.</div></div>\n`; break;
      case "stats":
        md = md + `\n\n<div class="cols-3"><div class="stat"><span class="label">Revenue</span><span class="value">$1.2M</span><span class="delta">+12%</span></div><div class="stat"><span class="label">Users</span><span class="value">8,420</span><span class="delta">+5%</span></div><div class="stat"><span class="label">Churn</span><span class="value">2.1%</span><span class="delta neg">-0.3%</span></div></div>\n`; break;
      case "cards":
        md = md + `\n\n<div class="cols-2"><div class="card"><h4>First idea</h4><p>Concise supporting paragraph.</p></div><div class="card"><h4>Second idea</h4><p>Concise supporting paragraph.</p></div></div>\n`; break;
      case "pullquote":
        md = md + `\n\n<blockquote class="pullquote">"A striking sentence worth quoting in its own right."</blockquote>\n`; break;
      case "kicker":
        md = `<span class="kicker">Section · 01</span>\n\n` + md; break;
      case "mermaid":
        md = md + "\n\n```mermaid\nflowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Outcome A]\n  B -->|No| D[Outcome B]\n```\n"; break;
    }
    setOutputTracked(md);
  };

  return (
    <div className={`min-h-screen ${zenMode ? "bg-background" : ""}`}>
      <Toaster theme="dark" position="top-center" richColors />

      {!zenMode && (
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">{DOC_TYPES.length} doc types · {THEMES.length} themes · {PAGE_SIZES.length} sizes · 11 exports</span>
            </div>
          </div>
        </header>
      )}

      {!zenMode && (
        <section className="relative mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Raw text in. <span className="gold-text italic">Beautiful documents</span> out.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Pick a document type and a theme, refine, then customise every page detail — size, borders, colors, header & footer — before exporting.
            </p>
          </motion.div>
        </section>
      )}

      <section id="workspace" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          {/* INPUT PANEL */}
          {!zenMode && (
            <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-[var(--shadow-elegant)] backdrop-blur">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Source</span>
                  <span className="text-xs text-muted-foreground">{input.length.toLocaleString()} chars · {input.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SmallBtn onClick={handlePaste} icon={<ClipboardPaste className="h-3.5 w-3.5" />}>Paste</SmallBtn>
                  <SmallBtn onClick={() => fileRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>Upload</SmallBtn>
                  <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.docx,.text,.rtf" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                  <SmallBtn onClick={() => setInput(SAMPLE)}>Sample</SmallBtn>
                  <SmallBtn onClick={() => setInput("")} disabled={!input} icon={<RotateCcw className="h-3.5 w-3.5" />}>Clear</SmallBtn>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste any raw text — meeting notes, transcripts, drafts, scrambled emails, brain-dumps, .docx contents, anything."
                className="h-[340px] w-full resize-none rounded-xl border border-border bg-background/50 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />

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

              {/* Quick rewrite actions */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] uppercase tracking-widest text-muted-foreground">Rewrite</span>
                {[
                  { l: "Shorter", x: "Make the document materially shorter while keeping all key facts." },
                  { l: "Longer", x: "Expand the document with more depth, examples and supporting detail." },
                  { l: "Simplify", x: "Simplify the language to a 9th-grade reading level without losing meaning." },
                  { l: "More formal", x: "Increase formality and remove colloquialisms." },
                  { l: "Add visuals", x: "Add tables, callouts, stat blocks and a Mermaid diagram where they help." },
                ].map((a) => (
                  <button key={a.l} onClick={() => refine(a.x)} disabled={loading || !input.trim()}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40">
                    {a.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OUTPUT PANEL */}
          <div className={`rounded-2xl border border-border bg-card/60 p-5 shadow-[var(--shadow-elegant)] backdrop-blur ${zenMode ? "lg:col-span-2" : ""}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Refined document</span>
                {output && <span className="text-xs text-muted-foreground">· {output.length.toLocaleString()} chars · {output.split(/\s+/).filter(Boolean).length} words</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <IconBtn onClick={undo} disabled={!history.length} title="Undo"><Undo2 className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={redo} disabled={!future.length} title="Redo"><Redo2 className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={() => setEditable((v) => !v)} title={editable ? "View only" : "Edit"}>
                  {editable ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </IconBtn>
                <IconBtn onClick={() => setZenMode((v) => !v)} title={zenMode ? "Exit focus mode" : "Focus mode"}>
                  {zenMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </IconBtn>
                <IconBtn onClick={copyMd} disabled={!output} title="Copy markdown"><Copy className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn onClick={() => refine("Regenerate with a fresh structure.")} disabled={loading || !input.trim()} title="Regenerate"><Wand2 className="h-3.5 w-3.5" /></IconBtn>
                <ExportMenu markdown={output} disabled={!output} />
              </div>
            </div>

            {/* Theme picker — visual swatches */}
            <div className="mb-3 overflow-x-auto rounded-xl border border-border bg-background/40 p-2">
              <div className="mb-1.5 flex items-center gap-2 px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Palette className="h-3 w-3" /> Theme · {THEMES.length}
              </div>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    title={t.desc}
                    className={`shrink-0 rounded-lg border p-1.5 text-left transition ${themeId === t.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
                  >
                    <div className="flex h-7 w-20 overflow-hidden rounded">
                      <span className="flex-1" style={{ background: t.swatch[0] }} />
                      <span className="flex-1" style={{ background: t.swatch[1] }} />
                      <span className="flex-1" style={{ background: t.swatch[2] }} />
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-foreground">
                      {themeId === t.id && <Check className="h-2.5 w-2.5 text-primary" />}
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
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
              <ToolBtn onClick={() => applyFormat("task")} title="Task list"><CheckSquare className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("quote")} title="Blockquote"><Quote className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("table")} title="Insert table"><TableIcon className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("code")} title="Code block"><Code2 className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("hr")} title="Divider"><Minus className="h-3.5 w-3.5" /></ToolBtn>
              <Sep />
              <ToolBtn onClick={() => applyFormat("callout-tip")} title="Tip callout"><Lightbulb className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("callout-warn")} title="Warning callout"><AlertTriangle className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("stats")} title="Stat row"><Hash className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("cards")} title="Card grid"><Square className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("pullquote")} title="Pull quote"><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("kicker")} title="Kicker"><Type className="h-3.5 w-3.5" /></ToolBtn>
              <ToolBtn onClick={() => applyFormat("mermaid")} title="Mermaid diagram"><FlaskConical className="h-3.5 w-3.5" /></ToolBtn>
              <Sep />
              <button onClick={() => setShowPagePanel((v) => !v)}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${showPagePanel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Settings2 className="h-3.5 w-3.5" /> Page settings
              </button>
            </div>

            {showPagePanel && (
              <PageSettingsPanel page={page} update={updatePage} />
            )}

            <div className="max-h-[820px] overflow-auto rounded-xl bg-black/10 p-4">
              <DocPreview markdown={output} themeId={themeId} editable={editable} title={title} page={page} onChange={setOutputTracked} />
            </div>
          </div>
        </div>
      </section>

      {!zenMode && (
        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          Crafted with care · Lumen Document Refinery · Physique 57 India
        </footer>
      )}
    </div>
  );
}

function PageSettingsPanel({ page, update }: { page: PageConfig; update: (p: Partial<PageConfig>) => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      className="mb-3 overflow-hidden rounded-xl border border-border bg-background/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Ruler className="h-3.5 w-3.5" /> Page setup
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Page size">
          <select value={page.size} onChange={(e) => update({ size: e.target.value as PageSize })} className="select">
            {PAGE_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Margins">
          <select value={page.margins} onChange={(e) => update({ margins: e.target.value as Margins })} className="select">
            {MARGINS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Border">
          <select value={page.border} onChange={(e) => update({ border: e.target.value as BorderStyle })} className="select">
            {BORDER_STYLES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="Body font">
          <select value={BODY_FONTS.find((f) => f.value === page.bodyFont)?.id ?? "default"}
            onChange={(e) => update({ bodyFont: BODY_FONTS.find((f) => f.id === e.target.value)?.value ?? "" })} className="select">
            {BODY_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </Field>
        <Field label={`Body scale · ${page.bodyScale.toFixed(2)}×`}>
          <input type="range" min={0.85} max={1.3} step={0.05} value={page.bodyScale}
            onChange={(e) => update({ bodyScale: Number(e.target.value) })} className="w-full" />
        </Field>
        <Field label="Fit preview to width">
          <Toggle on={page.fit} onChange={(v) => update({ fit: v })} />
        </Field>
        <Field label="Page color">
          <div className="flex flex-wrap items-center gap-1.5">
            {PAGE_COLORS.map((c) => (
              <button key={c.id} onClick={() => update({ bg: c.value })}
                title={c.label}
                className={`h-7 w-7 rounded-md border-2 transition ${page.bg === c.value ? "border-primary scale-110" : "border-border hover:scale-105"}`}
                style={{ background: c.value }}
              />
            ))}
            <input type="color" value={page.bg} onChange={(e) => update({ bg: e.target.value })}
              className="h-7 w-10 cursor-pointer rounded-md border border-border bg-transparent" />
          </div>
        </Field>
        <Field label="Header">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Toggle on={page.showHeader} onChange={(v) => update({ showHeader: v })} />
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <input type="checkbox" checked={page.showLogo} onChange={(e) => update({ showLogo: e.target.checked })} />
                <ImageIcon className="h-3 w-3" /> Logo
              </label>
            </div>
            <input type="text" value={page.headerText} placeholder="Header text (default: today's date)"
              onChange={(e) => update({ headerText: e.target.value })} className="input" disabled={!page.showHeader} />
          </div>
        </Field>
        <Field label="Footer">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Toggle on={page.showFooter} onChange={(v) => update({ showFooter: v })} />
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <input type="checkbox" checked={page.showPageNumbers} onChange={(e) => update({ showPageNumbers: e.target.checked })} />
                Page #
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="text" value={page.footerLeft} placeholder="Footer left" onChange={(e) => update({ footerLeft: e.target.value })} className="input" disabled={!page.showFooter} />
              <input type="text" value={page.footerRight} placeholder="Footer right" onChange={(e) => update({ footerRight: e.target.value })} className="input" disabled={!page.showFooter} />
            </div>
          </div>
        </Field>
      </div>
      <style>{`
        .input { width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); padding: 0.4rem 0.6rem; font-size: 0.78rem; color: var(--foreground); }
        .input:focus { outline: none; border-color: var(--primary); }
        .input:disabled { opacity: 0.5; }
        .select { width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); padding: 0.4rem 0.6rem; font-size: 0.78rem; color: var(--foreground); }
      `}</style>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`inline-flex h-5 w-9 items-center rounded-full border transition ${on ? "border-primary bg-primary/30" : "border-border bg-background"}`}>
      <span className={`h-4 w-4 rounded-full bg-foreground transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
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
    <button {...rest} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" type="button">
      {children}
    </button>
  );
}
function Sep() { return <div className="mx-1 h-4 w-px bg-border" />; }
function SmallBtn({ children, icon, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }) {
  return (
    <button {...rest} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40">
      {icon}{children}
    </button>
  );
}
