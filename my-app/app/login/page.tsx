import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "oauth_start_failed";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
      <p className="text-sm text-slate-600">
        Sign in with the Google account linked to your Supabase profile. Only
        users with <code>profiles.is_superadmin = true</code> can access the
        admin area.
      </p>
      {hasError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not start Google OAuth. Check your Supabase URL/key and Google
          provider setup.
        </p>
      ) : null}
      <a
        href="/auth/google"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Sign in with Google
      </a>
      <Link href="/" className="text-sm text-slate-500 underline">
        Back to home
      </Link>
    </main>
  );
}
