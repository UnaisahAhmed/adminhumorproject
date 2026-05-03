import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadRecentRows } from "@/lib/admin-data";
import { formatAdminValue } from "@/lib/admin-format";
import { countTableRows, loadAllColumnRows } from "@/lib/admin-stats";

function topCounts(rows: Record<string, unknown>[], key: string, limit = 5) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const value = row[key];
    if (value !== null && value !== undefined && value !== "") {
      const id = String(value);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    profileCount,
    superadminCount,
    imageCount,
    commonUseImageCount,
    captionCount,
    featuredCaptionCount,
    captionRequestCount,
    promptChainCount,
    modelResponseCount,
    humorFlavorCount,
    latestCaptions,
    captionMetricRows,
    modelResponseMetricRows,
  ] = await Promise.all([
    countTableRows(supabase, "profiles"),
    countTableRows(supabase, "profiles", { column: "is_superadmin", value: true }),
    countTableRows(supabase, "images"),
    countTableRows(supabase, "images", { column: "is_common_use", value: true }),
    countTableRows(supabase, "captions"),
    countTableRows(supabase, "captions", { column: "is_featured", value: true }),
    countTableRows(supabase, "caption_requests"),
    countTableRows(supabase, "llm_prompt_chains"),
    countTableRows(supabase, "llm_model_responses"),
    countTableRows(supabase, "humor_flavors"),
    loadRecentRows(supabase, "captions", 5),
    loadAllColumnRows(supabase, "captions", "image_id,humor_flavor_id"),
    loadAllColumnRows(supabase, "llm_model_responses", "processing_time_seconds"),
  ]);

  const imagesWithCaptions = new Set(
    captionMetricRows
      .map((row) => row.image_id)
      .filter((value): value is string => typeof value === "string"),
  ).size;
  const averageCaptionsPerImage = captionCount / Math.max(imageCount, 1);
  const averageResponseSeconds =
    modelResponseMetricRows.reduce((sum, row) => {
      const value = Number(row.processing_time_seconds ?? 0);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0) / Math.max(modelResponseMetricRows.length, 1);
  const topFlavorIds = topCounts(captionMetricRows, "humor_flavor_id");

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-slate-600">
          Quick admin snapshot of your staging data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Profiles</p>
          <p className="mt-2 text-3xl font-bold">{profileCount}</p>
          <p className="mt-1 text-xs text-slate-500">{superadminCount} superadmins</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Images</p>
          <p className="mt-2 text-3xl font-bold">{imageCount}</p>
          <p className="mt-1 text-xs text-slate-500">{commonUseImageCount} common-use</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Captions</p>
          <p className="mt-2 text-3xl font-bold">{captionCount}</p>
          <p className="mt-1 text-xs text-slate-500">{featuredCaptionCount} featured</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">LLM Responses</p>
          <p className="mt-2 text-3xl font-bold">{modelResponseCount}</p>
          <p className="mt-1 text-xs text-slate-500">{averageResponseSeconds.toFixed(1)} sec avg</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">Generation Pipeline</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {[
              ["Images", imageCount],
              ["Requests", captionRequestCount],
              ["Prompt Chains", promptChainCount],
              ["LLM Calls", modelResponseCount],
              ["Captions", captionCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Images with captions</dt>
              <dd className="font-semibold">{imagesWithCaptions}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Captions per image</dt>
              <dd className="font-semibold">{averageCaptionsPerImage.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Humor flavors</dt>
              <dd className="font-semibold">{humorFlavorCount}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold">Top Caption Flavor IDs</h3>
          <div className="mt-3 space-y-2">
            {topFlavorIds.length === 0 ? (
              <p className="text-sm text-slate-500">No flavor data found.</p>
            ) : (
              topFlavorIds.map(([flavorId, count]) => (
                <div key={flavorId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Flavor {flavorId}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${Math.max(8, (count / topFlavorIds[0][1]) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

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
                  {String(row.content ?? "(no caption content found)")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  image_id: {String(row.image_id ?? "unknown")} · {formatAdminValue(row.created_datetime_utc)}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
