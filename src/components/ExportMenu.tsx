import { useState } from "react";
import { Download, FileDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exportAs, FORMATS, type ExportFormat } from "@/lib/exporters";
import { toast } from "sonner";

export function ExportMenu({ markdown, disabled }: { markdown: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  const handle = async (fmt: ExportFormat) => {
    try {
      setBusy(fmt);
      await exportAs(fmt, markdown);
      toast.success(`Exported as ${FORMATS.find((f) => f.id === fmt)?.label}`);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
      >
        <FileDown className="h-4 w-4" />
        Export
        <span className="ml-1 rounded-md bg-primary-foreground/15 px-1.5 py-0.5 text-xs">{FORMATS.length}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-[var(--shadow-elegant)]"
            >
              <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">Choose a format</div>
              <div className="grid max-h-[420px] grid-cols-1 gap-0.5 overflow-y-auto">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handle(f.id)}
                    disabled={busy !== null}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-secondary disabled:opacity-50"
                  >
                    <div>
                      <div className="font-medium text-foreground">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{f.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono uppercase">.{f.ext}</span>
                      {busy === f.id ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Download className="h-3.5 w-3.5 opacity-50" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
