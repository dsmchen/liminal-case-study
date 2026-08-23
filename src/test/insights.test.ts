import { describe, it, expect } from "vitest";
import { deidentifyEntry, INSIGHT_THRESHOLD } from "../lib/insights";
import type { Entry } from "../lib/types";

describe("INSIGHT_THRESHOLD", () => {
  it("is set to 5", () => {
    expect(INSIGHT_THRESHOLD).toBe(5);
  });
});

describe("deidentifyEntry", () => {
  it("strips student_id and staff_id", () => {
    const entry: Entry = {
      id: "test-id",
      student_id: "student-123",
      staff_id: "staff-456",
      antecedent: ["Demand placed"],
      behavior: ["Hitting"],
      consequence: ["Verbal redirection"],
      location: "Classroom",
      comments: "Test comment",
      timestamp: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
    };

    const result = deidentifyEntry(entry);

    expect(result).toEqual({
      antecedent: ["Demand placed"],
      behavior: ["Hitting"],
      consequence: ["Verbal redirection"],
      location: "Classroom",
      comments: "Test comment",
      timestamp: "2024-01-01T00:00:00Z",
    });
  });

  it("preserves null comments", () => {
    const entry: Entry = {
      id: "test-id",
      student_id: "student-123",
      staff_id: "staff-456",
      antecedent: [],
      behavior: [],
      consequence: [],
      location: "Classroom",
      comments: null,
      timestamp: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
    };

    const result = deidentifyEntry(entry);

    expect(result.comments).toBeNull();
  });
});
