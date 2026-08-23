import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StudentClient from "./StudentClient";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) {
    notFound();
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("*, students(name)")
    .eq("student_id", id)
    .order("timestamp", { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <StudentClient student={student} entries={entries ?? []} />
      </main>
    </div>
  );
}
