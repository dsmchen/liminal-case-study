import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entry } from "./types";
import {
  generateInsights,
  type DeidentifiedEntry,
  type InsightResult,
} from "./gemini";

export const INSIGHT_THRESHOLD = 5;

export interface InsightStatus {
  thresholdMet: boolean;
  entryCount: number;
  threshold: number;
  existingInsight: {
    pattern_description: string;
    recommendations: string[];
    generated_at: string;
  } | null;
}

export function deidentifyEntry(entry: Entry): DeidentifiedEntry {
  return {
    antecedent: entry.antecedent,
    behavior: entry.behavior,
    consequence: entry.consequence,
    location: entry.location,
    comments: entry.comments,
    timestamp: entry.timestamp,
  };
}

export async function getInsightStatus(
  studentId: string,
  supabase: SupabaseClient
): Promise<InsightStatus> {
  const [entriesResult, insightResult] = await Promise.all([
    supabase
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId),
    supabase
      .from("insights")
      .select("pattern_description, recommendations, generated_at")
      .eq("student_id", studentId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const entryCount = entriesResult.count ?? 0;
  const existingInsight = insightResult.data;

  return {
    thresholdMet: entryCount >= INSIGHT_THRESHOLD,
    entryCount,
    threshold: INSIGHT_THRESHOLD,
    existingInsight: existingInsight
      ? {
          pattern_description: existingInsight.pattern_description,
          recommendations: existingInsight.recommendations,
          generated_at: existingInsight.generated_at,
        }
      : null,
  };
}

export async function generateAndSaveInsight(
  studentId: string,
  supabase: SupabaseClient
): Promise<InsightResult & { saved: boolean }> {
  const { data: entries, error } = await supabase
    .from("entries")
    .select("*")
    .eq("student_id", studentId)
    .order("timestamp", { ascending: false });

  if (error || !entries || entries.length < INSIGHT_THRESHOLD) {
    throw new Error("Not enough entries to generate insights");
  }

  const deidentified = entries.map(deidentifyEntry);
  const result = await generateInsights(deidentified);

  await supabase
    .from("insights")
    .delete()
    .eq("student_id", studentId);

  const { error: saveError } = await supabase.from("insights").insert({
    student_id: studentId,
    pattern_description: result.summary,
    recommendations: result.recommendations,
    supporting_entry_ids: entries.map((e: Entry) => e.id),
  });

  if (saveError) {
    console.error("Failed to save insight:", saveError);
  }

  return { ...result, saved: !saveError };
}
