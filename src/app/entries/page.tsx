import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import EntriesClient from "./EntriesClient";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("entries")
    .select("*, students(name), staff(name)")
    .order("timestamp", { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Entry History</h1>
          <Link
            href="/entries/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Entry
          </Link>
        </div>

        {!entries || entries.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No entries yet.</p>
            <Link
              href="/entries/new"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Log your first observation
            </Link>
          </div>
        ) : (
          <EntriesClient entries={entries} />
        )}
      </main>
    </div>
  );
}
