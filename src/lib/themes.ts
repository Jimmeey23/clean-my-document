export type ThemeId =
  | "p57-standard"
  | "p57-modern"
  | "p57-editorial"
  | "p57-noir"
  | "modern"
  | "editorial"
  | "classic"
  | "technical"
  | "noir"
  | "ivory"
  | "playful"
  | "academic"
  | "magazine"
  | "swiss"
  | "brutalist"
  | "blueprint"
  | "terminal"
  | "vintage"
  | "neon"
  | "pastel"
  | "manuscript"
  | "corporate"
  | "newsprint";

export type Theme = {
  id: ThemeId;
  label: string;
  desc: string;
  className: string;
  swatch: [string, string, string]; // bg, accent, ink — for the picker chip
};

export const THEMES: Theme[] = [
  { id: "p57-standard",  label: "P57 Standard",  desc: "Default · formal JD-style document",        className: "theme-p57-standard",  swatch: ["#ffffff", "#0a2342", "#0a2342"] },
  { id: "p57-modern",    label: "P57 Modern",    desc: "Brand · crisp white, navy & cyan",          className: "theme-p57-modern",    swatch: ["#ffffff", "#25c6e6", "#0a2342"] },
  { id: "p57-editorial", label: "P57 Editorial", desc: "Brand serif on warm ivory",                 className: "theme-p57-editorial", swatch: ["#fbfaf6", "#25c6e6", "#0a2342"] },
  { id: "p57-noir",      label: "P57 Noir",      desc: "Brand on deep navy, cyan accents",          className: "theme-p57-noir",      swatch: ["#0a2342", "#25c6e6", "#ffffff"] },
  { id: "swiss",         label: "Swiss Grid",    desc: "Helvetica, red accent, structured",         className: "theme-swiss",         swatch: ["#ffffff", "#ee2a2a", "#0a0a0a"] },
  { id: "brutalist",     label: "Brutalist",     desc: "Mono, hard borders, raw concrete",          className: "theme-brutalist",     swatch: ["#f0eee6", "#000000", "#000000"] },
  { id: "blueprint",     label: "Blueprint",     desc: "Architect grid · cyan on indigo",           className: "theme-blueprint",     swatch: ["#11365e", "#7ee0ff", "#ffffff"] },
  { id: "terminal",      label: "Terminal",      desc: "Phosphor green on black, monospace",        className: "theme-terminal",      swatch: ["#0b0f0b", "#33ff88", "#9bffb8"] },
  { id: "vintage",       label: "Vintage Press", desc: "Aged paper, oxblood, ornaments",            className: "theme-vintage",       swatch: ["#f6ecd6", "#7a1f1f", "#2b1a0a"] },
  { id: "neon",          label: "Neon Cyber",    desc: "Synthwave magenta + cyan glow",             className: "theme-neon",          swatch: ["#0c0820", "#ff3df0", "#7df9ff"] },
  { id: "pastel",        label: "Pastel Soft",   desc: "Lavender · peach · mint, rounded",          className: "theme-pastel",        swatch: ["#fff7fb", "#c19bff", "#3a2a5b"] },
  { id: "manuscript",    label: "Manuscript",    desc: "Calligraphic serifs, deckled feel",         className: "theme-manuscript",    swatch: ["#fbf4e3", "#7a5a1f", "#1a1207"] },
  { id: "corporate",     label: "Corporate Blue",desc: "Sharp navy, slate accents, business",       className: "theme-corporate",     swatch: ["#ffffff", "#1d4ed8", "#0f172a"] },
  { id: "newsprint",     label: "Newsprint",     desc: "Multi-column hint, condensed serif",        className: "theme-newsprint",     swatch: ["#f3efe6", "#000000", "#111111"] },
  { id: "modern",        label: "Modern Minimal",desc: "Crisp white, thin border, sans",            className: "theme-modern",        swatch: ["#ffffff", "#111111", "#111111"] },
  { id: "editorial",     label: "Editorial Gold",desc: "Serif, warm paper, gold accents",           className: "theme-editorial",     swatch: ["#fdfbf5", "#c8a25a", "#1a1610"] },
  { id: "magazine",      label: "Magazine",      desc: "Playfair display, drop caps",               className: "theme-magazine",      swatch: ["#ffffff", "#111111", "#111111"] },
  { id: "classic",       label: "Classic Report",desc: "Times-style, formal headings",              className: "theme-classic",       swatch: ["#ffffff", "#333333", "#1a1a1a"] },
  { id: "academic",      label: "Academic",      desc: "Numbered sections, justified body",         className: "theme-academic",      swatch: ["#ffffff", "#555555", "#1a1a1a"] },
  { id: "technical",     label: "Technical",     desc: "Mono accents, dense layout",                className: "theme-technical",     swatch: ["#ffffff", "#2563eb", "#0e1116"] },
  { id: "playful",       label: "Playful",       desc: "Rounded, vibrant, friendly",                className: "theme-playful",       swatch: ["#fffaf3", "#ff6b6b", "#1a1830"] },
  { id: "noir",          label: "Noir Dark",     desc: "Dark paper, light ink",                     className: "theme-noir",          swatch: ["#161616", "#f0c66c", "#ececec"] },
  { id: "ivory",         label: "Ivory Premium", desc: "Cream paper, refined typography",           className: "theme-ivory",         swatch: ["#fbf8f1", "#c8a25a", "#2a2418"] },
];

