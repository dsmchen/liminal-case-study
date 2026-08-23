"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Student {
  id: string;
  name: string;
}

interface InsightStatus {
  thresholdMet: boolean;
  entryCount: number;
  threshold: number;
  existingInsight: {
    pattern_description: string;
    recommendations: string[];
    generated_at: string;
  } | null;
}

interface InsightPattern {
  category: "antecedent" | "behavior" | "consequence";
  description: string;
  frequency: string;
}

interface InsightData {
  patterns: InsightPattern[];
  recommendations: string[];
  summary: string;
}

export default function InsightsClient({ students }: { students: Student[] }) {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [status, setStatus] = useState<InsightStatus | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
      fetchStatus(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  const fetchStatus = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setInsight(null);
    setError(null);

    if (!studentId) {
      setStatus(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/insights?studentId=${studentId}`);
      const data = await res.json();
      setStatus(data);

      if (data.existingInsight) {
        setInsight({
          patterns: data.patterns ?? [],
          recommendations: data.recommendations ?? data.existingInsight.recommendations,
          summary: data.existingInsight.pattern_description,
        });
      }
    } catch {
      setError("Failed to load insight status");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!selectedStudentId) return;

    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate insights");
      }

      const data = await res.json();
      setInsight({
        patterns: data.patterns ?? [],
        recommendations: data.recommendations,
        summary: data.summary,
      });
      setStatus((prev) =>
        prev
          ? { ...prev, existingInsight: data.insight }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="student"
          className="block text-sm font-medium text-gray-700"
        >
          Select Student
        </label>
        <select
          id="student"
          value={selectedStudentId}
          onChange={(e) => fetchStatus(e.target.value)}
          className="mt-1 block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading...</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {status && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {!status.thresholdMet ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {status.entryCount} of {status.threshold} entries logged
                </span>
              </div>
              <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      (status.entryCount / status.threshold) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Log {status.threshold - status.entryCount} more{" "}
                {status.threshold - status.entryCount === 1
                  ? "entry"
                  : "entries"}{" "}
                to unlock insights.
              </p>
            </div>
          ) : !insight ? (
            <div>
              <p className="mb-4 text-sm text-gray-700">
                This student has {status.entryCount} logged entries. Ready to
                generate insights.
              </p>
              <button
                onClick={generateInsights}
                disabled={generating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Insights"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                <p className="mt-2 text-sm text-gray-700">{insight.summary}</p>
              </div>

              {insight.patterns.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Patterns
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {insight.patterns.map((p, i) => (
                      <li
                        key={i}
                        className="rounded-md bg-gray-50 p-3 text-sm text-gray-700"
                      >
                        <span className="font-medium capitalize">
                          {p.category}:
                        </span>{" "}
                        {p.description}{" "}
                        <span className="text-gray-500">({p.frequency})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.recommendations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recommendations
                  </h2>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                    {insight.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={generateInsights}
                disabled={generating}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {generating ? "Regenerating..." : "Regenerate Insights"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
