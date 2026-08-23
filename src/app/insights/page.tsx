import { createClient } from "@/lib/supabase/server";
import InsightsClient from "./InsightsClient";

export default async function InsightsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Insights</h1>
        <InsightsClient students={students ?? []} />
      </main>
    </div>
  );
}
