import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("name");

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <Link
            href="/students/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Student
          </Link>
        </div>

        {!students || students.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No students yet.</p>
            <Link
              href="/students/new"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Add your first student
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="font-medium text-gray-900">{student.name}</h2>
                <p className="text-sm text-gray-500">
                  {student.active ? "Active" : "Inactive"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
