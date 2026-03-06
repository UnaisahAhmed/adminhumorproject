import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadRecentRows } from "@/lib/admin-data";

function countRows(rows: Record<string, unknown>[]) {
  return rows.length;
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [profiles, images, captions] = await Promise.all([
    loadRecentRows(supabase, "profiles", 500),
    loadRecentRows(supabase, "images", 500),
    loadRecentRows(supabase, "captions", 500),
  ]);

  const latestCaptions = captions.slice(0, 5);
  const imagesWithCaptions = new Set(
    captions
      .map((row) => row.image_id)
      .filter((value): value is string => typeof value === "string"),
  ).size;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-slate-600">
          Quick admin snapshot of your staging data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Profiles</p>
          <p className="mt-2 text-3xl font-bold">{countRows(profiles)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Images</p>
          <p className="mt-2 text-3xl font-bold">{countRows(images)}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Captions</p>
          <p className="mt-2 text-3xl font-bold">{countRows(captions)}</p>
        </article>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">Interesting Stats</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Images with at least one caption: {imagesWithCaptions}</li>
          <li>Average captions per image: {(captions.length / Math.max(images.length, 1)).toFixed(2)}</li>
          <li>Most recent caption batch shown below.</li>
        </ul>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Latest Captions</h3>
          <Link href="/admin/captions" className="text-sm text-blue-700 underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {latestCaptions.length === 0 ? (
            <p className="text-sm text-slate-500">No captions found.</p>
          ) : (
            latestCaptions.map((row, index) => (
              <div key={`caption-${index}`} className="rounded border border-slate-200 p-3 text-sm">
                <p className="line-clamp-2 text-slate-800">
                  {String(row.caption_text ?? row.text ?? "(no caption text column found)")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  image_id: {String(row.image_id ?? "unknown")}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
