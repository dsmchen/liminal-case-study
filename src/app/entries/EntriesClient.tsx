"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ANTECEDENT_OPTIONS,
  BEHAVIOR_OPTIONS,
  CONSEQUENCE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/types";

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

function toggleCheckbox(value: string, list: string[]): string[] {
  if (list.includes(value)) {
    return list.filter((v) => v !== value);
  }
  return [...list, value];
}

export default function EntriesClient({ entries }: { entries: Entry[] }) {
  const [localEntries, setLocalEntries] = useState<Entry[]>(entries);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);
  const [editData, setEditData] = useState<{
    antecedent: string[];
    behavior: string[];
    consequence: string[];
    location: string;
    comments: string;
  }>({ antecedent: [], behavior: [], consequence: [], location: "", comments: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const startEditing = (entry: Entry) => {
    setEditingId(entry.id);
    setEditData({
      antecedent: entry.antecedent,
      behavior: entry.behavior,
      consequence: entry.consequence,
      location: entry.location,
      comments: entry.comments ?? "",
    });
  };

  const handleSave = async (entryId: string) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("entries")
      .update({
        antecedent: editData.antecedent,
        behavior: editData.behavior,
        consequence: editData.consequence,
        location: editData.location,
        comments: editData.comments.trim() || null,
      })
      .eq("id", entryId);

    if (error) {
      setError(error.message);
    } else {
      setLocalEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                antecedent: editData.antecedent,
                behavior: editData.behavior,
                consequence: editData.consequence,
                location: editData.location,
                comments: editData.comments.trim() || null,
              }
            : e
        )
      );
      setEditingId(null);
    }
    setLoading(false);
  };

  const handleDelete = async (entryId: string) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      setError(error.message);
    } else {
      setLocalEntries((prev) => prev.filter((e) => e.id !== entryId));
      setShowDelete(null);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {localEntries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-gray-900">
                {entry.students?.name ?? "Unknown"}
              </h2>
              {entry.staff?.name && (
                <p className="text-xs text-gray-500">Staff: {entry.staff.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <time className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </time>
              {editingId !== entry.id && (
                <>
                  <button
                    onClick={() => startEditing(entry)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDelete(entry.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {editingId === entry.id ? (
            <div className="mt-4 space-y-4">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Antecedent
                </legend>
                <div className="mt-2 space-y-1">
                  {ANTECEDENT_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.antecedent.includes(opt)}
                        onChange={() =>
                          setEditData({
                            ...editData,
                            antecedent: toggleCheckbox(opt, editData.antecedent),
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Behavior
                </legend>
                <div className="mt-2 space-y-1">
                  {BEHAVIOR_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.behavior.includes(opt)}
                        onChange={() =>
                          setEditData({
                            ...editData,
                            behavior: toggleCheckbox(opt, editData.behavior),
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Consequence
                </legend>
                <div className="mt-2 space-y-1">
                  {CONSEQUENCE_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.consequence.includes(opt)}
                        onChange={() =>
                          setEditData({
                            ...editData,
                            consequence: toggleCheckbox(opt, editData.consequence),
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Location
                </legend>
                <div className="mt-2 space-y-1">
                  {LOCATION_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`location-${entry.id}`}
                        value={opt}
                        checked={editData.location === opt}
                        onChange={() =>
                          setEditData({ ...editData, location: opt })
                        }
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  value={editData.comments}
                  onChange={(e) =>
                    setEditData({ ...editData, comments: e.target.value })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(entry.id)}
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Antecedent: </span>
                <span className="text-gray-600">
                  {entry.antecedent.join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Behavior: </span>
                <span className="text-gray-600">
                  {entry.behavior.join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Consequence: </span>
                <span className="text-gray-600">
                  {entry.consequence.join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location: </span>
                <span className="text-gray-600">{entry.location}</span>
              </div>
              {entry.comments && (
                <div>
                  <span className="font-medium text-gray-700">Comments: </span>
                  <span className="text-gray-600">{entry.comments}</span>
                </div>
              )}
            </div>
          )}

          {showDelete === entry.id && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Are you sure you want to delete this entry? This action cannot
                be undone.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={loading}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDelete(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
