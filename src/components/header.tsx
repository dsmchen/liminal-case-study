import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Behavior Tracker</h1>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