export const DEFAULT_THEME: ThemeId = "p57-standard";

export type DocType = {
  id: string;
  label: string;
  hint: string;
};

export const DOC_TYPES: DocType[] = [
  { id: "auto", label: "Auto-detect", hint: "Detect the most appropriate document structure." },
  { id: "report", label: "Report", hint: "Structure as a formal report: Title, Executive Summary, Introduction, Findings (with tables/charts where appropriate), Analysis, Recommendations, Conclusion, Appendix." },
  { id: "business", label: "Business Document", hint: "Structure as a business document: Title, Overview, Objectives, Strategy, Market/Operational Analysis (with tables), Financials, Risks, Next Steps." },
  { id: "sop", label: "SOP", hint: "Structure as an SOP: Purpose, Scope, Responsibilities, Definitions, Materials/Tools, Procedure (numbered steps with sub-steps), Safety/Compliance, Revision History (table)." },
  { id: "sop-manual", label: "SOP Manual", hint: "Structure as a multi-procedure SOP manual: Cover, ToC, Chapters per procedure each with Purpose/Scope/Steps/Safety/Records, Glossary, Revision Log." },
  { id: "manual", label: "Manual / Handbook", hint: "Structure as a manual: Cover title, Table of Contents (bulleted), Chapters (## Chapter N — Title) each with sub-sections, callouts, and step lists." },
  { id: "brand-guidelines", label: "Brand Guidelines", hint: "Structure as brand guidelines: Brand Story, Logo Usage (do/don't grid), Color System (table with HEX/RGB/CMYK), Typography (samples), Voice & Tone, Imagery, Applications. Heavy use of cards and color tables." },
  { id: "checklist", label: "Checklist", hint: "Structure as a checklist: Title, Context, sectioned task lists using - [ ] task items grouped by phase. End with sign-off block." },
  { id: "email", label: "Email", hint: "Structure as a polished email: Subject line on first line as H3 'Subject:', Greeting, 2–4 short paragraphs, optional bullet list, Closing, Signature block." },
  { id: "study-doc", label: "Study Document", hint: "Structure as study notes: Title, Learning Objectives (bullets), Key Concepts (definition cards), Detailed Notes (sectioned), Examples (callouts), Practice Questions, Summary Cheat Sheet (table)." },
  { id: "presentation", label: "Presentation", hint: "Structure as slide deck script: each '## Slide N — Title' section is one slide with 3–6 bullet points, optional speaker notes as > blockquote. Separate slides with ---." },
  { id: "newsletter", label: "Newsletter", hint: "Structure as newsletter: Masthead H1 with kicker, lead story, 'In this issue' list, 2–3 short stories with H2, sidebar callouts, footer." },
  { id: "letter", label: "Letter", hint: "Structure as a formal letter: Date, Recipient block, Subject line, Salutation, well-paragraphed body, Closing, Signature block." },
  { id: "memo", label: "Memo", hint: "Memo: TO / FROM / DATE / SUBJECT header block, then concise sectioned body, action items list at end." },
  { id: "process", label: "Process Note", hint: "Process: Context, Process Map (numbered steps or table of stages with owner/SLA), Inputs/Outputs (table), Edge cases, Owners." },
  { id: "quiz", label: "Quiz / Worksheet", hint: "Quiz: Title, Instructions, numbered questions with sub-options a/b/c/d as nested list, Answer Key section at end." },
  { id: "faq", label: "FAQ", hint: "FAQ: brief intro, then '### Q: …' followed by 'A: …' paragraphs grouped by category." },
  { id: "recipe", label: "Recipe", hint: "Recipe: Title, hero blurb, Ingredients (bullets with quantities), Equipment (bullets), Method (numbered steps), Tips (callouts), Nutrition (table)." },
  { id: "article", label: "Article", hint: "Long-form article: Headline, deck/subtitle (italic), well-flowing sections with H2 headings, pull-quotes, closing." },
  { id: "academic", label: "Academic Paper", hint: "Academic: Title, Abstract, Introduction, Methods, Results (with tables), Discussion, Conclusion, References." },
  { id: "proposal", label: "Proposal", hint: "Proposal: Title, Executive Summary, Problem, Proposed Solution, Scope, Timeline (table), Budget (table), Team, Terms." },
  { id: "minutes", label: "Meeting Minutes", hint: "Minutes: Header (Date/Time/Attendees/Apologies), Agenda, Discussion per item, Decisions, Action Items table (Owner / Action / Due)." },
  { id: "resume", label: "Resume / CV", hint: "Resume: Name H1, contact line, Summary, Experience (role · company · dates with bullets), Education, Skills (inline), Certifications." },
  { id: "spec", label: "Tech Spec", hint: "Spec: Overview, Goals/Non-goals, Architecture, API/Data model (tables), Sequence (numbered), Risks, Rollout plan." },
  { id: "minimal", label: "Minimal Note", hint: "Keep it tight — single H1, short paragraphs, minimal structure." },
];

