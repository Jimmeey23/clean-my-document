import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export function DocPreview({ markdown }: { markdown: string }) {
  if (!markdown) {
    return (
      <div className="doc-paper flex flex-col items-center justify-center text-center" style={{ minHeight: 480 }}>
        <div className="max-w-md">
          <div className="mb-4 inline-block rounded-full bg-[oklch(0.92_0.04_80)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[oklch(0.40_0.08_50)]">Preview</div>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl">Your formatted document will appear here</h1>
          <p className="mt-3 text-base text-[oklch(0.40_0.02_60)]">
            Paste any messy text on the left, hit <em>Refine</em>, and watch raw notes turn into a publication-ready document.
          </p>
        </div>
      </div>
    );
  }
  return (
    <motion.article
      key={markdown.slice(0, 60)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="doc-paper"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </motion.article>
  );
}
