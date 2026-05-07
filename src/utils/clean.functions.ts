import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().min(1).max(200000),
  style: z.enum(["report", "article", "memo", "academic", "minimal"]).default("report"),
});

const SYSTEM_PROMPT = `You are an expert document editor and typesetter. Transform raw, messy, unstructured text into a beautifully formatted, well-structured document in GitHub-Flavored Markdown.

Structural rules:
- Detect the document's intent (report, article, notes, memo, contract, spec, etc.) and structure accordingly.
- Open with a clear, compelling H1 title. If warranted, follow with a short italicized subtitle on the next line.
- If the content has 3+ distinct points, add a brief "## Executive Summary" with a paragraph or 3-5 bullet highlights.
- Group related content into logical H2 sections; use H3 subsections where natural. Section names should be descriptive.
- Use **bold** for key terms, _italics_ for emphasis, \`inline code\` for identifiers/commands.
- Promote ANY tabular, comparative, key-value, or list-of-attributes data into Markdown tables. Prefer tables over prose when comparing 2+ items across attributes.
- Use bullet lists for unordered enumerations, numbered lists for sequences/steps/rankings, nested lists for hierarchy.
- Use blockquotes for quoted material; code fences for code; horizontal rules (---) sparingly to separate major parts.
- Keep paragraphs short (2-4 sentences). Maintain Title Case headings and parallel structure in lists.
- If numeric/temporal data is present (metrics, KPIs, timelines), surface it in a table or labelled bullet block.

Editorial rules:
- Fix grammar, spelling, capitalization, punctuation, and spacing without changing meaning.
- Convert run-on text into well-paragraphed prose. Remove filler. Preserve all factual information; do not invent facts.

Output ONLY the markdown document. No preface, no explanation, no surrounding code fences.`;

export const cleanText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const styleHint = `Preferred style: ${data.style}.`;

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
