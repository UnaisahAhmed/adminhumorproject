import { notFound } from "next/navigation";
import { AdminTable } from "@/app/admin/admin-table";
import { getAdminTableConfig } from "@/lib/admin-config";
import { requireSuperAdmin } from "@/lib/admin-guard";
import type { GenericRow } from "@/lib/admin-format";

const PAGE_SIZE = 25;

export async function RenderAdminSectionPage({
  section,
  rawPage,
}: {
  section: string;
  rawPage?: string;
}) {
  const config = getAdminTableConfig(section);

  if (!config) {
    notFound();
  }

  const page = Math.max(Number(rawPage ?? "0") || 0, 0);
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireSuperAdmin();
  let query = supabase
    .from(config.table)
    .select(config.columns.join(","))
    .range(from, to);

  if (config.orderBy) {
    query = query.order(config.orderBy, { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (
    <AdminTable
      config={config}
      rows={(data ?? []) as unknown as GenericRow[]}
      page={page}
      pageSize={PAGE_SIZE}
    />
  );
}
