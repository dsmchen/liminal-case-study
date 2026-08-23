export interface Student {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  role: "lead_teacher" | "teaching_assistant" | "specialist";
  created_at: string;
}

export interface Entry {
  id: string;
  student_id: string;
  staff_id: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  comments: string | null;
  timestamp: string;
  location: string | null;
  created_at: string;
}

export interface Insight {
  id: string;
  student_id: string;
  pattern_description: string;
  supporting_entry_ids: string[];
  generated_at: string;
}
