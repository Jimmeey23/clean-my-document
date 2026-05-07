export type ThemeId = "modern" | "editorial" | "classic" | "technical" | "noir" | "ivory";

export type Theme = {
  id: ThemeId;
  label: string;
  desc: string;
  className: string; // applied to .doc-paper container
};

export const THEMES: Theme[] = [
  { id: "modern", label: "Modern Minimal", desc: "Crisp white, thin border, sans-serif", className: "theme-modern" },
  { id: "editorial", label: "Editorial", desc: "Serif, warm paper, gold accents", className: "theme-editorial" },
  { id: "classic", label: "Classic Report", desc: "Times-style, formal headings", className: "theme-classic" },
  { id: "technical", label: "Technical", desc: "Mono accents, dense layout", className: "theme-technical" },
  { id: "noir", label: "Noir Dark", desc: "Dark paper, light ink", className: "theme-noir" },
  { id: "ivory", label: "Ivory Premium", desc: "Cream paper, refined typography", className: "theme-ivory" },
];

export const DEFAULT_THEME: ThemeId = "modern";
