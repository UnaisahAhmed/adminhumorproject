import Link from "next/link";
import { Fragment } from "react";
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

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user?.id ?? "")
    .single();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Admin";

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
  const captionCoverageRate = imageCount > 0
    ? Math.round((imagesWithCaptions / imageCount) * 100)
    : 0;

  return (
    <section className="space-y-8">

      {/* ── Welcome hero ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden p-8"
        style={{ background: "var(--rf-primary)" }}
      >
        {/* Blobs */}
        <div className="rf-blob" style={{ background: "var(--rf-accent)", top: "-20%", left: "-10%" }} />
        <div className="rf-blob rf-blob-2" style={{ background: "var(--rf-orange)", bottom: "-30%", right: "-5%" }} />

        <div className="relative z-10 animate-slide-up">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--rf-accent)" }}
          >
            Admin · Dashboard
          </p>
          <h2
            className="font-clash mt-2 uppercase"
            style={{ color: "var(--rf-bg)", fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            Welcome, {displayName}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(228,226,221,0.65)" }}>
            Track platform activity, monitor content health, and spot what needs attention.
            Use the sidebar to navigate to any section — tables, captions, LLM config, and access controls.
          </p>
        </div>
      </div>

      {/* ── Quick-start guide ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: "👤",
            title: "Profiles",
            body: "View account details, verify access levels, and keep profile data accurate.",
            href: "/admin/profiles",
          },
          {
            icon: "🖼️",
            title: "Images & Captions",
            body: "Upload images, review generated captions, and manage caption examples.",
            href: "/admin/images",
          },
          {
            icon: "🎭",
            title: "Humor System",
            body: "Configure humor flavors, set flavor mix ratios, and manage vocabulary terms.",
            href: "/admin/humor-flavors",
          },
          {
            icon: "🤖",
            title: "LLM System",
            body: "Manage model providers, available models, and review raw model responses.",
            href: "/admin/llm-providers",
          },
        ].map(({ icon, title, body, href }) => (
          <a
            key={title}
            href={href}
            className="rf-quickstart-card flex flex-col justify-between p-5"
            style={{ background: "var(--rf-primary)" }}
          >
            <div>
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <p
                className="mt-3 text-sm font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--rf-bg)" }}
              >
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(228,226,221,0.75)" }}>
                {body}
              </p>
            </div>
            <div className="mt-4">
              <span
                className="inline-block border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  borderColor: "var(--rf-accent)",
                  color: "var(--rf-accent)",
                }}
              >
                Open →
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid gap-px sm:grid-cols-2 xl:grid-cols-5"
        style={{ background: "var(--rf-border)" }}
      >
        {[
          { label: "Profiles",     value: profileCount,      sub: `${superadminCount} superadmins`, accent: "var(--rf-accent)" },
          { label: "Images",       value: imageCount,        sub: `${commonUseImageCount} common-use`, accent: "var(--rf-orange)" },
          { label: "Captions",     value: captionCount,      sub: `${featuredCaptionCount} featured`, accent: "var(--rf-accent)" },
          { label: "LLM Calls",    value: modelResponseCount,sub: `${averageResponseSeconds.toFixed(1)}s avg`, accent: "var(--rf-pink)" },
          { label: "Coverage",     value: `${captionCoverageRate}%`, sub: "images with captions", accent: "var(--rf-orange)" },
        ].map(({ label, value, sub, accent }) => (
          <article
            key={label}
            className="animate-slide-up flex flex-col justify-between p-5"
            style={{ background: "var(--rf-surface)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--rf-muted)" }}
            >
              {label}
            </p>
            <p
              className="font-clash my-3 text-5xl"
              style={{ color: accent }}
            >
              {value}
            </p>
            <p className="text-xs" style={{ color: "var(--rf-muted)" }}>
              {sub}
            </p>
          </article>
        ))}
      </div>

      {/* ── Generation Pipeline + Flavor chart ───────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">

        {/* Pipeline */}
        <article
          className="animate-slide-up border p-6"
          style={{ background: "var(--rf-surface)", borderColor: "var(--rf-border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--rf-muted)" }}
          >
            Generation Pipeline
          </p>
          <h3
            className="font-clash mt-1 text-2xl uppercase"
            style={{ color: "var(--rf-primary)" }}
          >
            End-to-End Flow
          </h3>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {([
              ["Images",     imageCount],
              ["Requests",   captionRequestCount],
              ["Chains",     promptChainCount],
              ["LLM Calls",  modelResponseCount],
              ["Captions",   captionCount],
            ] as [string, number][]).map(([label, value], i, arr) => (
              <Fragment key={label}>
                <div
                  className="flex min-w-[72px] flex-col items-center border px-3 py-2.5 text-center"
                  style={{ borderColor: "var(--rf-border)" }}
                >
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--rf-muted)" }}>
                    {label}
                  </p>
                  <p className="font-clash mt-1 text-2xl" style={{ color: "var(--rf-primary)" }}>
                    {value}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    style={{ color: "var(--rf-accent)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Fragment>
            ))}
          </div>

          <dl
            className="mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3"
            style={{ borderColor: "var(--rf-border)" }}
          >
            {[
              ["Images with captions", imagesWithCaptions],
              ["Captions per image", averageCaptionsPerImage.toFixed(2)],
              ["Humor flavors", humorFlavorCount],
            ].map(([dt, dd]) => (
              <div key={String(dt)}>
                <dt className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rf-muted)" }}>
                  {dt}
                </dt>
                <dd className="font-clash mt-1 text-2xl" style={{ color: "var(--rf-primary)" }}>
                  {dd}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        {/* Flavor chart */}
        <article
          className="animate-slide-up border p-6"
          style={{ background: "var(--rf-surface)", borderColor: "var(--rf-border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--rf-muted)" }}
          >
            Humor Flavors
          </p>
          <h3
            className="font-clash mt-1 text-2xl uppercase"
            style={{ color: "var(--rf-primary)" }}
          >
            Usage Breakdown
          </h3>

          <div className="mt-5 space-y-4">
            {topFlavorIds.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--rf-muted)" }}>
                No flavor data found.
              </p>
            ) : (
              topFlavorIds.map(([flavorId, count]) => (
                <div key={flavorId} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--rf-primary)" }}>
                      Flavor {flavorId}
                    </span>
                    <span
                      className="px-2 py-0.5 text-xs font-bold"
                      style={{
                        background: "var(--rf-accent)",
                        color: "#fff",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5" style={{ background: "var(--rf-border)" }}>
                    <div
                      className="h-1.5"
                      style={{
                        width: `${Math.max(6, (count / topFlavorIds[0][1]) * 100)}%`,
                        background: "var(--rf-accent)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {/* ── Latest Captions ───────────────────────────────────────── */}
      <article
        className="animate-slide-up border p-6"
        style={{ background: "var(--rf-surface)", borderColor: "var(--rf-border)" }}
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--rf-muted)" }}
            >
              Activity
            </p>
            <h3
              className="font-clash mt-1 text-2xl uppercase"
              style={{ color: "var(--rf-primary)" }}
            >
              Latest Captions
            </h3>
          </div>
          <Link
            href="/admin/captions"
            className="btn-cta px-3 py-2"
          >
            <span className="btn-cta-text">View all →</span>
          </Link>
        </div>

        <div className="space-y-0 border-t" style={{ borderColor: "var(--rf-border)" }}>
          {latestCaptions.length === 0 ? (
            <p className="pt-4 text-sm" style={{ color: "var(--rf-muted)" }}>
              No captions found.
            </p>
          ) : (
            latestCaptions.map((row, index) => (
              <div
                key={`caption-${index}`}
                className="border-b px-0 py-4"
                style={{ borderColor: "var(--rf-border)" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--rf-primary)" }}>
                  {String(row.content ?? "(no caption content found)")}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-wider" style={{ color: "var(--rf-muted)" }}>
                  image_id: {String(row.image_id ?? "unknown")}
                  <span style={{ color: "var(--rf-accent)" }}> · </span>
                  {formatAdminValue(row.created_datetime_utc)}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
