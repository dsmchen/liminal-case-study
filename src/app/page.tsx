import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/students"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-gray-900">Students</h2>
            <p className="mt-2 text-sm text-gray-600">
              View and manage student profiles
            </p>
          </Link>

          <Link
            href="/entries/new"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-gray-900">New Entry</h2>
            <p className="mt-2 text-sm text-gray-600">
              Log an ABC observation
            </p>
          </Link>

          <Link
            href="/entries"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Entry History
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Browse past observations
            </p>
          </Link>

          <Link
            href="/insights"
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
            <p className="mt-2 text-sm text-gray-600">
              View behavioral patterns
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
