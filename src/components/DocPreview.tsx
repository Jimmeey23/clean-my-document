import { useEffect, useRef, type CSSProperties } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { motion } from "framer-motion";
import type { ThemeId, PageConfig } from "@/lib/themes";
import { THEMES, PAGE_SIZES, MARGINS } from "@/lib/themes";
import logo from "@/assets/physique57-logo.png";

marked.setOptions({ gfm: true, breaks: false });
marked.use({
  extensions: [
    {
      name: "mermaidBlock",
      level: "block",
      start(src: string) { return src.indexOf("```mermaid"); },
      tokenizer(src: string) {
        const m = /^```mermaid\n([\s\S]*?)\n```/.exec(src);
        if (m) return { type: "mermaidBlock", raw: m[0], text: m[1] } as any;
      },
      renderer(token: any) {
        const escaped = String(token.text).replace(/[&<>]/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" } as any)[c]);
        return `<div class="mermaid-block">${escaped}</div>`;
      },
    },
  ],
});

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.keep(["table", "thead", "tbody", "tr", "th", "td"]);
td.addRule("mermaid", {
  filter: (node) => node.nodeName === "DIV" && (node as HTMLElement).classList.contains("mermaid-block"),
  replacement: (_c, node) => "\n```mermaid\n" + (node as HTMLElement).innerText + "\n```\n",
});

type Props = {
  markdown: string;
  themeId: ThemeId;
  editable: boolean;
  title: string;
  page: PageConfig;
  onChange: (md: string) => void;
};

function isDarkBg(hex: string) {
  const v = hex.replace("#", "");
  if (v.length < 6) return false;
  const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 130;
}

function BrandHeader({ meta, page, dark }: { meta: string; page: PageConfig; dark: boolean }) {
  if (!page.showHeader) return null;
  return (
    <div className={`doc-header brand-p57 ${dark ? "on-dark" : ""}`}>
      <div className="brand">
        {page.showLogo && <img src={logo} alt="Physique 57 India" />}
        <span className="name">Physique 57 India</span>
      </div>
      <div className="meta">{page.headerText || meta}</div>
    </div>
  );
}

function BrandFooter({ title, page, dark }: { title: string; page: PageConfig; dark: boolean }) {
  if (!page.showFooter) return null;
  const left = page.footerLeft || `P57 · ${title || "Untitled Document"}`;
  const right = page.footerRight || `Crafted with Lumen${page.showPageNumbers ? " · Page 1" : ""}`;
  return (
    <div className={`doc-footer brand-p57 ${dark ? "on-dark" : ""}`}>
      <span><span className="accent">{left.split(" · ")[0]}</span>{left.includes(" · ") ? " · " + left.split(" · ").slice(1).join(" · ") : ""}</span>
      <span>{right}</span>
    </div>
  );
}

export function DocPreview({ markdown, themeId, editable, title, page, onChange }: Props) {
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
  const pageSpec = PAGE_SIZES.find((p) => p.id === page.size) ?? PAGE_SIZES[0];
  const marginSpec = MARGINS.find((m) => m.id === page.margins) ?? MARGINS[1];
  const dark = isDarkBg(page.bg);

  const sheetStyle: CSSProperties = {
    background: page.bg,
    color: dark ? "#f1f5f9" : undefined,
    width: page.fit ? "100%" : pageSpec.width,
    maxWidth: page.fit ? pageSpec.width : undefined,
    minHeight: page.fit ? "auto" : pageSpec.minHeight,
    margin: "0 auto",
    "--doc-padding": marginSpec.value,
    "--doc-scale": String(page.bodyScale),
    fontFamily: page.bodyFont || undefined,
  } as CSSProperties;

  if (!markdown) {
    return (
      <div className={`doc-sheet ${theme.className} pb-${page.border}`} style={sheetStyle}>
        <BrandHeader meta="Preview" page={page} dark={dark} />
        <div className="doc-body flex flex-col items-center justify-center text-center" style={{ minHeight: 480 }}>
          <div className="max-w-md">
            <h1>Your formatted document will appear here</h1>
            <p style={{ opacity: 0.7 }}>Paste raw text on the left, choose a document type, hit <em>Refine</em>, and watch it become a publication-ready, editable document.</p>
          </div>
        </div>
        <BrandFooter title={title} page={page} dark={dark} />
      </div>
    );
  }

  return (
    <motion.div
      key={themeId + page.size + page.border + page.bg}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`doc-sheet ${theme.className} pb-${page.border}`}
      style={sheetStyle}
    >
      <BrandHeader meta={today} page={page} dark={dark} />
      <div
        ref={ref}
        className="doc-body"
        contentEditable={editable}
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        onBlur={handleInput}
      />
      <BrandFooter title={title} page={page} dark={dark} />
    </motion.div>
  );
}
