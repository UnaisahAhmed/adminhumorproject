import { AdminTable } from "@/app/admin/admin-table";
import { UploadImageForm } from "@/app/admin/images/upload-image-form";
import { getAdminTableConfig } from "@/lib/admin-config";
import { requireSuperAdmin } from "@/lib/admin-guard";
import type { GenericRow } from "@/lib/admin-format";

const PAGE_SIZE = 25;

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const config = getAdminTableConfig("images");

  if (!config) {
    throw new Error("Images admin config is missing.");
  }

  const { page: rawPage } = await searchParams;
  const page = Math.max(Number(rawPage ?? "0") || 0, 0);
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from(config.table)
    .select(config.columns.join(","))
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <section className="space-y-6">
      <UploadImageForm />
      <AdminTable
        config={config}
        rows={(data ?? []) as unknown as GenericRow[]}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}