/* === Page configuration ===================================================== */

export type PageSize = "A4" | "Letter" | "Legal" | "A3" | "A5" | "Tabloid" | "Square";
export const PAGE_SIZES: { id: PageSize; label: string; width: string; minHeight: string }[] = [
  { id: "A4",      label: "A4 (210 × 297 mm)",        width: "210mm",  minHeight: "297mm" },
  { id: "Letter",  label: "US Letter (8.5 × 11 in)",  width: "8.5in",  minHeight: "11in" },
  { id: "Legal",   label: "US Legal (8.5 × 14 in)",   width: "8.5in",  minHeight: "14in" },
  { id: "A3",      label: "A3 (297 × 420 mm)",        width: "297mm",  minHeight: "420mm" },
  { id: "A5",      label: "A5 (148 × 210 mm)",        width: "148mm",  minHeight: "210mm" },
  { id: "Tabloid", label: "Tabloid (11 × 17 in)",     width: "11in",   minHeight: "17in" },
  { id: "Square",  label: "Square (210 × 210 mm)",    width: "210mm",  minHeight: "210mm" },
];

export type BorderStyle = "none" | "thin" | "thick" | "double" | "dashed" | "ornate" | "shadow";
export const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: "none",   label: "None" },
  { id: "thin",   label: "Thin hairline" },
  { id: "thick",  label: "Thick frame" },
  { id: "double", label: "Double rule" },
  { id: "dashed", label: "Dashed" },
  { id: "ornate", label: "Ornate" },
  { id: "shadow", label: "Soft shadow" },
];

export type PageColor = { id: string; label: string; value: string };
export const PAGE_COLORS: PageColor[] = [
  { id: "white",     label: "Pure White",   value: "#ffffff" },
  { id: "cream",     label: "Cream",        value: "#fbf8f1" },
  { id: "ivory",     label: "Ivory",        value: "#fdfbf5" },
  { id: "paper",     label: "Recycled",     value: "#f3efe6" },
  { id: "blueprint", label: "Blueprint",    value: "#11365e" },
  { id: "midnight",  label: "Midnight",     value: "#0a2342" },
  { id: "charcoal",  label: "Charcoal",     value: "#1a1a1a" },
  { id: "mint",      label: "Mint",         value: "#eef9f1" },
  { id: "blush",     label: "Blush",        value: "#fdf2f4" },
  { id: "lavender",  label: "Lavender",     value: "#f5f0fb" },
];

export type Margins = "compact" | "standard" | "wide" | "ultra";
export const MARGINS: { id: Margins; label: string; value: string }[] = [
  { id: "compact",  label: "Compact",  value: "1.6rem 2rem" },
  { id: "standard", label: "Standard", value: "3rem 3rem" },
  { id: "wide",     label: "Wide",     value: "4rem 4.5rem" },
  { id: "ultra",    label: "Ultra-wide", value: "5.5rem 6rem" },
];

export type PageConfig = {
  size: PageSize;
  fit: boolean;            // shrink to viewport width
  bg: string;              // color value
  border: BorderStyle;
  margins: Margins;
  showHeader: boolean;
  showFooter: boolean;
  headerText: string;      // overrides default meta when non-empty
  footerLeft: string;      // overrides default
  footerRight: string;     // overrides default
  showLogo: boolean;
  showPageNumbers: boolean;
  bodyFont: string;        // CSS font-family
  bodyScale: number;       // 0.85 .. 1.25
};

export const DEFAULT_PAGE: PageConfig = {
  size: "A4",
  fit: true,
  bg: "#ffffff",
  border: "thin",
  margins: "standard",
  showHeader: true,
  showFooter: true,
  headerText: "",
  footerLeft: "PROPERTY OF PHYSIQUE 57 INDIA",
  footerRight: "STANDARD OFFER LETTER 2026",
  showLogo: true,
  showPageNumbers: true,
  bodyFont: "",
  bodyScale: 1,
};

export const BODY_FONTS: { id: string; label: string; value: string }[] = [
  { id: "default",   label: "Theme default", value: "" },
  { id: "inter",     label: "Inter (Sans)",  value: '"Inter", system-ui, sans-serif' },
  { id: "play",      label: "Play (Brand)",  value: '"Play", "Inter", sans-serif' },
  { id: "playfair",  label: "Playfair Display (Serif)", value: '"Playfair Display", "Fraunces", serif' },
  { id: "fraunces",  label: "Fraunces (Serif)", value: '"Fraunces", "Cormorant Garamond", serif' },
  { id: "cormorant", label: "Cormorant (Serif)", value: '"Cormorant Garamond", "Times New Roman", serif' },
  { id: "dmserif",   label: "DM Serif Display",  value: '"DM Serif Display", "Playfair Display", serif' },
  { id: "mono",      label: "JetBrains Mono",  value: '"JetBrains Mono", ui-monospace, monospace' },
  { id: "times",     label: "Times",  value: '"Times New Roman", Times, serif' },
];
