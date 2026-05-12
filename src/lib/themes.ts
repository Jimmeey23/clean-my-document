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
  { id: "auto", label: "Auto-detect", hint: "Use the mandatory shared Physique 57 template: H1 title, intro, compact meta line, all-caps H2 sections, Roman-numbered all-caps H3 subsections, tight bullets, closing section." },
  { id: "report", label: "Report", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for executive summary, findings, recommendations, and conclusion without changing the template order." },
  { id: "business", label: "Business Document", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for objectives, strategy, risks, owners, and next steps without changing the template order." },
  { id: "sop", label: "SOP", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for purpose, scope, responsibilities, procedure, compliance, records, and approvals without changing the template order." },
  { id: "sop-manual", label: "SOP Manual", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for procedure groups, responsibilities, safety, records, and revision notes without changing the template order." },
  { id: "manual", label: "Manual / Handbook", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for handbook chapters, standards, procedures, and summary without changing the template order." },
  { id: "brand-guidelines", label: "Brand Guidelines", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for brand story, logo, color, typography, voice, imagery, and applications without changing the template order." },
  { id: "checklist", label: "Checklist", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for checklist phases and sign-off while keeping bullets compact and template order unchanged." },
  { id: "email", label: "Email", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for subject, message context, action points, and closing while preserving the template order." },
  { id: "study-doc", label: "Study Document", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for objectives, key concepts, notes, examples, questions, and summary without changing the template order." },
  { id: "presentation", label: "Presentation", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for slide groups and speaker points without using slide-only formatting or changing the template order." },
  { id: "newsletter", label: "Newsletter", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for lead story, updates, highlights, actions, and closing without changing the template order." },
  { id: "letter", label: "Letter", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for recipient context, subject, key message, action points, and closing without changing the template order." },
  { id: "memo", label: "Memo", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for memo metadata, context, decisions, actions, and closing without changing the template order." },
  { id: "process", label: "Process Note", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for process stages, owners, inputs, outputs, exceptions, and controls without changing the template order." },
  { id: "quiz", label: "Quiz / Worksheet", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for instructions, question groups, answer key, and closing without using a separate quiz layout." },
  { id: "faq", label: "FAQ", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for question groups and responses while preserving all-caps sections and Roman subsections." },
  { id: "recipe", label: "Recipe", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for ingredients, method, notes, and closing without changing the template order." },
  { id: "article", label: "Article", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for context, themes, supporting points, and closing without changing the template order." },
  { id: "academic", label: "Academic Paper", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for abstract, method, results, discussion, and conclusion without changing the template order." },
  { id: "proposal", label: "Proposal", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for problem, solution, scope, timeline, budget, terms, and closing without changing the template order." },
  { id: "minutes", label: "Meeting Minutes", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for meeting context, discussion, decisions, action items, and closing without changing the template order." },
  { id: "resume", label: "Resume / CV", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for profile, experience, education, skills, and certifications without changing the template order." },
  { id: "spec", label: "Tech Spec", hint: "Use the shared Physique 57 template; adapt H2/H3 labels for overview, goals, architecture, data, risks, rollout, and closing without changing the template order." },
  { id: "minimal", label: "Minimal Note", hint: "Use the shared Physique 57 template in a shorter form, but still preserve H1, intro, meta if relevant, all-caps H2, Roman H3, bullets, and closing." },
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
