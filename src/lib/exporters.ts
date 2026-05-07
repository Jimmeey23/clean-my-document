import { saveAs } from "file-saver";
import { marked } from "marked";
import jsPDF from "jspdf";
import {
  Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType,
} from "docx";

marked.setOptions({ gfm: true, breaks: false });

export type ExportFormat =
  | "pdf" | "docx" | "html" | "markdown" | "txt"
  | "rtf" | "json" | "latex" | "xml" | "epub-html" | "csv-tables";

export const FORMATS: { id: ExportFormat; label: string; ext: string; desc: string }[] = [
  { id: "pdf", label: "PDF", ext: "pdf", desc: "Print-ready document" },
  { id: "docx", label: "Word (.docx)", ext: "docx", desc: "Microsoft Word" },
  { id: "html", label: "HTML", ext: "html", desc: "Styled web page" },
  { id: "markdown", label: "Markdown", ext: "md", desc: "GitHub-flavored" },
  { id: "txt", label: "Plain Text", ext: "txt", desc: "Unformatted" },
  { id: "rtf", label: "Rich Text (.rtf)", ext: "rtf", desc: "Universal rich text" },
  { id: "json", label: "JSON", ext: "json", desc: "Structured data" },
  { id: "latex", label: "LaTeX", ext: "tex", desc: "Academic typesetting" },
  { id: "xml", label: "XML", ext: "xml", desc: "Structured markup" },
  { id: "epub-html", label: "EPUB-ready HTML", ext: "html", desc: "E-reader format" },
  { id: "csv-tables", label: "CSV (tables)", ext: "csv", desc: "Extracted tables" },
];

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function buildHtml(markdown: string, title: string, embedStyles = true): string {
  const body = marked.parse(markdown) as string;
  const styles = embedStyles ? `<style>
    body{font-family:Georgia,'Times New Roman',serif;max-width:780px;margin:3rem auto;padding:0 2rem;line-height:1.7;color:#1a1610;background:#fdfbf5;}
    h1{font-size:2.2rem;border-bottom:2px solid #d4b675;padding-bottom:.5rem;}
    h2{color:#7a5a1f;margin-top:2rem;}
    h3{margin-top:1.4rem;}
    blockquote{border-left:3px solid #c8a25a;padding:.4rem 1rem;color:#555;background:#f5efdf;margin:1rem 0;}
    code{background:#efe7d2;padding:.1rem .35rem;border-radius:4px;font-family:ui-monospace,monospace;font-size:.92em;}
    pre{background:#1f1a12;color:#f4e8c8;padding:1rem;border-radius:8px;overflow:auto;}
    pre code{background:transparent;color:inherit;padding:0;}
    table{border-collapse:collapse;width:100%;margin:1rem 0;font-family:system-ui,sans-serif;}
    th,td{border:1px solid #d8cfb4;padding:.5rem .75rem;text-align:left;}
    th{background:#f0e6cc;}
    a{color:#7a5a1f;}
    hr{border:none;border-top:1px solid #d8cfb4;margin:2rem 0;}
  </style>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>${styles}</head><body>${body}</body></html>`;
}

function stripMd(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, (m) => m);
}

function extractTitle(md: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return (m?.[1] ?? "Document").trim().slice(0, 80);
}

