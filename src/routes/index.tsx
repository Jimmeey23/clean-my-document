import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, Wand2, Upload, ClipboardPaste, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import mammoth from "mammoth";
import { Toaster } from "@/components/ui/sonner";
import { DocPreview } from "@/components/DocPreview";
import { ExportMenu } from "@/components/ExportMenu";
import { cleanText } from "@/utils/clean.functions";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Lumen — Turn messy text into beautiful documents" },
      { name: "description", content: "Paste raw, unstructured text. Get back a beautifully formatted, publication-ready document. Export to PDF, Word, Markdown, LaTeX and 7 more formats." },
      { property: "og:title", content: "Lumen — Refine raw text into beautiful documents" },
      { property: "og:description", content: "AI-assisted cleanup, intelligent structure, 11 export formats." },
    ],
  }),
});

const STYLES = [
  { id: "report", label: "Report" },
  { id: "article", label: "Article" },
  { id: "memo", label: "Memo" },
  { id: "academic", label: "Academic" },
  { id: "minimal", label: "Minimal" },
] as const;

const SAMPLE = `quarterly review q3 - revenue grew 18% YoY hitting $4.2M, big driver was enterprise tier (up 31%). churn ticked up to 4.1% mostly in starter cohort. team shipped 14 features incl. SSO, audit logs, and the new analytics dashboard. hiring: closed 3 senior eng roles, 1 PM, 2 designers. risks: AWS cost up 22%, need to address. plans for q4: launch ai assistant, expand EU presence, ship mobile beta. customer NPS up to 52 from 47.`;

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<(typeof STYLES)[number]["id"]>("report");
  const fileRef = useRef<HTMLInputElement>(null);

  const refine = useCallback(async () => {
    if (!input.trim()) { toast.error("Paste some text first"); return; }
    setLoading(true);
    try {
      const res = await cleanText({ data: { text: input.trim(), style } });
      setOutput(res.markdown);
      toast.success("Document refined");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to refine");
    } finally { setLoading(false); }
  }, [input, style]);

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

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" richColors />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0" style={{ background: "var(--gradient-radial)" }} />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="display text-xl font-semibold tracking-tight">Lumen</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">document refinery</div>
            </div>
          </div>
          <a href="#workspace" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">Skip to editor ↓</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-10 pt-16 text-center sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI-assisted typesetting · 11 export formats
          </div>
          <h1 className="display text-5xl font-semibold leading-[1.05] sm:text-7xl">
            Raw text in. <span className="gold-text italic">Beautiful documents</span> out.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Drop messy notes, transcripts, or Word docs. Lumen restructures, edits, and typesets them into a publication-ready document — then exports anywhere.
          </p>
        </motion.div>
      </section>

      {/* Workspace */}
      <section id="workspace" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
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
                  <Upload className="h-3.5 w-3.5" /> Upload .txt / .md / .docx
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.docx,.text,.rtf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                <button onClick={() => setInput(SAMPLE)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
                  Try sample
                </button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste any raw text — meeting notes, transcripts, drafts, scrambled emails, brain-dumps, .docx contents, anything."
              className="h-[420px] w-full resize-none rounded-xl border border-border bg-background/50 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs uppercase tracking-widest text-muted-foreground">Style</span>
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${style === s.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={refine}
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Refined document</span>
              </div>
              <div className="flex items-center gap-2">
                {output && (
                  <button onClick={() => setOutput("")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs hover:bg-muted">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
                <ExportMenu markdown={output} disabled={!output} />
              </div>
            </div>
            <div className="max-h-[640px] overflow-auto rounded-xl">
              <DocPreview markdown={output} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { t: "Intelligent structure", d: "Detects intent, adds titles, headings, lists, tables and quotes — automatically." },
            { t: "Editorial cleanup", d: "Fixes grammar, spacing, capitalization, and run-on prose without altering meaning." },
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
