"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import EntriesClient from "@/app/entries/EntriesClient";
import Spinner from "@/components/Spinner";

interface Student {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

interface Entry {
  id: string;
  student_id: string;
  antecedent: string[];
  behavior: string[];
  consequence: string[];
  location: string;
  comments: string | null;
  timestamp: string;
  students?: { name: string } | null;
  staff?: { name: string } | null;
}

export default function StudentClient({
  student,
  entries,
}: {
  student: Student;
  entries: Entry[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("students")
      .update({ name: name.trim() })
      .eq("id", student.id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setEditing(false);
      setLoading(false);
      router.refresh();
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("students")
      .update({ active: !student.active })
      .eq("id", student.id);

    if (error) {
      setError(error.message);
    } else {
      setShowDeactivate(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-1.5 text-lg font-bold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Spinner className="h-4 w-4" />
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(student.name);
                setError(null);
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/entries/new?studentId=${student.id}`}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Log Entry
            </Link>
            <Link
              href={`/insights?studentId=${student.id}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Insights
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/entries/new?studentId=${student.id}`}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Log Entry
            </Link>
            <Link
              href={`/insights?studentId=${student.id}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Insights
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className={student.active ? "text-green-600" : "text-gray-500"}>
                {student.active ? "Active" : "Inactive"}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Added: {new Date(student.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Entries: {entries.length}
            </p>
          </div>
          <button
            onClick={() => setShowDeactivate(true)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            {student.active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {showDeactivate && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {student.active
              ? "Deactivating will hide this student from new entry forms. Existing entries will remain."
              : "Reactivating will make this student available for new entries."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Spinner className="h-4 w-4" />
                  Processing...
                </span>
              ) : student.active ? (
                "Deactivate"
              ) : (
                "Reactivate"
              )}
            </button>
            <button
              onClick={() => setShowDeactivate(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Entry History
        </h2>
        {entries.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No entries yet.</p>
            <Link
              href={`/entries/new?studentId=${student.id}`}
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Log the first observation
            </Link>
          </div>
        ) : (
          <EntriesClient entries={entries} />
        )}
      </div>
    </div>
  );
}
