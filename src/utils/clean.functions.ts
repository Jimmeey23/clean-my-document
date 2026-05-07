import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().min(1).max(200000),
  style: z.enum(["report", "article", "memo", "academic", "minimal"]).default("report"),
});

const SYSTEM_PROMPT = `You are an expert document editor and typesetter. Transform raw, messy, unstructured text into a beautifully formatted, well-structured document in GitHub-Flavored Markdown.

Rules:
- Detect the document's intent (report, article, notes, memo, contract, etc.) and structure accordingly.
- Add a clear, compelling H1 title at the top, then logical H2/H3 sections.
- Fix grammar, spelling, capitalization, punctuation, and spacing without changing meaning.
- Convert run-on text into well-paragraphed prose. Use lists where appropriate.
- Promote tabular/columnar data into proper Markdown tables.
- Use blockquotes for quoted material, code fences for code, bold/italic for emphasis where natural.
- Add a short executive summary or intro paragraph if the content warrants it.
- Preserve all factual information. Do not invent facts.
- Output ONLY the markdown document. No preface, no explanation, no code fences around the whole thing.`;

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
