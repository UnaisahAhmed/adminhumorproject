import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";
import { NavLinks } from "./nav-links";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = await isSuperAdmin(supabase, user.id);

  if (!allowed) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--rf-bg)" }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={{ background: "var(--rf-primary)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p
              className="font-clash text-3xl uppercase"
              style={{ color: "var(--rf-bg)", lineHeight: 0.9 }}
            >
              Admin
            </p>
            <p
              className="mt-0.5 text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--rf-accent)" }}
            >
              Humor Class Project 2
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p
              className="hidden text-xs font-medium tracking-wide sm:block"
              style={{ color: "rgba(228,226,221,0.55)" }}
            >
              {user?.email}
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="btn-cta px-4 py-2"
                style={{ fontSize: "0.75rem" }}
              >
                <span className="btn-cta-text">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Body grid ────────────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-6 py-6 lg:grid-cols-[210px_1fr]">
        {/* Sidebar */}
        <nav
          className="lg:sticky lg:top-6 rounded-none border p-4"
          style={{
            background: "var(--rf-surface)",
            borderColor: "var(--rf-border)",
          }}
        >
          <NavLinks />
        </nav>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
