import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold text-red-700">Access denied</h1>
      <p className="text-sm text-slate-700">
        Your account is authenticated but is not marked as a superadmin in the
        <code> profiles </code> table.
      </p>
      <p className="text-sm text-slate-600">
        Ask an existing superadmin to set your profile row
        <code> is_superadmin </code> to <code>true</code>.
      </p>
      <Link href="/login" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
        Return to login
      </Link>
    </main>
  );
}
