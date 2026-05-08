import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().min(1).max(200000),
  style: z.string().default("report"),
  docTypeHint: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert document editor and typesetter. Transform raw, messy, unstructured text into a beautifully formatted, well-structured document in GitHub-Flavored Markdown.

Structural rules:
- Detect the document's intent (report, SOP, manual, letter, memo, quiz, process note, business doc, article, academic paper, proposal, minutes, resume, spec) and structure accordingly.
- Open with a clear, compelling H1 title. If warranted, follow with a short italicized subtitle on the next line.
- For long/multi-part documents, break into "## Chapter N — Title" with H3 sub-sections inside. For shorter docs, use plain ## sections.
- If the content has 3+ distinct points, add a brief "## Executive Summary" with a paragraph or 3-5 bullet highlights.
- Use **bold** for key terms, _italics_ for emphasis, \`inline code\` for identifiers/commands.
- Promote ANY tabular, comparative, key-value, or list-of-attributes data into Markdown tables. Prefer tables over prose when comparing 2+ items across attributes.
- Use bullet lists for unordered enumerations, numbered lists for sequences/steps/rankings, nested lists for hierarchy.
- Use blockquotes for callouts and quoted material; horizontal rules (---) sparingly to separate major parts.
- For processes, hierarchies, taxonomies, or relationships — emit a Mermaid diagram in a fenced \`\`\`mermaid block (flowchart, mindmap, or sequenceDiagram). Use \`mindmap\` for concept maps and \`flowchart TD\` for processes.
- For numeric/comparative trends — emit a Mermaid \`xychart-beta\` or a clean Markdown table with a short caption underneath in italics.
- Use callout blocks like \`> 💡 **Tip:**\`, \`> ⚠️ **Warning:**\`, \`> ✅ **Best Practice:**\` where relevant.
- Keep paragraphs short (2-4 sentences). Maintain Title Case headings and parallel structure in lists.

Editorial rules:
- Fix grammar, spelling, capitalization, punctuation, and spacing without changing meaning.
- Convert run-on text into well-paragraphed prose. Remove filler. Preserve all factual information; do not invent facts.

Output ONLY the markdown document. No preface, no explanation, no surrounding code fences.`;

export const cleanText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const styleHint = [
      `Preferred style: ${data.style}.`,
      data.docTypeHint ? `Document type guidance: ${data.docTypeHint}` : "",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${styleHint}\n\nRaw text:\n\n${data.text}` },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI gateway error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) throw new Error("Empty response from AI");

    // Strip wrapping ```markdown fences if model added them
    const cleaned = content.replace(/^```(?:markdown|md)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    return { markdown: cleaned };
  });
