"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/types";
import {
  ANTECEDENT_OPTIONS,
  BEHAVIOR_OPTIONS,
  CONSEQUENCE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/types";

export default function NewEntryPage() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [antecedent, setAntecedent] = useState<string[]>([]);
  const [antecedentOther, setAntecedentOther] = useState("");
  const [behavior, setBehavior] = useState<string[]>([]);
  const [behaviorOther, setBehaviorOther] = useState("");
  const [consequence, setConsequence] = useState<string[]>([]);
  const [consequenceOther, setConsequenceOther] = useState("");
  const [location, setLocation] = useState("");
  const [locationOther, setLocationOther] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("students")
      .select("*")
      .eq("active", true)
      .order("name")
      .then(({ data }) => {
        if (data) {
          setStudents(data);
          if (preselectedStudentId) {
            setStudentId(preselectedStudentId);
          }
        }
      });
  }, [preselectedStudentId]);

  const toggleCheckbox = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!staff) {
      setError("Staff profile not found");
      setLoading(false);
      return;
    }

    const finalAntecedent = [...antecedent];
    if (antecedentOther.trim()) {
      finalAntecedent.push(`Other: ${antecedentOther.trim()}`);
    }

    const finalBehavior = [...behavior];
    if (behaviorOther.trim()) {
      finalBehavior.push(`Other: ${behaviorOther.trim()}`);
    }

    const finalConsequence = [...consequence];
    if (consequenceOther.trim()) {
      finalConsequence.push(`Other: ${consequenceOther.trim()}`);
    }

    const finalLocation =
      location === "Other" && locationOther.trim()
        ? `Other: ${locationOther.trim()}`
        : location;

    if (!studentId) {
      setError("Please select a student");
      setLoading(false);
      return;
    }
    if (finalAntecedent.length === 0) {
      setError("Please select at least one antecedent");
      setLoading(false);
      return;
    }
    if (finalBehavior.length === 0) {
      setError("Please select at least one behavior");
      setLoading(false);
      return;
    }
    if (finalConsequence.length === 0) {
      setError("Please select at least one consequence");
      setLoading(false);
      return;
    }
    if (!finalLocation) {
      setError("Please select a location");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("entries").insert({
      student_id: studentId,
      staff_id: staff.id,
      antecedent: finalAntecedent,
      behavior: finalBehavior,
      consequence: finalConsequence,
      location: finalLocation,
      comments: comments.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/entries");
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          New ABC Entry
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">
              Antecedent *
            </legend>
            <p className="text-xs text-gray-500">Select all that apply</p>
            <div className="mt-2 space-y-2">
              {ANTECEDENT_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={antecedent.includes(opt)}
                    onChange={() =>
                      toggleCheckbox(opt, antecedent, setAntecedent)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={antecedentOther.length > 0 || antecedent.includes("Other")}
                  onChange={() => {
                    if (antecedentOther.trim()) {
                      toggleCheckbox(
                        `Other: ${antecedentOther}`,
                        antecedent,
                        setAntecedent
                      );
                    } else {
                      toggleCheckbox("Other", antecedent, setAntecedent);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other:</span>
                <input
                  type="text"
                  value={antecedentOther}
                  onChange={(e) => setAntecedentOther(e.target.value)}
                  placeholder="Specify..."
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">
              Behavior *
            </legend>
            <p className="text-xs text-gray-500">Select all that apply</p>
            <div className="mt-2 space-y-2">
              {BEHAVIOR_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={behavior.includes(opt)}
                    onChange={() =>
                      toggleCheckbox(opt, behavior, setBehavior)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={behaviorOther.length > 0 || behavior.includes("Other")}
                  onChange={() => {
                    if (behaviorOther.trim()) {
                      toggleCheckbox(
                        `Other: ${behaviorOther}`,
                        behavior,
                        setBehavior
                      );
                    } else {
                      toggleCheckbox("Other", behavior, setBehavior);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other:</span>
                <input
                  type="text"
                  value={behaviorOther}
                  onChange={(e) => setBehaviorOther(e.target.value)}
                  placeholder="Specify..."
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">
              Consequence *
            </legend>
            <p className="text-xs text-gray-500">Select all that apply</p>
            <div className="mt-2 space-y-2">
              {CONSEQUENCE_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consequence.includes(opt)}
                    onChange={() =>
                      toggleCheckbox(opt, consequence, setConsequence)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={consequenceOther.length > 0 || consequence.includes("Other")}
                  onChange={() => {
                    if (consequenceOther.trim()) {
                      toggleCheckbox(
                        `Other: ${consequenceOther}`,
                        consequence,
                        setConsequence
                      );
                    } else {
                      toggleCheckbox("Other", consequence, setConsequence);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other:</span>
                <input
                  type="text"
                  value={consequenceOther}
                  onChange={(e) => setConsequenceOther(e.target.value)}
                  placeholder="Specify..."
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700">
              Location *
            </legend>
            <div className="mt-2 space-y-2">
              {LOCATION_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="location"
                    value={opt}
                    checked={location === opt}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="location"
                  value="Other"
                  checked={location === "Other"}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Other:</span>
                <input
                  type="text"
                  value={locationOther}
                  onChange={(e) => setLocationOther(e.target.value)}
                  placeholder="Specify..."
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Entry"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