// ---- PDF ----
function exportPdf(md: string, title: string) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => { if (y + h > pageH - margin) { doc.addPage(); y = margin; } };
  const writeBlock = (text: string, opts: { size: number; bold?: boolean; italic?: boolean; gap?: number; color?: [number, number, number] }) => {
    doc.setFont("times", opts.bold ? (opts.italic ? "bolditalic" : "bold") : (opts.italic ? "italic" : "normal"));
    doc.setFontSize(opts.size);
    if (opts.color) doc.setTextColor(...opts.color); else doc.setTextColor(20, 18, 14);
    const lines = doc.splitTextToSize(text, maxW);
    for (const ln of lines) {
      ensure(opts.size * 1.3);
      doc.text(ln, margin, y);
      y += opts.size * 1.3;
    }
    y += opts.gap ?? 6;
  };

  const lines = md.split("\n");
  let inCode = false;
  let codeBuf: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCode) {
        const text = codeBuf.join("\n");
        ensure(40);
        doc.setFillColor(245, 240, 225);
        const codeLines = doc.splitTextToSize(text, maxW - 16);
        const h = codeLines.length * 12 + 16;
        doc.rect(margin, y - 4, maxW, h, "F");
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 30, 10);
        let cy = y + 8;
        for (const cl of codeLines) { doc.text(cl, margin + 8, cy); cy += 12; }
        y += h + 6;
        codeBuf = []; inCode = false;
      } else inCode = true;
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    if (/^#\s+/.test(line)) writeBlock(line.replace(/^#\s+/, ""), { size: 22, bold: true, gap: 12 });
    else if (/^##\s+/.test(line)) writeBlock(line.replace(/^##\s+/, ""), { size: 16, bold: true, gap: 8, color: [110, 75, 20] });
    else if (/^###\s+/.test(line)) writeBlock(line.replace(/^###\s+/, ""), { size: 13, bold: true, gap: 6 });
    else if (/^>\s?/.test(line)) writeBlock(line.replace(/^>\s?/, ""), { size: 11, italic: true, gap: 6, color: [80, 70, 50] });
    else if (/^[-*+]\s+/.test(line)) writeBlock("•  " + line.replace(/^[-*+]\s+/, ""), { size: 11, gap: 2 });
    else if (/^\d+\.\s+/.test(line)) writeBlock(line, { size: 11, gap: 2 });
    else if (/^---+$/.test(line)) { ensure(10); doc.setDrawColor(200, 180, 130); doc.line(margin, y, pageW - margin, y); y += 12; }
    else if (line.trim() === "") y += 6;
    else writeBlock(stripMd(line), { size: 11, gap: 4 });
    i++;
  }

  // header gold band on first page
  doc.setPage(1);
  doc.setFillColor(212, 182, 117);
  doc.rect(0, 0, pageW, 6, "F");

  doc.save(`${title}.pdf`);
}

// ---- DOCX ----
async function exportDocx(md: string, title: string) {
  const children: Paragraph[] = [];
  const lines = md.split("\n");
  let inCode = false; let codeBuf: string[] = [];

  const para = (text: string, opts: { heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; bold?: boolean; italic?: boolean; size?: number } = {}) => {
    children.push(new Paragraph({
      heading: opts.heading,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: opts.bold, italics: opts.italic, size: opts.size, font: "Georgia" })],
    }));
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        for (const cl of codeBuf) children.push(new Paragraph({ children: [new TextRun({ text: cl, font: "Consolas", size: 20 })] }));
        codeBuf = []; inCode = false;
      } else inCode = true;
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (/^#\s+/.test(line)) para(line.replace(/^#\s+/, ""), { heading: HeadingLevel.HEADING_1 });
    else if (/^##\s+/.test(line)) para(line.replace(/^##\s+/, ""), { heading: HeadingLevel.HEADING_2 });
    else if (/^###\s+/.test(line)) para(line.replace(/^###\s+/, ""), { heading: HeadingLevel.HEADING_3 });
    else if (/^>\s?/.test(line)) para(line.replace(/^>\s?/, ""), { italic: true });
    else if (/^[-*+]\s+/.test(line)) children.push(new Paragraph({ text: line.replace(/^[-*+]\s+/, ""), bullet: { level: 0 } }));
    else if (/^\d+\.\s+/.test(line)) children.push(new Paragraph({ text: line.replace(/^\d+\.\s+/, ""), numbering: { reference: "num", level: 0 } as any }));
    else if (line.trim() === "") children.push(new Paragraph({ text: "" }));
    else para(stripMd(line));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}

function mdToRtf(md: string): string {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}");
  const parts: string[] = [];
  for (const line of md.split("\n")) {
    if (/^#\s+/.test(line)) parts.push(`\\pard\\fs40\\b ${esc(line.replace(/^#\s+/, ""))}\\b0\\par`);
    else if (/^##\s+/.test(line)) parts.push(`\\pard\\fs32\\b ${esc(line.replace(/^##\s+/, ""))}\\b0\\par`);
    else if (/^###\s+/.test(line)) parts.push(`\\pard\\fs26\\b ${esc(line.replace(/^###\s+/, ""))}\\b0\\par`);
    else if (/^>\s?/.test(line)) parts.push(`\\pard\\i ${esc(line.replace(/^>\s?/, ""))}\\i0\\par`);
    else if (/^[-*+]\s+/.test(line)) parts.push(`\\pard\\bullet  ${esc(line.replace(/^[-*+]\s+/, ""))}\\par`);
    else if (line.trim() === "") parts.push("\\par");
    else parts.push(`\\pard ${esc(stripMd(line))}\\par`);
  }
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Georgia;}}\\fs22\n${parts.join("\n")}\n}`;
}

function mdToLatex(md: string): string {
  const esc = (s: string) => s.replace(/([&%$#_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");
  const out: string[] = ["\\documentclass[11pt]{article}", "\\usepackage[utf8]{inputenc}", "\\usepackage{geometry}", "\\geometry{margin=1in}", "\\usepackage{hyperref}", "\\begin{document}"];
  let inList = false;
  for (const line of md.split("\n")) {
    if (/^#\s+/.test(line)) { if (inList) { out.push("\\end{itemize}"); inList = false; } out.push(`\\section*{${esc(line.replace(/^#\s+/, ""))}}`); }
    else if (/^##\s+/.test(line)) { if (inList) { out.push("\\end{itemize}"); inList = false; } out.push(`\\subsection*{${esc(line.replace(/^##\s+/, ""))}}`); }
    else if (/^###\s+/.test(line)) { if (inList) { out.push("\\end{itemize}"); inList = false; } out.push(`\\subsubsection*{${esc(line.replace(/^###\s+/, ""))}}`); }
    else if (/^[-*+]\s+/.test(line)) { if (!inList) { out.push("\\begin{itemize}"); inList = true; } out.push(`\\item ${esc(line.replace(/^[-*+]\s+/, ""))}`); }
    else { if (inList) { out.push("\\end{itemize}"); inList = false; } if (line.trim()) out.push(esc(stripMd(line))); else out.push(""); }
  }
  if (inList) out.push("\\end{itemize}");
  out.push("\\end{document}");
  return out.join("\n");
}

type Node = { type: string; level?: number; text?: string; children?: Node[] };
function mdToTree(md: string): Node[] {
  const nodes: Node[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      const lvl = line.match(/^(#+)/)![1].length;
      nodes.push({ type: "heading", level: lvl, text: line.replace(/^#+\s/, "").trim() });
    } else if (/^[-*+]\s+/.test(line)) {
      const items: Node[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push({ type: "item", text: stripMd(lines[i].replace(/^[-*+]\s+/, "")) });
        i++;
      }
      nodes.push({ type: "list", children: items });
      continue;
    } else if (line.trim()) {
      nodes.push({ type: "paragraph", text: stripMd(line) });
    }
    i++;
  }
  return nodes;
}

function mdToXml(md: string, title: string): string {
  const tree = mdToTree(md);
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
  const render = (n: Node): string => {
    if (n.type === "heading") return `<heading level="${n.level}">${esc(n.text!)}</heading>`;
    if (n.type === "paragraph") return `<paragraph>${esc(n.text!)}</paragraph>`;
    if (n.type === "list") return `<list>${n.children!.map((c) => `<item>${esc(c.text!)}</item>`).join("")}</list>`;
    return "";
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<document title="${esc(title)}">\n${tree.map(render).join("\n")}\n</document>`;
}

function extractCsvTables(md: string): string {
  const blocks: string[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (/^\|.+\|$/.test(lines[i]) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1])) {
      const rows: string[] = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
        if (!/^\|[\s:|-]+\|$/.test(lines[i])) {
          const cells = lines[i].slice(1, -1).split("|").map((c) => c.trim().replace(/"/g, '""'));
          rows.push(cells.map((c) => `"${c}"`).join(","));
        }
        i++;
      }
      blocks.push(rows.join("\n"));
    } else i++;
  }
  return blocks.length ? blocks.join("\n\n") : "No tables found in document.";
}

export async function exportAs(format: ExportFormat, markdown: string) {
  const title = extractTitle(markdown).replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "document";
  switch (format) {
    case "pdf": return exportPdf(markdown, title);
    case "docx": return exportDocx(markdown, title);
    case "html": {
      const html = buildHtml(markdown, title);
      saveAs(new Blob([html], { type: "text/html;charset=utf-8" }), `${title}.html`);
      return;
    }
    case "epub-html": {
      const html = buildHtml(markdown, title, true)
        .replace("<html>", '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">');
      saveAs(new Blob([html], { type: "application/xhtml+xml" }), `${title}.epub.html`);
      return;
    }
    case "markdown": saveAs(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), `${title}.md`); return;
    case "txt": saveAs(new Blob([stripMd(markdown)], { type: "text/plain;charset=utf-8" }), `${title}.txt`); return;
    case "rtf": saveAs(new Blob([mdToRtf(markdown)], { type: "application/rtf" }), `${title}.rtf`); return;
    case "json": {
      const obj = { title, generatedAt: new Date().toISOString(), nodes: mdToTree(markdown), markdown };
      saveAs(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }), `${title}.json`);
      return;
    }
    case "latex": saveAs(new Blob([mdToLatex(markdown)], { type: "application/x-latex" }), `${title}.tex`); return;
    case "xml": saveAs(new Blob([mdToXml(markdown, title)], { type: "application/xml" }), `${title}.xml`); return;
    case "csv-tables": saveAs(new Blob([extractCsvTables(markdown)], { type: "text/csv" }), `${title}.csv`); return;
  }
}
