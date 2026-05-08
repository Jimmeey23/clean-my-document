import { useEffect, useRef } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { motion } from "framer-motion";
import type { ThemeId } from "@/lib/themes";
import { THEMES } from "@/lib/themes";
import logo from "@/assets/physique57-logo.png";

marked.setOptions({ gfm: true, breaks: false });
// Custom renderer: render fenced ```mermaid blocks as a styled diagram block (preview).
const renderer = new marked.Renderer();
const origCode = renderer.code.bind(renderer);
renderer.code = (code: any, infostring?: string) => {
  const lang = (typeof code === "object" ? code.lang : infostring) ?? "";
  const text = typeof code === "object" ? code.text : code;
  if (String(lang).toLowerCase() === "mermaid") {
    const escaped = String(text).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" } as any)[c]);
    return `<div class="mermaid-block">${escaped}</div>`;
  }
  return origCode(code as any, infostring as any);
};
marked.use({ renderer });

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.keep(["table", "thead", "tbody", "tr", "th", "td"]);
td.addRule("mermaid", {
  filter: (node) => node.nodeName === "DIV" && (node as HTMLElement).classList.contains("mermaid-block"),
  replacement: (content, node) => "\n```mermaid\n" + (node as HTMLElement).innerText + "\n```\n",
});

type Props = {
  markdown: string;
  themeId: ThemeId;
  editable: boolean;
  title: string;
  onChange: (md: string) => void;
};

function BrandHeader({ meta }: { meta: string }) {
  return (
    <div className="doc-header brand-p57">
      <div className="brand">
        <img src={logo} alt="Physique 57 India" />
        <span className="name">Physique 57 India</span>
      </div>
      <div className="meta">{meta}</div>
    </div>
  );
}

function BrandFooter({ title, page = 1 }: { title: string; page?: number }) {
  return (
    <div className="doc-footer brand-p57">
      <span><span className="accent">P57</span> · {title || "Untitled Document"}</span>
      <span>Crafted with Lumen · Page {page}</span>
    </div>
  );
}

export function DocPreview({ markdown, themeId, editable, title, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    ref.current.innerHTML = marked.parse(markdown || "") as string;
  }, [markdown]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(td.turndown(ref.current.innerHTML));
  };

  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  if (!markdown) {
    return (
      <div className={`doc-sheet ${theme.className}`}>
        <BrandHeader meta="Preview" />
        <div className="doc-body flex flex-col items-center justify-center text-center" style={{ minHeight: 480 }}>
          <div className="max-w-md">
            <h1>Your formatted document will appear here</h1>
            <p style={{ color: "#666" }}>Paste raw text on the left, choose a document type, hit <em>Refine</em>, and watch it become a publication-ready, editable document.</p>
          </div>
        </div>
        <BrandFooter title={title} />
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
      <BrandHeader meta={today} />
      <div
        ref={ref}
        className="doc-body"
        contentEditable={editable}
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        onBlur={handleInput}
      />
      <BrandFooter title={title} />
    </motion.div>
  );
}
