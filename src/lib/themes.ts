export type ThemeId =
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
  | "magazine";

export type Theme = {
  id: ThemeId;
  label: string;
  desc: string;
  className: string;
};

export const THEMES: Theme[] = [
  { id: "p57-modern", label: "P57 Modern", desc: "Physique 57 brand — crisp white, navy & cyan", className: "theme-p57-modern" },
  { id: "p57-editorial", label: "P57 Editorial", desc: "Brand serif, ivory paper, navy ink", className: "theme-p57-editorial" },
  { id: "p57-noir", label: "P57 Noir", desc: "Brand on navy, cyan accents", className: "theme-p57-noir" },
  { id: "modern", label: "Modern Minimal", desc: "Crisp white, thin border, sans-serif", className: "theme-modern" },
  { id: "editorial", label: "Editorial", desc: "Serif, warm paper, gold accents", className: "theme-editorial" },
  { id: "magazine", label: "Magazine", desc: "Playfair display headlines, drop caps", className: "theme-magazine" },
  { id: "classic", label: "Classic Report", desc: "Times-style, formal headings", className: "theme-classic" },
  { id: "academic", label: "Academic", desc: "Numbered sections, justified body", className: "theme-academic" },
  { id: "technical", label: "Technical", desc: "Mono accents, dense layout", className: "theme-technical" },
  { id: "playful", label: "Playful", desc: "Rounded, vibrant, friendly", className: "theme-playful" },
  { id: "noir", label: "Noir Dark", desc: "Dark paper, light ink", className: "theme-noir" },
  { id: "ivory", label: "Ivory Premium", desc: "Cream paper, refined typography", className: "theme-ivory" },
];

export const DEFAULT_THEME: ThemeId = "p57-modern";

export type DocType = {
  id: string;
  label: string;
  hint: string; // sent to AI as structural guidance
};

export const DOC_TYPES: DocType[] = [
  { id: "auto", label: "Auto-detect", hint: "Detect the most appropriate document structure." },
  { id: "report", label: "Report", hint: "Structure as a formal report: Title, Executive Summary, Introduction, Findings (with tables/charts where appropriate), Analysis, Recommendations, Conclusion, Appendix." },
  { id: "business", label: "Business Document", hint: "Structure as a business document: Title, Overview, Objectives, Strategy, Market/Operational Analysis (with tables), Financials, Risks, Next Steps." },
  { id: "sop", label: "SOP (Standard Operating Procedure)", hint: "Structure as an SOP: Purpose, Scope, Responsibilities, Definitions, Materials/Tools, Procedure (numbered steps with sub-steps), Safety/Compliance, Revision History." },
  { id: "manual", label: "Manual / Handbook", hint: "Structure as a manual: Cover title, Table of Contents (as bulleted list), Chapters (## Chapter N — Title), each with sub-sections, callouts, and step lists." },
  { id: "letter", label: "Letter", hint: "Structure as a formal letter: Date, Recipient block, Subject line, Salutation, well-paragraphed body, Closing, Signature block." },
  { id: "memo", label: "Memo", hint: "Structure as a memo: TO / FROM / DATE / SUBJECT header block, then concise sectioned body, action items as a list at the end." },
  { id: "process", label: "Process Note", hint: "Structure as a process note: Context, Process Map (as numbered steps or table of stages with owner/SLA), Inputs/Outputs (table), Edge cases, Owners." },
  { id: "quiz", label: "Quiz / Worksheet", hint: "Structure as a quiz: Title, Instructions, numbered questions (with sub-options a/b/c/d as nested list), Answer Key section at the end." },
  { id: "article", label: "Article", hint: "Structure as a long-form article: Headline, deck/subtitle (italic), well-flowing sections with H2 headings, pull-quotes, and a closing." },
  { id: "academic", label: "Academic Paper", hint: "Structure as an academic paper: Title, Abstract, Introduction, Methods, Results (with tables), Discussion, Conclusion, References." },
  { id: "proposal", label: "Proposal", hint: "Structure as a proposal: Title, Executive Summary, Problem, Proposed Solution, Scope, Timeline (table), Budget (table), Team, Terms." },
  { id: "minutes", label: "Meeting Minutes", hint: "Structure as meeting minutes: Header (Date/Time/Attendees/Apologies), Agenda, Discussion per item, Decisions, Action Items table (Owner / Action / Due)." },
  { id: "resume", label: "Resume / CV", hint: "Structure as a resume: Name H1, contact line, Summary, Experience (role · company · dates with bullets), Education, Skills (as inline list), Certifications." },
  { id: "spec", label: "Tech Spec", hint: "Structure as a technical spec: Overview, Goals/Non-goals, Architecture, API/Data model (tables), Sequence (numbered), Risks, Rollout plan." },
  { id: "minimal", label: "Minimal Note", hint: "Keep it tight — single H1, short paragraphs, minimal structure." },
];
