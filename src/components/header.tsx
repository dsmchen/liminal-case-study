import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">Behavior Tracker</Link>
        <div className="flex items-center gap-4">
          <Link
            href="/entries/new"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Entry
          </Link>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
