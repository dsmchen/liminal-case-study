import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInsightStatus, generateAndSaveInsight } from "@/lib/insights";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const status = await getInsightStatus(studentId, supabase);

  if (!status.thresholdMet) {
    return NextResponse.json(
      {
        error: "Not enough entries",
        entryCount: status.entryCount,
        threshold: status.threshold,
      },
      { status: 400 }
    );
  }

  try {
    const result = await generateAndSaveInsight(studentId, supabase);
    return NextResponse.json({
      insight: {
        pattern_description: result.summary,
        recommendations: result.recommendations,
        generated_at: new Date().toISOString(),
      },
      patterns: result.patterns,
      recommendations: result.recommendations,
      summary: result.summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Insight generation failed:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const status = await getInsightStatus(studentId, supabase);
  return NextResponse.json(status);
}
