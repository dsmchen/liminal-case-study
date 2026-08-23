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
  antecedent: string[];
  behavior: string[];
  consequence: string[];
  location: string;
  comments: string | null;
  timestamp: string;
  created_at: string;
}

export interface Insight {
  id: string;
  student_id: string;
  pattern_description: string;
  supporting_entry_ids: string[];
  generated_at: string;
}

export const ANTECEDENT_OPTIONS = [
  "Demand placed",
  "New task/activity",
  "Difficult task/activity",
  "Not a preferred activity",
  "Writing activity",
  "Reading activity",
  "Listening activity",
  "Speaking activity",
  "Engaging in chosen activity",
  "Preferred activity interrupted/ended",
  "Playing alone",
  "Given assistance/correction",
  "Removal of item/object",
  "Unable to access item/object",
  "Told \"No\", \"Don't\", \"Stop\"",
  "Told to wait",
  "Left alone",
  "Presence of specific people",
  "Attention given to others",
  "Attention not given when wanted",
  "Loud, noisy environment",
  "Transitioning between activities",
  "Transitioning to different location",
] as const;

export const BEHAVIOR_OPTIONS = [
  "Hitting",
  "Kicking",
  "Punching",
  "Scratching",
  "Biting",
  "Screaming",
  "Shouting",
  "Swearing",
  "Hitting self",
  "Biting self",
  "Running away",
  "Dropping to the floor",
  "Not following directions",
  "Ignoring",
  "Destroying property",
  "Throwing objects",
  "Crying",
  "Hitting others",
] as const;

export const CONSEQUENCE_OPTIONS = [
  "Verbal redirection",
  "Attempt to reason/explain",
  "Given space",
  "Left alone",
  "Removed from activity/location",
  "Time out/calm time",
  "Redirected to sensory activity",
  "Ignored behaviour",
  "Offered physical reassurance",
  "Loss of reward/preferred item",
  "Physical intervention",
] as const;

export const LOCATION_OPTIONS = [
  "Cafeteria",
  "Classroom",
  "Hallway",
  "Playground",
  "Specialist room",
] as const;
