import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DeidentifiedEntry {
  antecedent: string[];
  behavior: string[];
  consequence: string[];
  location: string;
  comments: string | null;
  timestamp: string;
}

export interface InsightPattern {
  category: "antecedent" | "behavior" | "consequence";
  description: string;
  frequency: string;
}

export interface InsightResult {
  patterns: InsightPattern[];
  recommendations: string[];
  summary: string;
}

const PROMPT_TEMPLATE = `You are a SEN behavioral analyst assistant. Analyze the following ABC (Antecedent-Behavior-Consequence) entries for a student and identify patterns.

For each entry, you have: antecedent (what happened before), behavior (the observed behavior), consequence (what happened after), location, and optional comments.

Return a JSON object with:
1. "patterns": Array of objects with "category" (antecedent/behavior/consequence), "description" (what the pattern is), and "frequency" (how often it appears, e.g. "6 of 8 entries")
2. "recommendations": Array of actionable strings for the teaching team
3. "summary": A 2-3 sentence plain-language overview of the key findings

Focus on:
- Which antecedents most frequently precede challenging behaviors
- Which behaviors occur most often
- Which consequences appear to reduce recurrence
- Environmental factors (location patterns)

Do not make clinical diagnoses. Frame insights as discussion prompts.

Entries:
{entries}`;

function formatEntriesForPrompt(entries: DeidentifiedEntry[]): string {
  return entries
    .map(
      (entry, i) =>
        `Entry ${i + 1}:\n` +
        `  Antecedent: ${entry.antecedent.join(", ")}\n` +
        `  Behavior: ${entry.behavior.join(", ")}\n` +
        `  Consequence: ${entry.consequence.join(", ")}\n` +
        `  Location: ${entry.location}\n` +
        (entry.comments ? `  Comments: ${entry.comments}\n` : "") +
        `  Time: ${entry.timestamp}`
    )
    .join("\n\n");
}

export async function generateInsights(
  entries: DeidentifiedEntry[]
): Promise<InsightResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = PROMPT_TEMPLATE.replace(
    "{entries}",
    formatEntriesForPrompt(entries)
  );

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse insights response from Gemini");
  }

  const parsed = JSON.parse(jsonMatch[0]) as InsightResult;

  if (!Array.isArray(parsed.patterns) || !Array.isArray(parsed.recommendations)) {
    throw new Error("Invalid insights response structure");
  }

  return parsed;
}
