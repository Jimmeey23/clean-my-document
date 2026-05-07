import { useEffect, useRef } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { motion } from "framer-motion";
import type { ThemeId } from "@/lib/themes";
import { THEMES } from "@/lib/themes";
import { Sparkles } from "lucide-react";

marked.setOptions({ gfm: true, breaks: false });
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.keep(["table", "thead", "tbody", "tr", "th", "td"]);

type Props = {
  markdown: string;
  themeId: ThemeId;
  editable: boolean;
  title: string;
  onChange: (md: string) => void;
};

export function DocPreview({ markdown, themeId, editable, title, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // Render markdown -> HTML on external changes only
  useEffect(() => {
    if (!ref.current) return;
    const active = document.activeElement === ref.current;
    if (active) return; // don't blow away user edits while typing
    const html = marked.parse(markdown || "") as string;
    ref.current.innerHTML = html;
  }, [markdown]);

  const handleInput = () => {
    if (!ref.current) return;
    const md = td.turndown(ref.current.innerHTML);
    onChange(md);
  };

  if (!markdown) {
    return (
      <div className={`doc-sheet ${theme.className}`}>
        <div className="doc-header">
          <div className="brand"><Sparkles className="h-5 w-5" /> Lumen</div>
          <div className="meta">Preview</div>
        </div>
        <div className="doc-body flex flex-col items-center justify-center text-center" style={{ minHeight: 480 }}>
          <div className="max-w-md">
            <h1>Your formatted document will appear here</h1>
            <p style={{ color: "#666" }}>Paste raw text on the left, hit <em>Refine</em>, and watch it become a publication-ready document — fully editable inline.</p>
          </div>
        </div>
        <div className="doc-footer">
          <span>Lumen · Document Refinery</span>
          <span>Page 1</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={themeId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`doc-sheet ${theme.className}`}
    >
      <div className="doc-header">
        <div className="brand"><Sparkles className="h-5 w-5" /> Lumen</div>
        <div className="meta">{new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      <div
        ref={ref}
        className="doc-body"
        contentEditable={editable}
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        onBlur={handleInput}
      />
      <div className="doc-footer">
        <span>{title || "Untitled Document"}</span>
        <span>Crafted with Lumen</span>
      </div>
    </motion.div>
  );
}
